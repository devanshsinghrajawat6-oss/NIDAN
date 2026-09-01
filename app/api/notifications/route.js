import { NextResponse } from 'next/server';
import { connectDB, Notification } from '@/lib/db';
import { computePortfolioKPIs } from '@/lib/kpi';

// Server-Sent Events endpoint for real-time notifications
export async function GET(request) {
  await connectDB();

  // Compute KPI-based alerts and create notifications
  try {
    const kpis = await computePortfolioKPIs();

    // Create notifications for critical alerts
    const notificationsToCreate = [];

    kpis.alerts.overdueReports.forEach(report => {
      notificationsToCreate.push({
        type: 'SAE_DEADLINE',
        severity: 'critical',
        title: `SAE Overdue: ${report.eventId}`,
        message: `SAE report ${report.eventId} is ${report.hoursOverdue} hours overdue for regulatory submission.`,
        trialId: report.trialId,
        targetRoles: ['Admin', 'Pharmacovigilance', 'Investigator'],
        actionUrl: '/dashboard/safety'
      });
    });

    kpis.alerts.iecAlerts.forEach(alert => {
      notificationsToCreate.push({
        type: 'IEC_EXPIRY',
        severity: alert.critical ? 'critical' : 'warning',
        title: `IEC Expiry: ${alert.name}`,
        message: `IEC approval for ${alert.name} expires in ${alert.daysLeft} days.`,
        trialId: alert.trialId,
        targetRoles: ['Admin', 'Investigator', 'Ethics Committee'],
        actionUrl: '/dashboard/milestones'
      });
    });

    kpis.alerts.monitoringAlerts.forEach(alert => {
      notificationsToCreate.push({
        type: 'MONITORING_VISIT',
        severity: 'warning',
        title: `Monitoring Visit Overdue: ${alert.name}`,
        message: `Monitoring visit for ${alert.name} is ${alert.daysOverdue} days overdue.`,
        trialId: alert.trialId,
        targetRoles: ['Admin', 'Monitor'],
        actionUrl: '/dashboard/visits'
      });
    });

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate, { ordered: false }).catch(() => {});
    }

    // Return all unread notifications
    const notifications = await Notification.find({ isRead: false }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ success: true, data: notifications, kpiSummary: kpis.summary });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (body.markAllRead) {
      await Notification.updateMany({}, { isRead: true });
    } else if (body.notificationId) {
      await Notification.findByIdAndUpdate(body.notificationId, { isRead: true });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

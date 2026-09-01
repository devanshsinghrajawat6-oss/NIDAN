import { connectDB, Trial, Patient, AdverseEvent, Visit, Milestone, DataQuery } from '@/lib/db';

/**
 * KPI Engine — computes all real-time KPIs for the AIIA CTMS portfolio.
 * Called by /api/kpis to provide dashboard data.
 */
export async function computePortfolioKPIs() {
  await connectDB();

  const now = new Date();
  const [trials, patients, events, visits, milestones, queries] = await Promise.all([
    Trial.find({}),
    Patient.find({}),
    AdverseEvent.find({}),
    Visit.find({}),
    Milestone.find({}),
    DataQuery.find({})
  ]);

  // ── Enrolment ─────────────────────────────────────────────────────
  const totalEnrolled = patients.length;
  const totalTarget = trials.reduce((s, t) => s + (t.enrollmentTarget || 0), 0);
  const enrolmentRate = totalTarget > 0 ? Math.round((totalEnrolled / totalTarget) * 100) : 0;

  // Per-trial enrolment projections
  const trialKPIs = trials.map(trial => {
    const trialPatients = patients.filter(p => p.trialId === trial.trialId);
    const enrolled = trialPatients.length;
    const target = trial.enrollmentTarget || 100;
    const rate = target > 0 ? Math.round((enrolled / target) * 100) : 0;

    // Lag alert: < 70% of target with < 90 days to close-out
    const daysToClose = trial.studyCloseOutDate
      ? Math.round((new Date(trial.studyCloseOutDate) - now) / (1000 * 60 * 60 * 24))
      : null;
    const enrolmentLag = daysToClose !== null && daysToClose < 90 && rate < 70;

    return {
      trialId: trial.trialId,
      name: trial.name,
      enrolled,
      target,
      rate,
      enrolmentLag,
      daysToClose,
      status: trial.status
    };
  });

  // ── Regulatory Alerts ─────────────────────────────────────────────
  const iecAlerts = trials
    .filter(t => t.iecExpiryDate)
    .map(t => {
      const daysLeft = Math.round((new Date(t.iecExpiryDate) - now) / (1000 * 60 * 60 * 24));
      return { trialId: t.trialId, name: t.name, daysLeft, critical: daysLeft <= 30, warning: daysLeft <= 60 };
    })
    .filter(a => a.daysLeft <= 60);

  const ctriAlerts = trials
    .filter(t => t.nextCTRIUpdateDue)
    .map(t => {
      const daysLeft = Math.round((new Date(t.nextCTRIUpdateDue) - now) / (1000 * 60 * 60 * 24));
      return { trialId: t.trialId, name: t.name, daysLeft, overdue: daysLeft < 0 };
    })
    .filter(a => a.daysLeft <= 30);

  const monitoringAlerts = trials
    .filter(t => t.nextMonitoringVisitDate)
    .map(t => {
      const daysOverdue = Math.round((now - new Date(t.nextMonitoringVisitDate)) / (1000 * 60 * 60 * 24));
      return { trialId: t.trialId, name: t.name, daysOverdue, overdue: daysOverdue > 0 };
    })
    .filter(a => a.overdue);

  // ── Safety Reporting KPIs ─────────────────────────────────────────
  const totalAEs = events.length;
  const openSAEs = events.filter(e => ['SAE', 'SUSAR'].includes(e.eventType) && e.status !== 'Closed').length;
  const overdueReports = events.filter(e => {
    if (!e.regulatoryDeadline) return false;
    return new Date(e.regulatoryDeadline) < now && e.status !== 'Submitted to Regulator' && e.status !== 'Closed';
  });

  const saeReportingCompliance = totalAEs > 0
    ? Math.round(((totalAEs - overdueReports.length) / totalAEs) * 100)
    : 100;

  // ── Visit Compliance ───────────────────────────────────────────────
  const completedVisits = visits.filter(v => v.status === 'Completed').length;
  const missedVisits = visits.filter(v => v.status === 'Missed').length;
  const visitCompliance = (completedVisits + missedVisits) > 0
    ? Math.round((completedVisits / (completedVisits + missedVisits)) * 100)
    : 100;

  // ── Protocol Deviations ────────────────────────────────────────────
  const totalDeviations = trials.reduce((s, t) => s + (t.protocolDeviations || 0), 0);

  // ── Data Quality ───────────────────────────────────────────────────
  const openQueries = queries.filter(q => q.status === 'Open').length;
  const totalQueries = queries.length;
  const dataQueryRate = totalQueries > 0 ? Math.round((openQueries / totalQueries) * 100) : 0;

  // ── Milestone Status ───────────────────────────────────────────────
  const delayedMilestones = milestones.filter(m =>
    ['Delayed', 'At Risk'].includes(m.status) ||
    (m.plannedDate && !m.actualDate && new Date(m.plannedDate) < now)
  ).length;

  return {
    summary: {
      activeTrials: trials.filter(t => t.status === 'Active').length,
      totalTrials: trials.length,
      totalPatients: totalEnrolled,
      totalTarget,
      enrolmentRate,
      openSAEs,
      totalAEs,
      saeReportingCompliance,
      visitCompliance,
      totalDeviations,
      openQueries,
      dataQueryRate,
      delayedMilestones
    },
    trialKPIs,
    alerts: {
      iecAlerts,
      ctriAlerts,
      monitoringAlerts,
      overdueReports: overdueReports.map(e => ({
        eventId: e.eventId, trialId: e.trialId, eventType: e.eventType,
        deadline: e.regulatoryDeadline, hoursOverdue: Math.round((now - new Date(e.regulatoryDeadline)) / (1000 * 60 * 60))
      }))
    },
    computedAt: now.toISOString()
  };
}

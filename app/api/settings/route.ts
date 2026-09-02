import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB, User, ApiKey } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userEmail = session.user.email;

    let user = await User.findOne({ email: userEmail }).select('-password');
    
    // Fallback default structure if user not explicitly found in DB yet
    if (!user) {
      user = {
        email: userEmail,
        name: session.user.name || userEmail.split('@')[0],
        role: (session.user as any).role || 'Investigator',
        organization: 'All India Institute of Ayurveda (AIIA)',
        department: 'Clinical Research & Pharmacovigilance',
        phone: '+91 98765 43210',
        bio: 'Clinical Trial Administrator supervising Ayurvedic drug research and compliance.',
        mfaEnabled: false,
        sessionTimeout: 15,
        notificationPreferences: {
          saeAlerts: true,
          complianceAlerts: true,
          protocolDeviations: true,
          eConsentSignoffs: true,
          regulatoryDeadlines: true,
          digestFrequency: 'Instant'
        }
      };
    }

    const apiKeys = await ApiKey.find({ userEmail }).select('-tokenHash').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          name: user.name || session.user.name,
          email: user.email,
          role: user.role || (session.user as any).role || 'Investigator',
          organization: user.organization || 'All India Institute of Ayurveda (AIIA)',
          department: user.department || 'Clinical Research & Pharmacovigilance',
          phone: user.phone || '+91 98765 43210',
          bio: user.bio || ''
        },
        security: {
          mfaEnabled: !!user.mfaEnabled,
          sessionTimeout: user.sessionTimeout || 15,
          encryptionStatus: 'AES-256-GCM Active',
          activeSessionsCount: 1,
          lastPasswordChange: user.updatedAt || user.createdAt || new Date().toISOString()
        },
        notifications: user.notificationPreferences || {
          saeAlerts: true,
          complianceAlerts: true,
          protocolDeviations: true,
          eConsentSignoffs: true,
          regulatoryDeadlines: true,
          digestFrequency: 'Instant'
        },
        apiKeys
      }
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const userEmail = session.user.email;
    const body = await request.json();
    const { action } = body;

    let user = await User.findOne({ email: userEmail });

    // Handle Profile Update
    if (action === 'update_profile') {
      const { name, organization, department, phone, bio } = body;
      
      if (!user) {
        user = await User.create({
          email: userEmail,
          password: await bcrypt.hash('DefaultPass123!', 10),
          name: name || session.user.name,
          role: (session.user as any).role || 'Investigator',
          organization,
          department,
          phone,
          bio
        });
      } else {
        if (name) user.name = name;
        if (organization) user.organization = organization;
        if (department) user.department = department;
        if (phone) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        await user.save();
      }

      await writeAuditLog({
        action: 'UPDATE_PROFILE',
        resource: 'USER_SETTINGS',
        resourceId: userEmail,
        userId: (session.user as any).id || userEmail,
        userEmail,
        userRole: user.role || 'Investigator',
        newValue: { name, organization, department, phone }
      });

      return NextResponse.json({ success: true, message: 'Profile updated successfully' });
    }

    // Handle Password Change
    if (action === 'change_password') {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Both current and new password are required' }, { status: 400 });
      }

      if (!user) {
        return NextResponse.json({ success: false, error: 'User record not found' }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      await writeAuditLog({
        action: 'CHANGE_PASSWORD',
        resource: 'SECURITY_SETTINGS',
        resourceId: userEmail,
        userId: (session.user as any).id || userEmail,
        userEmail,
        userRole: user.role || 'Investigator'
      });

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    // Handle Notification Preferences Update
    if (action === 'update_notifications') {
      const { preferences } = body;
      if (!preferences) {
        return NextResponse.json({ success: false, error: 'Missing preferences object' }, { status: 400 });
      }

      if (!user) {
        user = await User.create({
          email: userEmail,
          password: await bcrypt.hash('DefaultPass123!', 10),
          name: session.user.name || userEmail.split('@')[0],
          role: (session.user as any).role || 'Investigator',
          notificationPreferences: preferences
        });
      } else {
        user.notificationPreferences = { ...user.notificationPreferences, ...preferences };
        await user.save();
      }

      return NextResponse.json({ success: true, message: 'Notification preferences saved' });
    }

    // Handle Security Settings Update (2FA / Session Timeout)
    if (action === 'update_security') {
      const { mfaEnabled, sessionTimeout } = body;
      
      if (!user) {
        user = await User.create({
          email: userEmail,
          password: await bcrypt.hash('DefaultPass123!', 10),
          name: session.user.name || userEmail.split('@')[0],
          role: (session.user as any).role || 'Investigator',
          mfaEnabled,
          sessionTimeout
        });
      } else {
        if (mfaEnabled !== undefined) user.mfaEnabled = mfaEnabled;
        if (sessionTimeout !== undefined) user.sessionTimeout = sessionTimeout;
        await user.save();
      }

      return NextResponse.json({ success: true, message: 'Security preferences updated' });
    }

    // Handle API Key Generation
    if (action === 'generate_api_key') {
      const { name, scopes, expirationDays } = body;
      if (!name) {
        return NextResponse.json({ success: false, error: 'Key name is required' }, { status: 400 });
      }

      const rawToken = `ndn_live_${crypto.randomBytes(24).toString('hex')}`;
      const maskedToken = `${rawToken.substring(0, 12)}...${rawToken.substring(rawToken.length - 4)}`;
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const keyId = `KEY-${Math.floor(1000 + Math.random() * 9000)}`;

      const expiresAt = expirationDays ? new Date(Date.now() + expirationDays * 86400000) : null;

      const newKey = await ApiKey.create({
        keyId,
        name,
        userEmail,
        maskedToken,
        tokenHash,
        scopes: scopes || ['read:trials'],
        expiresAt
      });

      await writeAuditLog({
        action: 'GENERATE_API_KEY',
        resource: 'API_KEY',
        resourceId: keyId,
        userId: (session.user as any).id || userEmail,
        userEmail,
        userRole: (session.user as any).role || 'Investigator',
        newValue: { keyId, name, scopes }
      });

      return NextResponse.json({
        success: true,
        data: {
          keyId: newKey.keyId,
          name: newKey.name,
          maskedToken: newKey.maskedToken,
          rawToken, // Provided once to user to copy
          scopes: newKey.scopes,
          expiresAt: newKey.expiresAt,
          createdAt: newKey.createdAt
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json({ success: false, error: 'Missing keyId' }, { status: 400 });
    }

    await ApiKey.deleteOne({ keyId, userEmail: session.user.email });

    await writeAuditLog({
      action: 'REVOKE_API_KEY',
      resource: 'API_KEY',
      resourceId: keyId,
      userId: (session.user as any).id || session.user.email,
      userEmail: session.user.email,
      userRole: (session.user as any).role || 'Investigator'
    });

    return NextResponse.json({ success: true, message: 'API key revoked' });
  } catch (error: any) {
    console.error('Error revoking API key:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

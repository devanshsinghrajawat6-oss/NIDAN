import { connectDB, AuditLog } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';

/**
 * Write an immutable audit log entry to MongoDB and anchor the hash to blockchain.
 * Wrap every data-modifying API call with this.
 */
export async function writeAuditLog({ action, resource, resourceId, userId, userEmail, userRole, previousValue, newValue, ipAddress }) {
  try {
    await connectDB();

    // Anchor to blockchain
    let blockchainTxHash;
    try {
      const auditPayload = { action, resource, resourceId, userId, timestamp: new Date().toISOString() };
      blockchainTxHash = await storeOnBlockchain(
        resourceId || resource,
        auditPayload,
        'AUDIT_LOG',
        `${action}:${resource}`
      );
    } catch (bcErr) {
      console.warn('[AUDIT] Blockchain anchoring failed:', bcErr.message);
    }

    await AuditLog.create({
      action,
      resource,
      resourceId,
      userId,
      userEmail,
      userRole,
      previousValue,
      newValue,
      ipAddress,
      blockchainTxHash
    });
  } catch (err) {
    console.error('[AUDIT] Failed to write audit log:', err.message);
    // Never throw — audit failure should not break the primary operation
  }
}

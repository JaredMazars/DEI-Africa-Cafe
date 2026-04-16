import { getData, setData, STORAGE_KEYS } from './dataStore';

export interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  entity: string;
  details: string;
}

export function logAuditAction(action: string, entity: string, details: string) {
  const adminUser = localStorage.getItem('adminUser') || 'Admin';
  
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    admin: adminUser,
    action,
    entity,
    details
  };

  const audits = getData(STORAGE_KEYS.AUDIT_LOG, []) as AuditEntry[];
  audits.push(entry);
  setData(STORAGE_KEYS.AUDIT_LOG, audits);
}


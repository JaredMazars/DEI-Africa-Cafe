import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Download, Filter, Calendar } from 'lucide-react';
import { getData, STORAGE_KEYS } from '../../services/dataStore';
import { AuditEntry } from '../../services/auditLogger';

const AdminAudit: React.FC = () => {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = () => {
    const stored = getData(STORAGE_KEYS.AUDIT_LOG, []) as AuditEntry[];
    setAudits(stored.reverse()); // Most recent first
  };

  const exportAudits = () => {
    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Entity', 'Details'].join(','),
      ...filteredAudits.map(a =>
        [
          new Date(a.timestamp).toLocaleString(),
          a.admin,
          a.action,
          a.entity,
          a.details
        ].map(val => `"${val}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAudits = audits.filter(audit => {
    const matchesSearch =
      audit.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || audit.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actions = [...new Set(audits.map(a => a.action))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-1">Complete history of admin actions</p>
        </div>
        <button
          onClick={exportAudits}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="inline-flex p-3 rounded-lg bg-blue-100 mb-3">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-600 text-sm">Total Actions Logged</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{audits.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit log..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Actions</option>
              {actions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="divide-y divide-gray-200">
          {filteredAudits.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p>No audit entries found</p>
            </div>
          ) : (
            filteredAudits.map((audit) => (
              <div key={audit.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900">{audit.admin}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-600">
                        {new Date(audit.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-2 ${
                        audit.action === 'CREATED' ? 'bg-green-100 text-green-700' :
                        audit.action === 'UPDATED' ? 'bg-blue-100 text-blue-700' :
                        audit.action === 'DELETED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {audit.action}
                      </span>
                      <span className="text-gray-500">{audit.entity}</span> - {audit.details}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAudit;


import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getAuditAPI } from '../services/api';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try {
      const res = await getAuditAPI();
      setLogs(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Layout title="Audit des actions" subtitle="Journal des actions système">
      <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
        {loading ? (
          <div>Chargement…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eef2f7' }}>
                <th style={{ padding: 8 }}>Horodatage</th>
                <th style={{ padding: 8 }}>Utilisateur</th>
                <th style={{ padding: 8 }}>Action</th>
                <th style={{ padding: 8 }}>Cible</th>
                <th style={{ padding: 8 }}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: 8 }}>{new Date(l.created_at).toLocaleString('fr-FR')}</td>
                  <td style={{ padding: 8 }}>{l.userLabel || l.userId}</td>
                  <td style={{ padding: 8 }}>{l.action}</td>
                  <td style={{ padding: 8 }}>{l.targetType}#{l.targetId}</td>
                  <td style={{ padding: 8, fontFamily: 'monospace', fontSize: 12 }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

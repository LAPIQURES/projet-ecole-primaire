import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: "var(--bg-soft)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: 'var(--surface)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 16,
          position: 'sticky', top: 0, zIndex: 10,
          boxShadow: 'none',
        }}>
          <div style={{ flex: 1 }}>
            {title && <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--brand)' }}>{title}</h1>}
              {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1, textTransform: 'capitalize' }}>{subtitle}</div>}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

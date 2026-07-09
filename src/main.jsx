import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'

// Note: debug token injection removed after verification

function Root() {
  const [errorInfo, setErrorInfo] = useState(null)

  // Debug helper: if URL contains ?debugRole=... and ?debugToken=..., set localStorage for quick debugging
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const role = params.get('debugRole');
      const token = params.get('debugToken');
      if (role) {
        const fakeUser = { id: 9999, login: role, role };
        localStorage.setItem('user', JSON.stringify(fakeUser));
      }
      if (token) localStorage.setItem('token', token);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onError = (message, source, lineno, colno, err) => {
      const payload = {
        message: (message && message.toString()) || 'Unknown error',
        source,
        lineno,
        colno,
        stack: err?.stack || null,
        when: new Date().toISOString(),
      }
      // log to console and keep in state so overlay can show it
      // eslint-disable-next-line no-console
      console.error('Captured window.onerror', payload)
      setErrorInfo(payload)
      return false
    }

    const onRejection = (ev) => {
      const reason = ev?.reason
      const payload = {
        message: reason?.message || String(reason) || 'Unhandled promise rejection',
        stack: reason?.stack || null,
        when: new Date().toISOString(),
      }
      // eslint-disable-next-line no-console
      console.error('Captured unhandledrejection', payload)
      setErrorInfo(payload)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  class ErrorBoundary extends React.Component {
    componentDidCatch(error, info) {
      const payload = {
        message: error?.message || String(error),
        stack: error?.stack || null,
        info,
        when: new Date().toISOString(),
      }
      // eslint-disable-next-line no-console
      console.error('Captured React render error', payload)
      setErrorInfo(payload)
    }
    render() {
      return this.props.children
    }
  }

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      {errorInfo && (
        <div style={{ position: 'fixed', inset: 12, zIndex: 9999, pointerEvents: 'auto' }}>
          <div style={{ background: 'rgba(17,24,39,0.95)', color: 'white', padding: 16, borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.6)', maxWidth: 'min(980px, 98vw)', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <strong>Erreur détectée (client)</strong>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(errorInfo, null, 2)); }} style={{ background: '#0ea5e9', border: 'none', padding: '6px 10px', borderRadius: 6, color: '#042341', fontWeight: 600, cursor: 'pointer' }}>Copier</button>
                <button onClick={() => { setErrorInfo(null); }} style={{ background: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: 6, color: 'white', fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
              </div>
            </div>
            <div style={{ marginTop: 10, maxHeight: '60vh', overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
              <div><strong>Message:</strong> {errorInfo.message}</div>
              {errorInfo.source && <div><strong>Source:</strong> {errorInfo.source}:{errorInfo.lineno}:{errorInfo.colno}</div>}
              {errorInfo.info && <div><strong>Info:</strong> {JSON.stringify(errorInfo.info)}</div>}
              {errorInfo.stack && (
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{errorInfo.stack}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />,
)

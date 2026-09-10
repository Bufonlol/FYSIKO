import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 16, textAlign: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 40 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2535', margin: 0 }}>
          Algo salió mal
        </h2>
        <p style={{ fontSize: 13, color: '#8a9ab0', maxWidth: 360, lineHeight: 1.6 }}>
          Ocurrió un error inesperado en esta sección. Intenta recargar la página.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: '#5b84b1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Recargar página
        </button>
      </div>
    )
  }
}

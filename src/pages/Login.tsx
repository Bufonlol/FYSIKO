import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { loginWithSupabase } from '../lib/hooks'
import { Icon } from '../components/ui/Icon'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 2 * 60 * 1000

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const login = useStore(s => s.login)

  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) { setLockedUntil(null); setAttempts(0); setCountdown(0); clearInterval(tick) }
      else setCountdown(remaining)
    }, 1000)
    return () => clearInterval(tick)
  }, [lockedUntil])

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setLoading(true)
    setError('')
    const user = await loginWithSupabase(username.trim(), password)
    if (user) {
      login(user)
    } else {
      const next = attempts + 1
      setAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS)
        setError(`Demasiados intentos. Espera 2 minutos.`)
      } else {
        setError(`Usuario o contraseña incorrectos (${next}/${MAX_ATTEMPTS} intentos)`)
      }
      setLoading(false)
    }
  }

  return (
    <div className="login-shell" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 8, color: '#a8d063' }}>
            FYSIKO
          </div>
          <div style={{ fontSize: 16, marginBottom: 24, color: 'rgba(255,255,255,0.7)' }}>
            Fisioterapia, en movimiento
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Tu plataforma integral de gestión para clínicas de fisioterapia
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1a2535', marginBottom: 6 }}>Bienvenido</div>
          <div style={{ fontSize: 14, color: '#8a9ab0', marginBottom: 28 }}>Inicia sesión para continuar</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>Usuario</label>
              <input value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                style={{
                  width: '100%', height: 42, padding: '0 14px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1a2535',
                  background: '#fff', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#5b84b1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  style={{
                    width: '100%', height: 42, padding: '0 40px 0 14px', borderRadius: 8,
                    border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1a2535',
                    background: '#fff', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#5b84b1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a9ab0', padding: 0,
                }}>
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', color: '#e74c3c', borderRadius: 8, padding: '8px 12px',
                fontSize: 12, fontWeight: 600, border: '1px solid #fecaca',
              }}>
                {error}
                {isLocked && countdown > 0 && (
                  <span style={{ display: 'block', marginTop: 4, fontSize: 11 }}>
                    Intenta de nuevo en {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            )}

            <button type="submit" disabled={loading || isLocked} style={{
              width: '100%', height: 44, borderRadius: 8, border: 'none',
              background: (loading || isLocked) ? '#7aa3c9' : '#5b84b1',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s', marginTop: 4,
            }}>
              {loading ? 'Iniciando...' : isLocked ? `Bloqueado (${countdown}s)` : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#8a9ab0', marginTop: 32 }}>
            © 2026 FYSIKO v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

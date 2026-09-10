import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { NeuralParticles, BlurText, GradientText, ShinyText, ClickSpark } from '../components/animations'
import { loginWithSupabase } from '../lib/hooks'
import { Icon } from '../components/ui/Icon'

// Splash screen component
function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
      animation: 'none', transition: 'opacity 0.5s',
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>
        <span style={{ color: '#5b84b1' }}>FYSIKO</span>
      </div>
      <svg width="160" height="60" viewBox="0 0 160 60" fill="none">
        <path d="M10 50 Q 40 5 80 30 Q 120 55 150 20"
          stroke="#5b84b1" strokeWidth="3" strokeLinecap="round" fill="none"
          strokeDasharray="200" strokeDashoffset="200"
          style={{ animation: 'dashArc 1.4s ease forwards' }}
        />
        <path d="M10 50 Q 40 5 80 30 Q 120 55 150 20"
          stroke="#8db84a" strokeWidth="3" strokeLinecap="round" fill="none"
          strokeDasharray="200" strokeDashoffset="200" opacity="0.5"
          style={{ animation: 'dashArc 1.4s ease 0.2s forwards' }}
        />
      </svg>
      <div style={{ width: 220, height: 3, background: '#f0f2f5', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #5b84b1, #8db84a)',
          animation: 'splashBar 1.8s ease forwards',
        }} />
      </div>
      <p style={{ fontSize: 12, color: '#8a9ab0', fontWeight: 600 }}>Sistema de Gestión FYSIKO</p>
    </div>
  )
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 2 * 60 * 1000

export function Login() {
  // Only show splash once per browser session (not on every logout)
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'))
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

  if (showSplash) return <Splash onDone={() => { sessionStorage.setItem('splashShown', '1'); setShowSplash(false) }} />

  return (
    <div className="login-shell" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel */}
      <div className="login-left">
        <NeuralParticles count={70} color="#7aa3c9" lineColor="#5b84b1" speed={0.35} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 420 }}>
<div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 8 }}>
            <GradientText colors={['#7aa3c9', '#a8d063', '#7aa3c9']}>
              FYSIKO
            </GradientText>
          </div>
          <ShinyText style={{ fontSize: 16, marginBottom: 32, display: 'block' }}>
            Gestión clínica, simplificada
          </ShinyText>

          {/* Dental arc SVG */}
          <svg width="200" height="70" viewBox="0 0 200 70" fill="none" style={{ marginBottom: 28 }} className="login-arc">
            <path d="M15 60 Q 50 8 100 35 Q 150 62 185 18"
              stroke="#7aa3c9" strokeWidth="2.5" strokeLinecap="round" fill="none"
              strokeDasharray="220" strokeDashoffset="220"
              style={{ animation: 'dashArc 1.8s ease 0.3s forwards' }}
            />
            <circle cx="100" cy="35" r="4" fill="#a8d063" opacity="0.8" />
            <circle cx="50" cy="25" r="3" fill="#7aa3c9" opacity="0.6" />
            <circle cx="150" cy="35" r="3" fill="#7aa3c9" opacity="0.6" />
          </svg>

          <BlurText text="Tu plataforma integral de gestión para negocios modernos" delay={60}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, display: 'block', marginBottom: 32 }}
          />

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            {[['3', 'Sucursales'], ['5', 'Doctores'], ['128', 'Citas/mes']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#a8d063' }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <BlurText text="Bienvenido" delay={50} style={{ fontSize: 28, fontWeight: 800, color: '#1a2535', display: 'block', marginBottom: 6 }} />
          <BlurText text="Inicia sesión para continuar" delay={40}
            style={{ fontSize: 14, color: '#8a9ab0', display: 'block', marginBottom: 28 }}
          />

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

            <ClickSpark color="#5b84b1" spread={50}>
              <button type="submit" disabled={loading || isLocked} style={{
                width: '100%', height: 44, borderRadius: 8, border: 'none',
                background: (loading || isLocked) ? '#7aa3c9' : '#5b84b1',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s', marginTop: 4,
                boxShadow: '0 4px 16px rgba(91,132,177,0.3)',
              }}
                onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(91,132,177,0.4)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(91,132,177,0.3)' }}
              >
                {loading ? 'Iniciando...' : isLocked ? `Bloqueado (${countdown}s)` : 'Iniciar sesión'}
              </button>
            </ClickSpark>
          </form>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#8a9ab0', marginTop: 32 }}>
            © 2026 FYSIKO v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

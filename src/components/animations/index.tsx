import { useState, useEffect, useRef, useCallback, CSSProperties, ReactNode } from 'react'

// ── BlurText ────────────────────────────────────────────────────────────────
interface BlurTextProps {
  text: string
  delay?: number
  className?: string
  style?: CSSProperties
  as?: keyof JSX.IntrinsicElements
}
export function BlurText({ text, delay = 80, className = '', style = {}, as: Tag = 'span' }: BlurTextProps) {
  const words = text.split(' ')
  const [visible, setVisible] = useState<number[]>([])
  const ref = useRef<HTMLElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true
        words.forEach((_, i) => setTimeout(() => setVisible(v => [...v, i]), i * delay))
      }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [text])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={className} style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <span key={i} style={{
          display: 'inline-block', marginRight: '0.28em',
          transition: `opacity 0.55s ease ${i * delay}ms, filter 0.55s ease ${i * delay}ms, transform 0.55s ease ${i * delay}ms`,
          opacity: visible.includes(i) ? 1 : 0,
          filter: visible.includes(i) ? 'blur(0)' : 'blur(10px)',
          transform: visible.includes(i) ? 'translateY(0)' : 'translateY(10px)',
        }}>{word}</span>
      ))}
    </Tag>
  )
}

// ── GradientText ─────────────────────────────────────────────────────────────
interface GradientTextProps {
  children: ReactNode
  colors?: string[]
  speed?: number
  className?: string
  style?: CSSProperties
}
export function GradientText({ children, colors = ['#7aa3c9', '#a8d063', '#7aa3c9'], speed = 4, className = '', style = {} }: GradientTextProps) {
  return (
    <span className={className} style={{
      background: `linear-gradient(90deg, ${colors.join(', ')})`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: `gradientShift ${speed}s linear infinite`,
      display: 'inline-block',
      ...style,
    }}>{children}</span>
  )
}

// ── ShinyText ────────────────────────────────────────────────────────────────
interface ShinyTextProps {
  children: ReactNode
  speed?: number
  className?: string
  style?: CSSProperties
}
export function ShinyText({ children, speed = 3, className = '', style = {} }: ShinyTextProps) {
  return (
    <span className={className} style={{
      display: 'inline-block',
      color: 'rgba(255,255,255,0.55)',
      backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 70%)',
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: `shineSwipe ${speed}s linear infinite`,
      ...style,
    }}>{children}</span>
  )
}

// ── CountUp ──────────────────────────────────────────────────────────────────
interface CountUpProps {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  style?: CSSProperties
}
export function CountUp({ to, duration = 1200, prefix = '', suffix = '', decimals = 0, className = '', style = {} }: CountUpProps) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const fired = useRef(false)

  useEffect(() => {
    fired.current = false   // reset so animation re-fires when `to` changes (e.g. data loads)
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
          setVal(+(to * ease).toFixed(decimals))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [to, duration])

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('es-MX')
  return <span ref={ref} className={className} style={style}>{prefix}{display}{suffix}</span>
}

// ── ClickSpark ────────────────────────────────────────────────────────────────
interface Spark { id: string; x: number; y: number; angle: number }
interface ClickSparkProps {
  children: ReactNode
  color?: string
  count?: number
  size?: number
  duration?: number
  spread?: number
}
export function ClickSpark({ children, color = '#5b84b1', count = 8, size = 5, duration = 600, spread = 40 }: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    const newSparks: Spark[] = Array.from({ length: count }, (_, i) => ({
      id: `${id}-${i}`, x, y, angle: (360 / count) * i,
    }))
    setSparks(s => [...s, ...newSparks])
    setTimeout(() => setSparks(s => s.filter(sp => !newSparks.find(n => n.id === sp.id))), duration)
  }, [count, duration])

  return (
    <span style={{ position: 'relative', display: 'inline-block' }} onClick={handleClick}>
      {sparks.map(spark => {
        const rad = (spark.angle * Math.PI) / 180
        const tx = Math.cos(rad) * spread
        const ty = Math.sin(rad) * spread
        return (
          <span key={spark.id} style={{
            position: 'absolute', left: spark.x, top: spark.y,
            width: size, height: size, borderRadius: '50%',
            background: color, pointerEvents: 'none',
            transform: 'translate(-50%,-50%)',
            animation: `sparkFly ${duration}ms ease-out forwards`,
            '--tx': `${tx}px`, '--ty': `${ty}px`,
          } as CSSProperties} />
        )
      })}
      {children}
    </span>
  )
}

// ── FadeContent ───────────────────────────────────────────────────────────────
interface FadeContentProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  blur?: boolean
  className?: string
  style?: CSSProperties
}
export function FadeContent({ children, delay = 0, direction = 'up', blur = false, className = '', style = {} }: FadeContentProps) {
  return (
    <div className={`fade-content ${className}`.trim()} data-direction={direction} data-blur={blur || undefined} style={{
      animationDelay: `${Math.min(delay, 180)}ms`,
      ...style,
    }}>{children}</div>
  )
}

// ── TiltCard ──────────────────────────────────────────────────────────────────
interface TiltCardProps {
  children: ReactNode
  intensity?: number
  className?: string
  style?: CSSProperties
  onClick?: () => void
}
export function TiltCard({ children, intensity = 8, className = '', style = {}, onClick }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, shine: { x: 50, y: 50 } })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    setTilt({ x: -dy * intensity, y: dx * intensity, shine: { x: (dx + 1) / 2 * 100, y: (dy + 1) / 2 * 100 } })
  }
  const handleLeave = () => setTilt({ x: 0, y: 0, shine: { x: 50, y: 50 } })

  return (
    <div ref={ref} className={className}
      onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={onClick}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x || tilt.y ? 1.02 : 1})`,
        transition: 'transform 0.12s ease',
        position: 'relative', overflow: 'hidden',
        ...style,
      }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: `radial-gradient(circle at ${tilt.shine.x}% ${tilt.shine.y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
        zIndex: 1,
      }} />
      {children}
    </div>
  )
}

// ── NeuralParticles ────────────────────────────────────────────────────────────
interface NeuralParticlesProps {
  count?: number
  color?: string
  lineColor?: string
  speed?: number
}
export function NeuralParticles({ count = 70, color = '#7aa3c9', lineColor = '#5b84b1', speed = 0.4 }: NeuralParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
      r: 1.5 + Math.random() * 2, pulse: Math.random() * Math.PI * 2,
    }))

    const MAX_DIST = 130, MOUSE_DIST = 160

    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.pulse += 0.03
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < MOUSE_DIST && d > 0) {
          const force = (MOUSE_DIST - d) / MOUSE_DIST
          p.vx += (dx / d) * force * 0.096
          p.vy += (dy / d) * force * 0.096
        }
        p.vx *= 0.98; p.vy *= 0.98
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const maxSpd = speed * 3
        if (spd > maxSpd) { p.vx = (p.vx / spd) * maxSpd; p.vy = (p.vy / spd) * maxSpd }
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) { p.x = 0; p.vx *= -1 }
        if (p.x > W) { p.x = W; p.vx *= -1 }
        if (p.y < 0) { p.y = 0; p.vy *= -1 }
        if (p.y > H) { p.y = H; p.vy *= -1 }
        const alpha = 0.5 + 0.3 * Math.sin(p.pulse)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * (1 + 0.2 * Math.sin(p.pulse)), 0, Math.PI * 2)
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.35
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = lineColor + Math.round(alpha * 255).toString(16).padStart(2, '0')
            ctx.lineWidth = 0.8; ctx.stroke()
          }
        }
        const p = particles[i]
        const mdx = p.x - mouse.current.x, mdy = p.y - mouse.current.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < MOUSE_DIST) {
          const alpha = (1 - md / MOUSE_DIST) * 0.6
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.current.x, mouse.current.y)
          ctx.strokeStyle = '#a8d063' + Math.round(alpha * 255).toString(16).padStart(2, '0')
          ctx.lineWidth = 1.2; ctx.stroke()
        }
      }
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 } }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(animRef.current); ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'all', zIndex: 1 }} />
}

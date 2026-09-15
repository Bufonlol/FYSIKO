import React from 'react'
import { colors, headlineFamily } from './theme'
import { riseIn, popIn, barGrow } from './anim'
import { Eyebrow, H, Pill, MiniHeaderDesktop, MiniHeaderMobile, WaButton, Chip } from './LandingUI'
import heroSprint from './art/heroSprint'
import aboutTraining from './art/aboutTraining'
import sportTrail from './art/sportTrail'
import painBack from './art/painBack'
import painKnee from './art/painKnee'
import painShoulder from './art/painShoulder'
import painNeck from './art/painNeck'
import { mobilityIllustration, runningIllustration, strengthIllustration, balanceIllustration } from './generatedIllustrations'

// ───────────────────────────── Hero ─────────────────────────────

export function HeroDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={0} />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <img src={heroSprint} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, rgba(4,25,43,0.97) 0%, rgba(4,25,43,0.78) 42%, rgba(4,25,43,0.05) 74%)`,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 46px', maxWidth: 560 }}>
          <div style={{ ...riseIn(2) }}>
            <Eyebrow light>Fisioterapia en Orizaba</Eyebrow>
          </div>
          <div style={{ ...riseIn(8), fontFamily: headlineFamily, fontWeight: 900, textTransform: 'uppercase', fontSize: 58, lineHeight: 0.84, color: '#fff', margin: '12px 0 10px' }}>
            Recupera tu
            <br />
            <span style={{ color: colors.blueSoft }}>movimiento.</span>
          </div>
          <div style={{ ...riseIn(16), fontFamily: headlineFamily, fontWeight: 800, textTransform: 'uppercase', fontSize: 20, color: '#fff', marginBottom: 12 }}>
            Vuelve a sentirte bien.
          </div>
          <div style={{ ...riseIn(22), fontSize: 13.5, lineHeight: 1.6, color: '#d9e4ea', marginBottom: 20, maxWidth: 400 }}>
            Valoración, rehabilitación y ejercicio para reducir dolor y volver a hacer lo que te gusta.
          </div>
          <div style={{ ...riseIn(28), display: 'flex', gap: 10 }}>
            <Pill>Agendar valoración</Pill>
            <Pill outline light>
              Conocer servicios
            </Pill>
          </div>
        </div>
      </div>
    </>
  )
}

export function HeroMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <img src={heroSprint} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '64% center' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(0deg, rgba(4,25,43,0.98) 8%, rgba(4,25,43,0.55) 55%, rgba(4,25,43,0.1))` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 18px 22px' }}>
          <div style={{ ...riseIn(4) }}>
            <Eyebrow light>Fisioterapia en Orizaba</Eyebrow>
          </div>
          <div style={{ ...riseIn(10), fontFamily: headlineFamily, fontWeight: 900, textTransform: 'uppercase', fontSize: 34, lineHeight: 0.86, color: '#fff', margin: '8px 0' }}>
            Recupera tu <span style={{ color: colors.blueSoft }}>movimiento.</span>
          </div>
          <div style={{ ...riseIn(18), fontSize: 11.5, lineHeight: 1.55, color: '#d9e4ea', marginBottom: 14 }}>
            Valoración, rehabilitación y ejercicio para volver a lo que te gusta.
          </div>
          <div style={{ ...riseIn(24) }}>
            <Pill size="sm">Agendar valoración</Pill>
          </div>
        </div>
      </div>
    </>
  )
}

// ───────────────────────────── Pain points ─────────────────────────────

const pains = [
  { title: 'Dolor de espalda', sub: 'Postura y zona lumbar', img: painBack },
  { title: 'Dolor de rodilla', sub: 'Lesiones y sobrecarga', img: painKnee },
  { title: 'Dolor de hombro', sub: 'Fuerza y movilidad', img: painShoulder },
  { title: 'Dolor de cuello', sub: 'Tensión y control', img: painNeck },
]

export function PainDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={0} />
      <div style={{ flex: 1, background: colors.white, padding: '30px 40px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ ...riseIn(2), textAlign: 'center', marginBottom: 20 }}>
          <Eyebrow>Empieza por lo que sientes</Eyebrow>
          <H size={32} style={{ marginTop: 6 }}>¿Qué te impide moverte como antes?</H>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, minHeight: 0 }}>
          {pains.map((p, i) => (
            <div key={p.title} style={{ ...popIn(10 + i * 6, 0.92), border: `1px solid ${colors.line}`, borderRadius: 10, overflow: 'hidden', background: '#fff', boxShadow: '0 8px 24px rgba(8,43,74,0.06)', display: 'flex', flexDirection: 'column' }}>
              <img src={p.img as string} alt="" style={{ width: '100%', height: '58%', objectFit: 'cover' }} />
              <div style={{ padding: 12, flex: 1 }}>
                <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 17, textTransform: 'uppercase', color: colors.ink }}>{p.title}</div>
                <div style={{ fontSize: 10.5, color: colors.text3, marginTop: 3 }}>{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function PainMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.white, padding: '18px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, gap: 12 }}>
        <div style={{ ...riseIn(4) }}>
          <Eyebrow>Empieza por lo que sientes</Eyebrow>
          <H size={22} style={{ marginTop: 6 }}>¿Qué te impide moverte?</H>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minHeight: 0 }}>
          {pains.map((p, i) => (
            <div key={p.title} style={{ ...popIn(10 + i * 6, 0.92), border: `1px solid ${colors.line}`, borderRadius: 9, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <img src={p.img as string} alt="" style={{ width: '100%', height: 74, objectFit: 'cover' }} />
              <div style={{ padding: 9 }}>
                <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 13.5, textTransform: 'uppercase', color: colors.ink, lineHeight: 1 }}>{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ───────────────────────────── Servicios ─────────────────────────────

const services = [
  { title: 'Fisioterapia general', sub: 'Valoración y plan para recuperar función.', img: mobilityIllustration },
  { title: 'Rehabilitación deportiva', sub: 'Regresa a entrenar con seguridad.', img: runningIllustration },
  { title: 'Traumatología y ortopedia', sub: 'Recuperación muscular y articular.', img: strengthIllustration },
  { title: 'Rehabilitación neurológica', sub: 'Trabajo funcional adaptado a ti.', img: balanceIllustration },
]

export function ServicesDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={1} />
      <div style={{ flex: 1, background: colors.soft, padding: '30px 40px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ ...riseIn(2), textAlign: 'center', marginBottom: 18 }}>
          <Eyebrow>Nuestros servicios</Eyebrow>
          <H size={32} style={{ marginTop: 6 }}>Tratamientos pensados para tu vida</H>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, minHeight: 0 }}>
          {services.map((s, i) => (
            <div key={s.title} style={{ ...popIn(10 + i * 6, 0.92), position: 'relative', borderRadius: 12, overflow: 'hidden', background: colors.navy, boxShadow: '0 14px 34px rgba(8,43,74,0.14)' }}>
              <img src={s.img as string} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: '28% 0 0', background: 'linear-gradient(180deg, transparent 0%, rgba(4,27,47,0.86) 50%, rgba(4,27,47,0.98) 100%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 13px' }}>
                <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 17, lineHeight: 0.95, color: '#fff', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 9.5, color: '#d3e0e8', lineHeight: 1.35 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function ServicesMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.soft, padding: '18px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, gap: 12 }}>
        <div style={{ ...riseIn(4) }}>
          <Eyebrow>Nuestros servicios</Eyebrow>
          <H size={22} style={{ marginTop: 6 }}>Tratamientos para tu vida</H>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minHeight: 0 }}>
          {services.map((s, i) => (
            <div key={s.title} style={{ ...popIn(10 + i * 6, 0.92), position: 'relative', borderRadius: 10, overflow: 'hidden', background: colors.navy }}>
              <img src={s.img as string} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: '25% 0 0', background: 'linear-gradient(180deg, transparent 0%, rgba(4,27,47,0.9) 55%, rgba(4,27,47,0.98) 100%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '9px 10px' }}>
                <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 13, lineHeight: 0.95, color: '#fff' }}>{s.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ───────────────────────────── Proceso ─────────────────────────────

const steps = [
  { n: '01', title: 'Agenda tu valoración', sub: 'Cuéntanos qué necesitas y elegimos horario.' },
  { n: '02', title: 'Evaluamos tu caso', sub: 'Revisamos movilidad, historia y objetivos.' },
  { n: '03', title: 'Plan personalizado', sub: 'Definimos acciones claras para ti.' },
  { n: '04', title: 'Seguimiento', sub: 'Medimos avances y ajustamos el plan.' },
]

export function ProcessDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={2} />
      <div style={{ flex: 1, background: colors.navy, padding: '36px 44px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ ...riseIn(2), marginBottom: 26 }}>
          <Eyebrow light>Tu recuperación, paso a paso</Eyebrow>
          <H size={30} style={{ color: '#fff', marginTop: 6 }}>Empieza con una buena evaluación</H>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 26, alignContent: 'start' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ ...riseIn(10 + i * 7), borderTop: '1px solid #47667e', paddingTop: 16 }}>
              <div style={{ fontFamily: headlineFamily, fontWeight: 900, fontSize: 26, color: colors.blueSoft }}>{s.n}</div>
              <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 18, textTransform: 'uppercase', color: '#fff', margin: '10px 0 6px' }}>{s.title}</div>
              <div style={{ fontSize: 11, color: '#b8c7d2', lineHeight: 1.5 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function ProcessMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.navy, padding: '20px 18px', display: 'flex', flexDirection: 'column', minHeight: 0, gap: 4 }}>
        <div style={{ ...riseIn(4), marginBottom: 12 }}>
          <Eyebrow light>Paso a paso</Eyebrow>
          <H size={20} style={{ color: '#fff', marginTop: 6 }}>Tu recuperación</H>
        </div>
        {steps.map((s, i) => (
          <div key={s.n} style={{ ...riseIn(10 + i * 7), display: 'flex', gap: 12, borderTop: '1px solid #2c4a63', padding: '12px 0' }}>
            <div style={{ fontFamily: headlineFamily, fontWeight: 900, fontSize: 20, color: colors.blueSoft, width: 30 }}>{s.n}</div>
            <div>
              <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 14, textTransform: 'uppercase', color: '#fff' }}>{s.title}</div>
              <div style={{ fontSize: 10, color: '#b8c7d2', marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ───────────────────────────── Nosotros ─────────────────────────────

export function AboutDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={3} />
      <div style={{ flex: 1, background: colors.white, padding: '30px 44px', display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 40, alignItems: 'center', minHeight: 0 }}>
        <div style={{ ...riseIn(4), height: '100%', borderRadius: 12, overflow: 'hidden' }}>
          <img src={aboutTraining} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ ...riseIn(10) }}>
            <Eyebrow>Sobre FYSIKO</Eyebrow>
            <H size={34} style={{ margin: '8px 0 14px' }}>
              Tratamiento personalizado.
              <br />
              <span style={{ color: colors.blue }}>Atención humana.</span>
            </H>
            <div style={{ fontSize: 13, lineHeight: 1.65, color: colors.text2, marginBottom: 16, maxWidth: 420 }}>
              Escuchamos tu historia, evaluamos tu movimiento y construimos un plan que tenga sentido para tu vida.
            </div>
          </div>
          <div style={{ ...riseIn(18), display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
            <Chip>Objetivos claros</Chip>
            <Chip>Progreso medible</Chip>
            <Chip>Acompañamiento cercano</Chip>
          </div>
          <div style={{ ...riseIn(24) }}>
            <Pill>Conoce FYSIKO</Pill>
          </div>
        </div>
      </div>
    </>
  )
}

export function AboutMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.white, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ ...riseIn(4), height: 180, flexShrink: 0 }}>
          <img src={aboutTraining} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ ...riseIn(10) }}>
            <Eyebrow>Sobre FYSIKO</Eyebrow>
            <H size={21} style={{ margin: '7px 0 10px' }}>
              Tratamiento personalizado. <span style={{ color: colors.blue }}>Atención humana.</span>
            </H>
            <div style={{ fontSize: 11, lineHeight: 1.55, color: colors.text2, marginBottom: 12 }}>
              Escuchamos, evaluamos y construimos un plan con sentido para tu vida.
            </div>
          </div>
          <div style={{ ...riseIn(18), display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <Chip>Objetivos claros</Chip>
            <Chip>Progreso medible</Chip>
          </div>
          <div style={{ ...riseIn(22) }}>
            <Pill size="sm">Conoce FYSIKO</Pill>
          </div>
        </div>
      </div>
    </>
  )
}

// ───────────────────────────── Deportiva ─────────────────────────────

export function SportDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={1} />
      <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', alignItems: 'center' }}>
        <img src={sportTrail} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(4,27,47,0.18), rgba(4,27,47,0.97) 62%)' }} />
        <div style={{ position: 'relative', zIndex: 1, marginLeft: '52%', paddingRight: 40, maxWidth: 460 }}>
          <div style={{ ...riseIn(4) }}>
            <Eyebrow light>Rehabilitación deportiva</Eyebrow>
          </div>
          <div style={{ ...riseIn(10), fontFamily: headlineFamily, fontWeight: 900, textTransform: 'uppercase', fontSize: 42, lineHeight: 0.9, color: '#fff', margin: '10px 0 14px' }}>
            ¿Te duele entrenar?
            <br />
            <span style={{ color: colors.blueSoft }}>No lo ignores.</span>
          </div>
          <div style={{ ...riseIn(18), fontSize: 13, lineHeight: 1.6, color: '#d2dee6', marginBottom: 18 }}>
            Entiende qué está pasando y vuelve más fuerte, seguro y preparado.
          </div>
          <div style={{ ...riseIn(24) }}>
            <Pill>Valoración deportiva</Pill>
          </div>
        </div>
      </div>
    </>
  )
}

export function SportMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.navy, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ ...riseIn(4), height: 190, flexShrink: 0 }}>
          <img src={sportTrail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '37% 40%' }} />
        </div>
        <div style={{ padding: '18px 18px 20px' }}>
          <div style={{ ...riseIn(10) }}>
            <Eyebrow light>Rehabilitación deportiva</Eyebrow>
          </div>
          <div style={{ ...riseIn(16), fontFamily: headlineFamily, fontWeight: 900, textTransform: 'uppercase', fontSize: 27, lineHeight: 0.9, color: '#fff', margin: '8px 0 10px' }}>
            ¿Te duele entrenar? <span style={{ color: colors.blueSoft }}>No lo ignores.</span>
          </div>
          <div style={{ ...riseIn(20), fontSize: 11, lineHeight: 1.55, color: '#d7e5ee', marginBottom: 14 }}>
            Vuelve más fuerte, seguro y preparado.
          </div>
          <div style={{ ...riseIn(26) }}>
            <Pill size="sm">Valoración deportiva</Pill>
          </div>
        </div>
      </div>
    </>
  )
}

// ───────────────────────────── Testimonios ─────────────────────────────

const testimonials = [
  { initials: 'MG', text: 'Llegué con dolor y hoy puedo trabajar y entrenar sin miedo.' },
  { initials: 'LR', text: 'Me explicaron cada paso y el avance se sintió todos los días.' },
  { initials: 'CT', text: 'La atención fue cercana y el plan se adaptó a mis objetivos.' },
]

export function TestimonialsDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={3} />
      <div style={{ flex: 1, background: colors.soft, padding: '32px 44px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ ...riseIn(2), textAlign: 'center', marginBottom: 22 }}>
          <Eyebrow>Historias reales</Eyebrow>
          <H size={30} style={{ marginTop: 6 }}>Personas que volvieron a moverse</H>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {testimonials.map((t, i) => (
            <div key={t.initials} style={{ ...popIn(10 + i * 8, 0.92), background: '#fff', border: `1px solid ${colors.line}`, borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 40, color: colors.blue, lineHeight: 1 }}>“</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: colors.ink, flex: 1, marginTop: 4 }}>{t.text}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: colors.navy, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.initials}</div>
                <span style={{ fontSize: 10.5, color: colors.text3 }}>Paciente FYSIKO</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function TestimonialsMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.soft, padding: '18px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, gap: 12 }}>
        <div style={{ ...riseIn(4) }}>
          <Eyebrow>Historias reales</Eyebrow>
          <H size={20} style={{ marginTop: 6 }}>Volvieron a moverse</H>
        </div>
        {testimonials.slice(0, 2).map((t, i) => (
          <div key={t.initials} style={{ ...popIn(10 + i * 8, 0.92), background: '#fff', border: `1px solid ${colors.line}`, borderRadius: 11, padding: 16 }}>
            <div style={{ fontSize: 11.5, lineHeight: 1.5, color: colors.ink }}>{t.text}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: colors.navy, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.initials}</div>
              <span style={{ fontSize: 9.5, color: colors.text3 }}>Paciente FYSIKO</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ───────────────────────────── Contacto ─────────────────────────────

export function ContactDesktop() {
  return (
    <>
      <MiniHeaderDesktop active={5} />
      <div style={{ flex: 1, background: colors.white, padding: '30px 44px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, minHeight: 0 }}>
        <div style={{ ...riseIn(4) }}>
          <Eyebrow>Visítanos</Eyebrow>
          <H size={26} style={{ margin: '6px 0 16px' }}>Estamos en Orizaba.</H>
          {[
            { label: 'Dirección', val: 'Norte 6 #911, col. Centro, Orizaba, Ver.' },
            { label: 'Horario', val: 'Lun–Sáb 9:00–21:00 · Dom 9:00–13:00' },
            { label: 'Teléfono', val: '272 356 5429' },
          ].map((r, i) => (
            <div key={r.label} style={{ ...riseIn(10 + i * 6), padding: '12px 0', borderBottom: `1px solid ${colors.line}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: colors.ink }}>{r.label}</div>
              <div style={{ fontSize: 11.5, color: colors.text2, marginTop: 3 }}>{r.val}</div>
            </div>
          ))}
        </div>
        <div style={{ ...riseIn(16), background: colors.navy, borderRadius: 12, padding: 26, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Eyebrow light>Contacto directo</Eyebrow>
          <H size={24} style={{ color: '#fff', margin: '8px 0 16px' }}>Hablemos de tu caso.</H>
          {['WhatsApp · 272 356 5429', 'Llámanos · 272 356 5429'].map((l) => (
            <div key={l} style={{ borderTop: '1px solid #31516a', padding: '13px 0', fontSize: 12, fontWeight: 700 }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function ContactMobile() {
  return (
    <>
      <MiniHeaderMobile />
      <div style={{ flex: 1, background: colors.white, padding: '18px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, gap: 14, position: 'relative' }}>
        <div style={{ ...riseIn(4) }}>
          <Eyebrow>Visítanos</Eyebrow>
          <H size={20} style={{ margin: '6px 0 10px' }}>Estamos en Orizaba.</H>
          <div style={{ fontSize: 11, color: colors.text2, lineHeight: 1.5 }}>Norte 6 #911, col. Centro, Orizaba, Ver.</div>
        </div>
        <div style={{ ...riseIn(14), background: colors.navy, borderRadius: 11, padding: 18, color: '#fff' }}>
          <Eyebrow light>Contacto directo</Eyebrow>
          <div style={{ fontFamily: headlineFamily, fontWeight: 800, fontSize: 18, textTransform: 'uppercase', margin: '6px 0 12px' }}>Hablemos de tu caso.</div>
          <div style={{ fontSize: 11, fontWeight: 700, borderTop: '1px solid #31516a', padding: '10px 0' }}>WhatsApp · 272 356 5429</div>
          <div style={{ fontSize: 11, fontWeight: 700, borderTop: '1px solid #31516a', padding: '10px 0' }}>Llámanos · 272 356 5429</div>
        </div>
        <WaButton />
      </div>
    </>
  )
}

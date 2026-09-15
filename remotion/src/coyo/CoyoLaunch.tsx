import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { c, headline, body, FONT_FACE_CSS } from './theme'
import { seg, windowP, EASE, EASE_OUT, EASE_IN, SCENES } from './timeline'
import { Phone3D, GroundShadow, PhoneT } from './Phone3D'
import { ScrollReel, ScreenImage, PagedScreen } from './ScreenContent'
import { KineticLine, AccentLine } from './KineticText'

const BG = `radial-gradient(1400px 1000px at 50% 8%, #0d3a63 0%, ${c.navy} 42%, ${c.navyDeep} 100%)`

export function CoyoLaunch() {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: body, overflow: 'hidden' }}>
      <style>{FONT_FACE_CSS}</style>

      <Hook frame={frame} />
      <Reveal frame={frame} />
      <Flow frame={frame} />
      <Services frame={frame} />
      <Detail frame={frame} />
      <Contact frame={frame} />
      <Signature frame={frame} width={width} height={height} />
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 1 — HOOK ───────────────────────────

function Hook({ frame }: { frame: number }) {
  const [s, e] = SCENES.hook
  if (frame < s - 2 || frame > e + 14) return null

  const groupExit = seg(frame, [
    { f: e - 16, v: 1 },
    { f: e - 2, v: 0, ease: EASE_IN },
  ])
  const groupScale = interpolate(groupExit, [0, 1], [0.94, 1])

  // whoosh: phone-edge flash sweeping across, cutting into scene 2
  const flashX = seg(frame, [
    { f: e - 10, v: -260 },
    { f: e + 4, v: 1340, ease: EASE_IN },
  ])

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: frame > e + 12 ? 0 : 1 }}>
      <div style={{ transform: `scale(${groupScale})`, opacity: groupExit, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <KineticLine frame={frame} in={4} hold={20} out={e - 4}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 158, lineHeight: 0.86, color: '#fff', letterSpacing: -2 }}>FYSIKO</div>
        </KineticLine>
        <AccentLine frame={frame} in={20} hold={28} out={e - 4} width={280} style={{ margin: '10px 0 18px' }} />
        <KineticLine frame={frame} in={26} hold={42} out={e - 4}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 52, letterSpacing: 1, color: c.blueSoft, textTransform: 'uppercase' }}>
            Ya tiene nueva web.
          </div>
        </KineticLine>
      </div>

      {/* phone-edge whoosh */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: flashX,
          width: 30,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), #bfe3ff, transparent)',
          filter: 'blur(2px)',
        }}
      />
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 2 — PHONE REVEAL ───────────────────────────

function revealT(frame: number): PhoneT {
  const [s] = SCENES.reveal
  return {
    x: seg(frame, [{ f: s, v: 210 }, { f: s + 75, v: 0, ease: EASE_OUT }]),
    y: seg(frame, [{ f: s, v: -30 }, { f: s + 95, v: -40 }]),
    z: seg(frame, [{ f: s, v: 260 }, { f: s + 95, v: 40, ease: EASE_OUT }]),
    rotX: seg(frame, [{ f: s, v: 4 }, { f: s + 95, v: 0 }]),
    rotY: seg(frame, [{ f: s, v: -74 }, { f: s + 92, v: 0, ease: EASE }]),
    scale: seg(frame, [{ f: s, v: 0.9 }, { f: s + 95, v: 1 }]),
  }
}

function Reveal({ frame }: { frame: number }) {
  const [s, e] = SCENES.reveal
  if (frame < s - 4 || frame > e + 4) return null
  const t = revealT(Math.min(frame, e))
  const shadowOpacity = windowP(frame, s, s + 30, e - 10, e + 4) * 0.5

  return (
    <AbsoluteFill>
      <GroundShadow opacity={shadowOpacity} width={520} blur={60} />

      <div style={{ position: 'absolute', inset: 0, top: 120, zIndex: 0 }}>
        <KineticLine frame={frame} in={s + 15} hold={s + 45} out={e + 6} style={{ textAlign: 'left', paddingLeft: 64 }}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 118, lineHeight: 0.86, color: '#fff', letterSpacing: -1 }}>FISIOTERAPIA</div>
        </KineticLine>
      </div>
      <div style={{ position: 'absolute', inset: 0, top: 1560, zIndex: 0 }}>
        <KineticLine frame={frame} in={s + 55} hold={s + 85} out={e + 6} style={{ textAlign: 'right', paddingRight: 56 }}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 46, color: c.blueSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Ahora también
            <br />
            en digital.
          </div>
        </KineticLine>
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Phone3D t={t}>
          <ScreenImage src="hero" />
        </Phone3D>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 3 — WEBSITE FLOW ───────────────────────────

const REST_T: PhoneT = { x: 0, y: -40, z: 40, rotX: 0, rotY: 0, scale: 1 }

function Flow({ frame }: { frame: number }) {
  const [s, e] = SCENES.flow
  if (frame < s - 4 || frame > e + 4) return null

  const push = seg(frame, [
    { f: s, v: 1 },
    { f: s + 55, v: 1.045 },
    { f: e - 10, v: 1 },
  ])
  const t: PhoneT = { ...REST_T, scale: push }

  const scrollY = seg(frame, [
    { f: s, v: 0 },
    { f: s + 30, v: 0 },
    { f: s + 55, v: 806 },
    { f: s + 65, v: 806 },
    { f: s + 85, v: 1950 },
    { f: s + 95, v: 1950 },
    { f: e - 5, v: 2156 },
  ])

  return (
    <AbsoluteFill>
      <GroundShadow opacity={0.42} width={480} blur={56} />
      <div style={{ position: 'absolute', inset: 0 }}>
        <Phone3D t={t}>
          <ScrollReel images={['hero', 'pain', 'services', 'process']} scrollY={scrollY} />
        </Phone3D>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center' }}>
        <KineticLine frame={frame} in={s + 4} hold={s + 22} out={s + 48} style={{ display: 'flex', justifyContent: 'center' }}>
          <Word>Claro.</Word>
        </KineticLine>
        <KineticLine frame={frame} in={s + 50} hold={s + 68} out={s + 92} style={{ display: 'flex', justifyContent: 'center' }}>
          <Word>Rápido.</Word>
        </KineticLine>
        <KineticLine frame={frame} in={s + 94} hold={s + 108} out={e + 2} style={{ display: 'flex', justifyContent: 'center' }}>
          <Word>Hecho para FYSIKO.</Word>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

function Word({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 68, color: '#fff', letterSpacing: 0.5 }}>{children}</div>
}

// ─────────────────────────── SCENE 4 — SERVICES ───────────────────────────

function Services({ frame }: { frame: number }) {
  const [s, e] = SCENES.services
  if (frame < s - 4 || frame > e + 4) return null

  const scale = seg(frame, [
    { f: s, v: 1 },
    { f: s + 30, v: 0.82 },
    { f: s + 55, v: 0.82 },
    { f: e - 15, v: 1 },
  ])
  const rotY = seg(frame, [
    { f: s + 30, v: 0 },
    { f: s + 48, v: 13 },
    { f: s + 72, v: 13 },
    { f: s + 92, v: -5 },
    { f: e - 12, v: 0 },
  ])
  const y = seg(frame, [
    { f: s, v: -40 },
    { f: s + 30, v: -10 },
    { f: e - 15, v: -40 },
  ])
  const t: PhoneT = { ...REST_T, y, scale, rotY }

  return (
    <AbsoluteFill>
      <GroundShadow opacity={0.4} width={460} blur={54} />
      <Phone3D t={t}>
        <PagedScreen
          frame={frame}
          pages={[
            { src: 'services_top', from: s, to: s + 46 },
            { src: 'services_catalog', from: s + 46, to: s + 84 },
            { src: 'conditions', from: s + 84, to: e },
          ]}
        />
      </Phone3D>

      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center' }}>
        <KineticLine frame={frame} in={s + 2} hold={s + 20} out={s + 46} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 88, lineHeight: 0.9, color: '#fff', letterSpacing: -1 }}>
            CONOCE SUS
            <br />
            SERVICIOS.
          </div>
        </KineticLine>
        <KineticLine frame={frame} in={s + 48} hold={s + 66} out={s + 100} style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <div style={{ fontFamily: headline, fontWeight: 700, fontSize: 38, color: c.blueSoft, textTransform: 'uppercase', letterSpacing: 1 }}>
            Antes de llegar a consulta.
          </div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 5 — DETAIL MOMENT ───────────────────────────

function Detail({ frame }: { frame: number }) {
  const [s, e] = SCENES.detail
  if (frame < s - 4 || frame > e + 4) return null

  const scale = seg(frame, [
    { f: s, v: 1 },
    { f: s + 40, v: 1.56 },
    { f: s + 78, v: 1.56 },
    { f: e, v: 1.32 },
  ])
  const rotY = seg(frame, [
    { f: s, v: 0 },
    { f: s + 40, v: -9 },
    { f: s + 65, v: -9 },
    { f: s + 66, v: 7 },
    { f: e - 6, v: 0 },
  ])

  const t: PhoneT = { ...REST_T, scale, rotY, y: -60 }
  const scrimOpacity = windowP(frame, s + 2, s + 16, e - 14, e + 6)

  return (
    <AbsoluteFill>
      <Phone3D t={t}>
        <PagedScreen frame={frame} switchDur={22} pages={[{ src: 'about', from: s, to: s + 65 }, { src: 'sport', from: s + 65, to: e }]} />
      </Phone3D>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 400,
          zIndex: 2,
          opacity: scrimOpacity,
          background: 'linear-gradient(180deg, rgba(4,18,31,0.82) 0%, rgba(4,18,31,0.5) 60%, transparent 100%)',
        }}
      />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 100, textAlign: 'center', zIndex: 3 }}>
        <KineticLine frame={frame} in={s + 8} hold={s + 26} out={e - 20}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 76, color: '#fff', letterSpacing: -0.5 }}>UNA EXPERIENCIA</div>
        </KineticLine>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', zIndex: 3 }}>
        <KineticLine frame={frame} in={s + 22} hold={s + 40} out={e - 12}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 50, color: c.blueSoft, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            A la altura de su marca.
          </div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 6 — CONTACT / CTA ───────────────────────────

function Contact({ frame }: { frame: number }) {
  const [s, e] = SCENES.contact
  if (frame < s - 4 || frame > e + 4) return null

  const scale = seg(frame, [
    { f: s, v: 1.32 },
    { f: s + 30, v: 1 },
  ])
  const t: PhoneT = { ...REST_T, scale, y: -30 }

  const pulse = ((frame - s) % 60) / 60
  const pulseScale = interpolate(pulse, [0, 1], [0.9, 2.1])
  const pulseOpacity = interpolate(pulse, [0, 1], [0.55, 0]) * windowP(frame, s + 20, s + 30, e - 20, e)

  return (
    <AbsoluteFill>
      <GroundShadow opacity={0.4} width={460} blur={54} />
      <Phone3D t={t}>
        <ScreenImage src="contact_page" pan={30} />
        <div
          style={{
            position: 'absolute',
            left: 96,
            top: 682,
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: `2px solid ${c.blueSoft}`,
            transform: `scale(${pulseScale})`,
            opacity: pulseOpacity,
          }}
        />
      </Phone3D>

      <div style={{ position: 'absolute', top: 132, left: 0, right: 0, textAlign: 'center' }}>
        <KineticLine frame={frame} in={s + 4} hold={s + 22} out={s + 78}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 74, color: '#fff', letterSpacing: -0.5 }}>TODO EN UN SOLO LUGAR.</div>
        </KineticLine>
      </div>

      <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center' }}>
        <KineticLine frame={frame} in={s + 40} hold={s + 58} out={e + 2}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 92, color: c.blueSoft, letterSpacing: 1 }}>fysiko.net</div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 7 — COYO SIGNATURE ───────────────────────────

function Signature({ frame, width, height }: { frame: number; width: number; height: number }) {
  const [s, e] = SCENES.signature
  if (frame < s - 4) return null

  const exitStart = s
  const exitEnd = s + 40
  const t: PhoneT = {
    x: seg(frame, [{ f: exitStart, v: 0 }, { f: exitEnd, v: -300, ease: EASE_IN }]),
    y: -30,
    z: 40,
    rotX: 0,
    rotY: seg(frame, [{ f: exitStart, v: 0 }, { f: exitEnd, v: -46, ease: EASE_IN }]),
    scale: seg(frame, [{ f: exitStart, v: 1 }, { f: exitEnd, v: 0.7, ease: EASE_IN }]),
    opacity: seg(frame, [{ f: exitStart + 14, v: 1 }, { f: exitEnd, v: 0 }]),
  }

  const cardOpacity = seg(frame, [
    { f: exitStart + 10, v: 0 },
    { f: exitEnd, v: 1 },
  ])

  return (
    <AbsoluteFill>
      {frame < exitEnd + 2 && (
        <Phone3D t={t}>
          <ScreenImage src="contact_page" pan={30} />
        </Phone3D>
      )}

      <AbsoluteFill style={{ background: c.studio, opacity: cardOpacity }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: cardOpacity }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <KineticLine frame={frame} in={exitEnd + 6} hold={exitEnd + 24} out={e + 40}>
            <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 120, lineHeight: 0.86, color: '#fff', letterSpacing: -1, textAlign: 'center' }}>
              FYSIKO
            </div>
          </KineticLine>
          <KineticLine frame={frame} in={exitEnd + 18} hold={exitEnd + 34} out={e + 40}>
            <div style={{ fontFamily: headline, fontWeight: 700, fontSize: 34, color: c.blueSoft, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}>
              Nueva experiencia digital.
            </div>
          </KineticLine>

          <div style={{ height: 46 }} />

          <KineticLine frame={frame} in={exitEnd + 34} hold={exitEnd + 50} out={e + 40}>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textAlign: 'center' }}>
              Desarrollado por COYO.
            </div>
          </KineticLine>

          <KineticLine frame={frame} in={exitEnd + 46} hold={exitEnd + 62} out={e + 40} style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 2, background: c.studioLine }} />
              <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: 6 }}>COYO</div>
              <div style={{ width: 30, height: 2, background: c.studioLine }} />
            </div>
          </KineticLine>

          <KineticLine frame={frame} in={exitEnd + 60} hold={exitEnd + 76} out={e + 40}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textAlign: 'center', marginTop: 4 }}>
              Software para negocios reales.
            </div>
          </KineticLine>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

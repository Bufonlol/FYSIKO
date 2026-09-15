import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { wipe } from '@remotion/transitions/wipe'
import { flip } from '@remotion/transitions/flip'
import { c, headline, body, FONT_FACE_CSS } from './theme'
import { seg, windowP, EASE, EASE_OUT, EASE_IN } from './timeline'
import { Phone3D, GroundShadow, PhoneT } from './Phone3D'
import { ScreenImage } from './ScreenContent'
import { KineticLine, AccentLine } from './KineticText'

const BG = `radial-gradient(1400px 1000px at 50% 8%, #0d3a63 0%, ${c.navy} 42%, ${c.navyDeep} 100%)`
const T = 18 // shared transition length

// Real pixel offsets measured from the live captures (public/captures/manifest.json),
// converted into the phone-screen display space (capture width 1440 -> screen 588).
const SCALE = 588 / 1440
const HOME = {
  hero: 178 * SCALE,
  pain: { top: 2604 * SCALE, h: 2169 * SCALE },
  services: { top: 5423 * SCALE, h: 1810 * SCALE },
  process: { top: 7377 * SCALE, h: 1497 * SCALE },
  about: 8874 * SCALE,
  sport: 11086 * SCALE,
}
const SERVICIOS = {
  top: 178 * SCALE,
  catalog: 1928 * SCALE,
  conditions: 3873 * SCALE,
}
const VIEWPORT = 1312 // phone screen inner height

const SCENE_DURATIONS = [80, 110, 120, 120, 122, 106, 140]
export const TOTAL_FRAMES = SCENE_DURATIONS.reduce((a, b) => a + b, 0) - T * (SCENE_DURATIONS.length - 1)

export function CoyoLaunch() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: body, overflow: 'hidden' }}>
      <style>{FONT_FACE_CSS}</style>
      <Grain />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={80}>
          <Hook duration={80} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={110}>
          <Reveal duration={110} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: 'from-bottom' })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Flow duration={120} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Services duration={120} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={flip({ direction: 'from-left' })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={122}>
          <Detail duration={122} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: 'from-top' })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={106}>
          <Contact duration={106} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={140}>
          <Signature duration={140} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  )
}

/** Slow-drifting grain/light sweep so the whole film reads as one continuous shot. */
function Grain() {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        zIndex: 50,
        mixBlendMode: 'overlay',
        opacity: 0.5,
        background:
          'repeating-linear-gradient(115deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)',
      }}
    />
  )
}

// ─────────────────────────── SCENE 1 — HOOK ───────────────────────────

function Hook({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const groupExit = seg(frame, [
    { f: duration - 20, v: 1 },
    { f: duration - 4, v: 0, ease: EASE_IN },
  ])
  const groupScale = interpolate(groupExit, [0, 1], [0.94, 1])
  const flashX = seg(frame, [
    { f: duration - 14, v: -260 },
    { f: duration, v: 1340, ease: EASE_IN },
  ])

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${groupScale})`, opacity: groupExit, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <KineticLine frame={frame} in={4} hold={20} out={duration - 6}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 158, lineHeight: 0.86, color: '#fff', letterSpacing: -2 }}>FYSIKO</div>
        </KineticLine>
        <AccentLine frame={frame} in={20} hold={28} out={duration - 6} width={280} style={{ margin: '10px 0 18px' }} />
        <KineticLine frame={frame} in={26} hold={42} out={duration - 6}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 52, letterSpacing: 1, color: c.blueSoft, textTransform: 'uppercase' }}>
            Ya tiene nueva web.
          </div>
        </KineticLine>
      </div>

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
  return {
    x: seg(frame, [{ f: 0, v: 210 }, { f: 75, v: 0, ease: EASE_OUT }]),
    y: seg(frame, [{ f: 0, v: -30 }, { f: 95, v: -40 }]),
    z: seg(frame, [{ f: 0, v: 260 }, { f: 95, v: 40, ease: EASE_OUT }]),
    rotX: seg(frame, [{ f: 0, v: 4 }, { f: 95, v: 0 }]),
    rotY: seg(frame, [{ f: 0, v: -74 }, { f: 92, v: 0, ease: EASE }]),
    scale: seg(frame, [{ f: 0, v: 0.9 }, { f: 95, v: 1 }]),
  }
}

function Reveal({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const t = revealT(frame)
  const shadowOpacity = windowP(frame, 0, 30, duration - 10, duration) * 0.5

  return (
    <AbsoluteFill>
      <GroundShadow opacity={shadowOpacity} width={520} blur={60} />

      <div style={{ position: 'absolute', inset: 0, top: 120, zIndex: 0 }}>
        <KineticLine frame={frame} in={15} hold={45} out={duration + 6} style={{ textAlign: 'left', paddingLeft: 64 }}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 118, lineHeight: 0.86, color: '#fff', letterSpacing: -1 }}>FISIOTERAPIA</div>
        </KineticLine>
      </div>
      <div style={{ position: 'absolute', inset: 0, top: 1560, zIndex: 0 }}>
        <KineticLine frame={frame} in={55} hold={85} out={duration + 6} style={{ textAlign: 'right', paddingRight: 56 }}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 46, color: c.blueSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Ahora también
            <br />
            en digital.
          </div>
        </KineticLine>
      </div>

      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Phone3D t={t}>
          <ScreenImage src="page_home" pan={HOME.hero} />
        </Phone3D>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 3 — WEBSITE FLOW ───────────────────────────

const REST_T: PhoneT = { x: 0, y: -40, z: 40, rotX: 0, rotY: 0, scale: 1 }

function Flow({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const push = seg(frame, [
    { f: 0, v: 1 },
    { f: 55, v: 1.045 },
    { f: duration - 10, v: 1 },
  ])
  const t: PhoneT = { ...REST_T, scale: push }

  const painCenter = HOME.pain.top + HOME.pain.h / 2 - VIEWPORT / 2
  const servicesCenter = HOME.services.top + HOME.services.h / 2 - VIEWPORT / 2
  const processCenter = HOME.process.top + HOME.process.h / 2 - VIEWPORT / 2

  const scrollY = seg(frame, [
    { f: 0, v: HOME.hero },
    { f: 30, v: HOME.hero },
    { f: 55, v: painCenter },
    { f: 65, v: painCenter },
    { f: 85, v: servicesCenter },
    { f: 95, v: servicesCenter },
    { f: duration - 5, v: processCenter },
  ])

  return (
    <AbsoluteFill>
      <GroundShadow opacity={0.42} width={480} blur={56} />
      <div style={{ position: 'absolute', inset: 0 }}>
        <Phone3D t={t}>
          <ScreenImage src="page_home" pan={scrollY} />
        </Phone3D>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center' }}>
        <KineticLine frame={frame} in={4} hold={22} out={48} style={{ display: 'flex', justifyContent: 'center' }}>
          <Word>Claro.</Word>
        </KineticLine>
        <KineticLine frame={frame} in={50} hold={68} out={92} style={{ display: 'flex', justifyContent: 'center' }}>
          <Word>Rápido.</Word>
        </KineticLine>
        <KineticLine frame={frame} in={94} hold={108} out={duration + 2} style={{ display: 'flex', justifyContent: 'center' }}>
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

function Services({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const scale = seg(frame, [
    { f: 0, v: 1 },
    { f: 30, v: 0.82 },
    { f: 55, v: 0.82 },
    { f: duration - 15, v: 1 },
  ])
  const rotY = seg(frame, [
    { f: 30, v: 0 },
    { f: 48, v: 13 },
    { f: 72, v: 13 },
    { f: 92, v: -5 },
    { f: duration - 12, v: 0 },
  ])
  const y = seg(frame, [
    { f: 0, v: -40 },
    { f: 30, v: -10 },
    { f: duration - 15, v: -40 },
  ])
  const t: PhoneT = { ...REST_T, y, scale, rotY }

  const pan = seg(frame, [
    { f: 0, v: SERVICIOS.top },
    { f: 30, v: SERVICIOS.top },
    { f: 55, v: SERVICIOS.catalog },
    { f: 75, v: SERVICIOS.catalog },
    { f: 95, v: SERVICIOS.conditions },
    { f: duration - 10, v: SERVICIOS.conditions },
  ])

  return (
    <AbsoluteFill>
      <GroundShadow opacity={0.4} width={460} blur={54} />
      <Phone3D t={t}>
        <ScreenImage src="page_servicios" pan={pan} />
      </Phone3D>

      <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center' }}>
        <KineticLine frame={frame} in={2} hold={20} out={46} style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 88, lineHeight: 0.9, color: '#fff', letterSpacing: -1 }}>
            CONOCE SUS
            <br />
            SERVICIOS.
          </div>
        </KineticLine>
        <KineticLine frame={frame} in={48} hold={66} out={100} style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <div style={{ fontFamily: headline, fontWeight: 700, fontSize: 38, color: c.blueSoft, textTransform: 'uppercase', letterSpacing: 1 }}>
            Antes de llegar a consulta.
          </div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 5 — DETAIL MOMENT ───────────────────────────

function Detail({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const scale = seg(frame, [
    { f: 0, v: 1 },
    { f: 40, v: 1.56 },
    { f: 78, v: 1.56 },
    { f: duration, v: 1.32 },
  ])
  const rotY = seg(frame, [
    { f: 0, v: 0 },
    { f: 40, v: -9 },
    { f: 65, v: -9 },
    { f: 66, v: 7 },
    { f: duration - 6, v: 0 },
  ])

  const t: PhoneT = { ...REST_T, scale, rotY, y: -60 }
  const scrimOpacity = windowP(frame, 2, 16, duration - 14, duration + 6)

  const pan = seg(frame, [
    { f: 0, v: HOME.about },
    { f: 50, v: HOME.about + 150 },
    { f: 70, v: HOME.sport - 100 },
    { f: duration, v: HOME.sport + 280 },
  ])

  return (
    <AbsoluteFill>
      <Phone3D t={t}>
        <ScreenImage src="page_home" pan={pan} />
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
        <KineticLine frame={frame} in={8} hold={26} out={duration - 20}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 76, color: '#fff', letterSpacing: -0.5 }}>UNA EXPERIENCIA</div>
        </KineticLine>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', zIndex: 3 }}>
        <KineticLine frame={frame} in={22} hold={40} out={duration - 12}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 50, color: c.blueSoft, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            A la altura de su marca.
          </div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 6 — CONTACT / CTA ───────────────────────────

function Contact({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const scale = seg(frame, [
    { f: 0, v: 1.32 },
    { f: 30, v: 1 },
  ])
  const t: PhoneT = { ...REST_T, scale, y: -30 }

  const pulse = (frame % 60) / 60
  const pulseScale = interpolate(pulse, [0, 1], [0.9, 2.1])
  const pulseOpacity = interpolate(pulse, [0, 1], [0.55, 0]) * windowP(frame, 20, 30, duration - 20, duration)

  return (
    <AbsoluteFill>
      <GroundShadow opacity={0.4} width={460} blur={54} />
      <Phone3D t={t}>
        <ScreenImage src="page_contacto" pan={50} />
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
        <KineticLine frame={frame} in={4} hold={22} out={78}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 74, color: '#fff', letterSpacing: -0.5 }}>TODO EN UN SOLO LUGAR.</div>
        </KineticLine>
      </div>

      <div style={{ position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center' }}>
        <KineticLine frame={frame} in={40} hold={58} out={duration + 2}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 92, color: c.blueSoft, letterSpacing: 1 }}>fysiko.net</div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── SCENE 7 — COYO SIGNATURE ───────────────────────────

function Signature({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const exitEnd = 40
  const t: PhoneT = {
    x: seg(frame, [{ f: 0, v: 0 }, { f: exitEnd, v: -300, ease: EASE_IN }]),
    y: -30,
    z: 40,
    rotX: 0,
    rotY: seg(frame, [{ f: 0, v: 0 }, { f: exitEnd, v: -46, ease: EASE_IN }]),
    scale: seg(frame, [{ f: 0, v: 1 }, { f: exitEnd, v: 0.7, ease: EASE_IN }]),
    opacity: seg(frame, [{ f: 14, v: 1 }, { f: exitEnd, v: 0 }]),
  }

  const cardOpacity = seg(frame, [
    { f: 10, v: 0 },
    { f: exitEnd, v: 1 },
  ])

  return (
    <AbsoluteFill>
      {frame < exitEnd + 2 && (
        <Phone3D t={t}>
          <ScreenImage src="page_contacto" pan={50} />
        </Phone3D>
      )}

      <AbsoluteFill style={{ background: c.studio, opacity: cardOpacity }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: cardOpacity }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <KineticLine frame={frame} in={exitEnd + 6} hold={exitEnd + 24} out={duration + 40}>
            <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 120, lineHeight: 0.86, color: '#fff', letterSpacing: -1, textAlign: 'center' }}>
              FYSIKO
            </div>
          </KineticLine>
          <KineticLine frame={frame} in={exitEnd + 18} hold={exitEnd + 34} out={duration + 40}>
            <div style={{ fontFamily: headline, fontWeight: 700, fontSize: 34, color: c.blueSoft, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}>
              Nueva experiencia digital.
            </div>
          </KineticLine>

          <div style={{ height: 46 }} />

          <KineticLine frame={frame} in={exitEnd + 34} hold={exitEnd + 50} out={duration + 40}>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textAlign: 'center' }}>
              Desarrollado por COYO.
            </div>
          </KineticLine>

          <KineticLine frame={frame} in={exitEnd + 46} hold={exitEnd + 62} out={duration + 40} style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 2, background: c.studioLine }} />
              <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 40, color: '#fff', letterSpacing: 6 }}>COYO</div>
              <div style={{ width: 30, height: 2, background: c.studioLine }} />
            </div>
          </KineticLine>

          <KineticLine frame={frame} in={exitEnd + 60} hold={exitEnd + 76} out={duration + 40}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textAlign: 'center', marginTop: 4 }}>
              Software para negocios reales.
            </div>
          </KineticLine>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

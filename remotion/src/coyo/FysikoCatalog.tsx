import React from 'react'
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { c, headline, body, FONT_FACE_CSS } from './theme'
import { seg, windowP, EASE, EASE_OUT, EASE_IN } from './timeline'
import { KineticLine, AccentLine } from './KineticText'

const T = 16

const ITEMS: { card: string; eyebrow: string; title: string; sub: string; from: string; to: string }[] = [
  { card: 'pain_card_0', eyebrow: 'Empieza por lo que sientes', title: 'Dolor de espalda', sub: 'Postura y zona lumbar', from: '#0a2f52', to: '#0e9aef' },
  { card: 'pain_card_1', eyebrow: 'Empieza por lo que sientes', title: 'Dolor de rodilla', sub: 'Lesiones y sobrecarga', from: '#0c3d5e', to: '#38bdf8' },
  { card: 'pain_card_2', eyebrow: 'Empieza por lo que sientes', title: 'Dolor de hombro', sub: 'Fuerza y movilidad', from: '#0e2a5c', to: '#4f7cf0' },
  { card: 'pain_card_3', eyebrow: 'Empieza por lo que sientes', title: 'Dolor de cuello', sub: 'Tensión y control', from: '#0a3450', to: '#22b8e0' },
  { card: 'pain_card_4', eyebrow: 'Empieza por lo que sientes', title: 'Lesiones deportivas', sub: 'Vuelve a tu actividad', from: '#0b2f5a', to: '#2b6fe0' },
  { card: 'pain_card_5', eyebrow: 'Empieza por lo que sientes', title: 'Movilidad limitada', sub: 'Recupera confianza', from: '#0a3355', to: '#37a6e6' },
]

const INTRO_DUR = 75
const ITEM_DUR = 96
const OUTRO_DUR = 100

export function FysikoCatalog() {
  return (
    <AbsoluteFill style={{ fontFamily: body, overflow: 'hidden', background: c.cream }}>
      <style>{FONT_FACE_CSS}</style>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_DUR}>
          <Intro duration={INTRO_DUR} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        {ITEMS.map((item, i) => (
          <React.Fragment key={item.card}>
            <TransitionSeries.Sequence durationInFrames={ITEM_DUR}>
              <Item {...item} duration={ITEM_DUR} index={i} total={ITEMS.length} />
            </TransitionSeries.Sequence>
            {i < ITEMS.length - 1 && (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
            )}
          </React.Fragment>
        ))}

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={OUTRO_DUR}>
          <Outro duration={OUTRO_DUR} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  )
}

export const TOTAL_FRAMES = INTRO_DUR + ITEMS.length * ITEM_DUR + OUTRO_DUR - T * (ITEMS.length + 1)

// ─────────────────────────── INTRO ───────────────────────────

function Intro({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: c.cream }}>
      <AbsoluteFill>
        {Array.from({ length: 26 }).map((_, i) => {
          const seed = i * 37.13
          const x = (Math.sin(seed) * 0.5 + 0.5) * width
          const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * height
          const shape = i % 3
          const p = windowP(frame, 4 + (i % 10) * 2, 20 + (i % 10) * 2, duration - 18, duration)
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                opacity: p * 0.7,
                color: c.blue,
                fontSize: shape === 0 ? 10 : 16,
                transform: `scale(${p})`,
              }}
            >
              {shape === 0 ? '●' : shape === 1 ? '✦' : '▲'}
            </div>
          )
        })}
      </AbsoluteFill>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 2 }}>
        <KineticLine frame={frame} in={6} hold={26} out={duration - 4}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 130, lineHeight: 0.86, color: c.ink, letterSpacing: -1.5 }}>FYSIKO</div>
        </KineticLine>
        <AccentLine frame={frame} in={24} hold={32} out={duration - 4} width={240} style={{ margin: '8px 0 14px' }} />
        <KineticLine frame={frame} in={30} hold={46} out={duration - 4}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 34, letterSpacing: 0.5, color: c.blueDeep, textTransform: 'uppercase', textAlign: 'center' }}>
            ¿Qué te impide
            <br />
            moverte como antes?
          </div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── CATALOG ITEM ───────────────────────────

function Item({
  card,
  eyebrow,
  title,
  sub,
  from,
  to,
  duration,
  index,
  total,
}: {
  card: string
  eyebrow: string
  title: string
  sub: string
  from: string
  to: string
  duration: number
  index: number
  total: number
}) {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()

  const cardP = seg(frame, [
    { f: 0, v: 0 },
    { f: 22, v: 1, ease: EASE_OUT },
  ])
  const cardScale = interpolate(cardP, [0, 1], [0.82, 1])
  const cardY = interpolate(cardP, [0, 1], [90, 0]) + Math.sin(frame / 22) * 10
  const cardRot = interpolate(cardP, [0, 1], [index % 2 === 0 ? -7 : 7, index % 2 === 0 ? -2.5 : 2.5])

  const exitP = seg(frame, [
    { f: duration - 16, v: 0 },
    { f: duration, v: 1, ease: EASE_IN },
  ])
  const exitScale = interpolate(exitP, [0, 1], [1, 1.08])
  const exitOpacity = interpolate(exitP, [0, 1], [1, 0])

  const flashOpacity = seg(frame, [
    { f: 0, v: 0.9 },
    { f: 14, v: 0 },
  ])

  return (
    <AbsoluteFill style={{ background: `radial-gradient(1100px 1500px at 50% 30%, ${to} 0%, ${from} 78%)` }}>
      {/* punchy color flash into the scene */}
      <AbsoluteFill style={{ background: '#fff', opacity: flashOpacity }} />

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
        <KineticLine frame={frame} in={16} hold={30} out={duration - 8}>
          <div style={{ color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800, fontSize: 16 }}>{eyebrow}</div>
        </KineticLine>
        <div
          style={{
            marginTop: 20,
            padding: '7px 18px',
            display: 'inline-block',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.16)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            opacity: windowP(frame, 4, 14, duration - 10, duration),
          }}
        >
          {index + 1} / {total}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
        }}
      >
        <div
          style={{
            width: width * 0.62,
            transform: `translateY(${cardY - 60}px) rotate(${cardRot}deg) scale(${cardScale})`,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 40px 90px rgba(0,0,0,0.35), 0 10px 26px rgba(0,0,0,0.22)',
          }}
        >
          <img src={staticFile(`captures/${card}.png`)} style={{ width: '100%', display: 'block' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 210, textAlign: 'center', zIndex: 2 }}>
        <KineticLine frame={frame} in={30} hold={44} out={duration - 6}>
          <div style={{ fontFamily: headline, fontWeight: 900, fontSize: 84, lineHeight: 0.92, color: '#fff', letterSpacing: -1 }}>{title}</div>
        </KineticLine>
        <KineticLine frame={frame} in={42} hold={56} out={duration - 4}>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginTop: 10 }}>{sub}</div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

// ─────────────────────────── OUTRO ───────────────────────────

function Outro({ duration }: { duration: number }) {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: c.cream }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <KineticLine frame={frame} in={6} hold={24} out={duration - 20}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 46, color: c.ink, textAlign: 'center', lineHeight: 1 }}>
            Tu recuperación
            <br />
            empieza aquí.
          </div>
        </KineticLine>
        <KineticLine frame={frame} in={26} hold={40} out={duration - 4}>
          <div style={{ fontFamily: headline, fontWeight: 800, fontSize: 78, color: c.blueDeep, letterSpacing: 1 }}>fysiko.net</div>
        </KineticLine>
      </div>
    </AbsoluteFill>
  )
}

import React from 'react'
import { AbsoluteFill } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { colors, fontFamily } from './theme'
import { Intro } from './Intro'
import { Outro } from './Outro'
import { SectionScene } from './SectionScene'
import * as S from './landingScenes'

const SECTION_DURATION = 150
const TRANSITION_DURATION = 18
const INTRO_DURATION = 100
const OUTRO_DURATION = 95

const SECTIONS: {
  eyebrow: string
  title: string
  bullets: string[]
  Desktop: React.ComponentType
  Mobile: React.ComponentType
}[] = [
  {
    eyebrow: 'Portada',
    title: 'Hero principal',
    bullets: ['Un mensaje directo y una sola llamada a la acción', 'Foto a pantalla completa con degradado de marca'],
    Desktop: S.HeroDesktop,
    Mobile: S.HeroMobile,
  },
  {
    eyebrow: 'Empieza por lo que sientes',
    title: '¿Qué te duele?',
    bullets: ['Tarjetas por molestia, para identificarse rápido', 'Guían directo a la sección de servicios'],
    Desktop: S.PainDesktop,
    Mobile: S.PainMobile,
  },
  {
    eyebrow: 'Catálogo',
    title: 'Servicios',
    bullets: ['4 tratamientos explicados en una frase', 'Tarjetas con foto, fáciles de escanear'],
    Desktop: S.ServicesDesktop,
    Mobile: S.ServicesMobile,
  },
  {
    eyebrow: 'Cómo funciona',
    title: 'Proceso en 4 pasos',
    bullets: ['Quita la incertidumbre de "qué va a pasar"', 'Numeración clara del 01 al 04'],
    Desktop: S.ProcessDesktop,
    Mobile: S.ProcessMobile,
  },
  {
    eyebrow: 'Confianza',
    title: 'Sobre FYSIKO',
    bullets: ['Foto real + texto cercano generan confianza', 'Chips con los beneficios clave del trato'],
    Desktop: S.AboutDesktop,
    Mobile: S.AboutMobile,
  },
  {
    eyebrow: 'Para deportistas',
    title: 'Rehabilitación deportiva',
    bullets: ['Imagen a todo lo ancho con overlay oscuro', 'CTA propio para esa audiencia'],
    Desktop: S.SportDesktop,
    Mobile: S.SportMobile,
  },
  {
    eyebrow: 'Prueba social',
    title: 'Testimonios',
    bullets: ['Citas reales con iniciales del paciente', 'Refuerzan confianza antes de contactar'],
    Desktop: S.TestimonialsDesktop,
    Mobile: S.TestimonialsMobile,
  },
  {
    eyebrow: 'Cierre',
    title: 'Ubicación y contacto',
    bullets: ['Dirección, horario y teléfono siempre visibles', 'Botón flotante de WhatsApp en todas las páginas'],
    Desktop: S.ContactDesktop,
    Mobile: S.ContactMobile,
  },
]

export function FysikoPromo() {
  return (
    <AbsoluteFill style={{ background: colors.soft, fontFamily }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
          <Intro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} />

        {SECTIONS.map((section, i) => (
          <React.Fragment key={section.title}>
            <TransitionSeries.Sequence durationInFrames={SECTION_DURATION}>
              <SectionScene
                eyebrow={section.eyebrow}
                title={section.title}
                index={i}
                total={SECTIONS.length}
                bullets={section.bullets}
                Desktop={section.Desktop}
                Mobile={section.Mobile}
              />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
              presentation={slide({ direction: i % 2 === 0 ? 'from-right' : 'from-left' })}
              timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
            />
          </React.Fragment>
        ))}

        <TransitionSeries.Sequence durationInFrames={OUTRO_DURATION}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  )
}

export const TOTAL_DURATION =
  INTRO_DURATION + SECTIONS.length * SECTION_DURATION + OUTRO_DURATION - TRANSITION_DURATION * (SECTIONS.length + 1)

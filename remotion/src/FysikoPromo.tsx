import React from 'react'
import { AbsoluteFill } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { slide } from '@remotion/transitions/slide'
import { colors, fontFamily } from './theme'
import type { SectionKey } from './theme'
import { Intro } from './Intro'
import { Outro } from './Outro'
import { SectionScene } from './SectionScene'
import * as S from './scenes'

const SECTION_DURATION = 145
const TRANSITION_DURATION = 18
const INTRO_DURATION = 95
const OUTRO_DURATION = 95

const SECTIONS: { key: SectionKey; Desktop: React.ComponentType; Mobile: React.ComponentType }[] = [
  { key: 'dashboard', Desktop: S.DashboardDesktop, Mobile: S.DashboardMobile },
  { key: 'agenda', Desktop: S.AgendaDesktop, Mobile: S.AgendaMobile },
  { key: 'patients', Desktop: S.PatientsDesktop, Mobile: S.PatientsMobile },
  { key: 'doctors', Desktop: S.DoctorsDesktop, Mobile: S.DoctorsMobile },
  { key: 'clinics', Desktop: S.ClinicsDesktop, Mobile: S.ClinicsMobile },
  { key: 'reports', Desktop: S.ReportsDesktop, Mobile: S.ReportsMobile },
  { key: 'users', Desktop: S.UsersDesktop, Mobile: S.UsersMobile },
  { key: 'notifications', Desktop: S.NotificationsDesktop, Mobile: S.NotificationsMobile },
]

export function FysikoPromo() {
  return (
    <AbsoluteFill style={{ background: colors.bg, fontFamily }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_DURATION}>
          <Intro />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} />

        {SECTIONS.map((section, i) => (
          <React.Fragment key={section.key}>
            <TransitionSeries.Sequence durationInFrames={SECTION_DURATION}>
              <SectionScene section={section.key} index={i} total={SECTIONS.length} Desktop={section.Desktop} Mobile={section.Mobile} />
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

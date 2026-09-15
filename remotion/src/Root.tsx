import React from 'react'
import { Composition } from 'remotion'
import { FysikoPromo, TOTAL_DURATION } from './FysikoPromo'

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="FysikoPromo"
        component={FysikoPromo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  )
}

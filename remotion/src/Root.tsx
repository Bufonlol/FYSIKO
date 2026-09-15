import React from 'react'
import { Composition } from 'remotion'
import { FysikoPromo, TOTAL_DURATION } from './FysikoPromo'
import { CoyoLaunch, TOTAL_FRAMES } from './coyo/CoyoLaunch'
import { FysikoCatalog, TOTAL_FRAMES as CATALOG_FRAMES } from './coyo/FysikoCatalog'

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="FysikoPromo"
        component={FysikoPromo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CoyoLaunch"
        component={CoyoLaunch}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FysikoCatalog"
        component={FysikoCatalog}
        durationInFrames={CATALOG_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  )
}

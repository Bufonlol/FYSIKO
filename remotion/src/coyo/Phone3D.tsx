import React from 'react'

export const PHONE_W = 620
export const PHONE_H = 1344
const BEZEL = 16
const RADIUS = 56
const SCREEN_RADIUS = RADIUS - BEZEL

export type PhoneT = {
  x: number
  y: number
  z: number
  rotX: number
  rotY: number
  scale: number
  opacity?: number
}

export function Phone3D({ t, children }: { t: PhoneT; children: React.ReactNode }) {
  const opacity = t.opacity ?? 1
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 2200,
        perspectiveOrigin: '50% 42%',
        opacity,
      }}
    >
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          transformStyle: 'preserve-3d',
          transform: `translate3d(${t.x}px, ${t.y}px, ${t.z}px) rotateX(${t.rotX}deg) rotateY(${t.rotY}deg) scale(${t.scale})`,
        }}
      >
        {/* side edge (depth) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: -9,
            width: 18,
            height: '100%',
            borderRadius: RADIUS,
            transform: 'rotateY(90deg)',
            transformOrigin: 'left center',
            background: 'linear-gradient(180deg, #3a3d42 0%, #1a1b1e 8%, #0b0c0d 50%, #1a1b1e 92%, #3a3d42 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: -9,
            width: 18,
            height: '100%',
            borderRadius: RADIUS,
            transform: 'rotateY(90deg)',
            transformOrigin: 'left center',
            background: 'linear-gradient(180deg, #2a2c2f 0%, #0b0c0d 8%, #050506 50%, #0b0c0d 92%, #2a2c2f 100%)',
          }}
        />

        {/* chassis */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: RADIUS,
            background: 'linear-gradient(155deg, #34363b 0%, #16171a 22%, #0c0d0e 60%, #1c1d20 100%)',
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 2px 4px rgba(255,255,255,0.10)',
          }}
        >
          {/* screen */}
          <div
            style={{
              position: 'absolute',
              inset: BEZEL,
              borderRadius: SCREEN_RADIUS,
              overflow: 'hidden',
              background: '#000',
            }}
          >
            {children}

            {/* subtle glass reflection */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(118deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 14%, rgba(255,255,255,0) 30%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(-62deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 10%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* dynamic island */}
          <div
            style={{
              position: 'absolute',
              top: 34,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 118,
              height: 32,
              borderRadius: 20,
              background: '#000',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export function GroundShadow({ opacity, width, blur }: { opacity: number; width: number; blur: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '9%',
        transform: 'translateX(-50%)',
        width,
        height: 90,
        borderRadius: '50%',
        background: '#000',
        filter: `blur(${blur}px)`,
        opacity,
      }}
    />
  )
}

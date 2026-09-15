import { staticFile } from 'remotion'

export const c = {
  navy: '#082b4a',
  navyDeep: '#04121f',
  blue: '#0e9aef',
  blueSoft: '#63c4ff',
  blueDeep: '#0b7bc4',
  ink: '#10283c',
  white: '#ffffff',
  cream: '#eef5f8',
  studio: '#0a0a0c',
  studioLine: 'rgba(255,255,255,0.14)',
}

export const headline = "'Barlow Condensed', 'Inter', sans-serif"
export const body = "'Inter', -apple-system, sans-serif"

export const FONT_FACE_CSS = `
@font-face{font-family:'Barlow Condensed';font-weight:700;font-style:normal;font-display:block;src:url('${staticFile('fonts/barlow-condensed-700.woff2')}') format('woff2');}
@font-face{font-family:'Barlow Condensed';font-weight:800;font-style:normal;font-display:block;src:url('${staticFile('fonts/barlow-condensed-800.woff2')}') format('woff2');}
@font-face{font-family:'Barlow Condensed';font-weight:900;font-style:normal;font-display:block;src:url('${staticFile('fonts/barlow-condensed-900.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:400;font-style:normal;font-display:block;src:url('${staticFile('fonts/inter-400.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:600;font-style:normal;font-display:block;src:url('${staticFile('fonts/inter-600.woff2')}') format('woff2');}
@font-face{font-family:'Inter';font-weight:700;font-style:normal;font-display:block;src:url('${staticFile('fonts/inter-700.woff2')}') format('woff2');}
`

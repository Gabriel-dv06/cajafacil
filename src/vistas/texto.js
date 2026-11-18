import { Text as NativeText, StyleSheet } from 'react-native'
import { colors } from '../estilos/tema'
import { useApp } from '../js/estado'

export function useLook() {
  const { state } = useApp()
  const settings = state?.settings || {}
  const textSize = settings.textSize || 'normal'
  const scale = textSize === 'muy' ? 1.34 : textSize === 'grande' ? 1.16 : 1
  return {
    scale,
    spacing: settings.spacing ? 1.22 : 1,
    contrast: Boolean(settings.contrast),
    dark: Boolean(settings.dark),
    textSize,
  }
}

const darkInk = {
  [colors.text]: '#FFFFFF',
  [colors.muted]: '#D0D0D0',
  [colors.disabledText]: '#D0D0D0',
  [colors.greenInk]: '#E7FFF0',
  [colors.green]: '#8FE3B0',
  [colors.blue]: '#B7C9FF',
  [colors.purple]: '#E0C4FF',
  [colors.teal]: '#8FF0DC',
  [colors.brown]: '#F3C48A',
  [colors.brownInk]: '#F8D7A6',
  [colors.red]: '#FFB4B5',
}

export function toneColor(color, dark) {
  if (!dark) return color
  if (!color || color === colors.text) return '#FFFFFF'
  return darkInk[color] || color
}

export function Text({ style, ...props }) {
  const { scale, spacing, contrast, dark } = useLook()
  const flat = StyleSheet.flatten(style) || {}
  const fontSize = Math.round((flat.fontSize || 16) * scale)
  const lineHeight = Math.round((flat.lineHeight ? flat.lineHeight * scale : fontSize * 1.28) * (spacing > 1 ? 1.35 : 1))
  const extra = { fontSize, lineHeight }
  if (spacing > 1 && flat.marginBottom) extra.marginBottom = Math.round(flat.marginBottom * 1.45)
  if (spacing > 1 && flat.marginTop) extra.marginTop = Math.round(flat.marginTop * 1.35)
  if (dark) {
    const next = toneColor(flat.color, true)
    if (!flat.color || next !== flat.color) extra.color = next
  } else if (contrast) {
    if (!flat.color || flat.color === colors.text) extra.color = '#111111'
    else if (flat.color === colors.muted || flat.color === colors.disabledText) extra.color = '#1A1A1A'
  }
  return <NativeText {...props} style={[style, extra]} />
}

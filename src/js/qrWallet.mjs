import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import jsQR from 'jsqr'
import { base64ToBytes, decodeJpeg, plinLogoCropRect, qrCropRect, sniffImage } from './esqr.mjs'
import { recognizeWalletBrand } from './walletOcr'

const MAX_SIDE = 1200

export async function prepareWalletQr({ asset, brand }) {
  const name = brand === 'plin' ? 'Plin' : 'Yape'
  if (brand !== 'yape' && brand !== 'plin') {
    return { ok: false, error: 'Selecciona Yape o Plin para validar el QR.' }
  }

  let bytes
  try {
    bytes = base64ToBytes(asset?.base64)
  } catch {
    return { ok: false, error: 'No se pudo leer la imagen. Elige una foto JPG o PNG del QR.' }
  }
  const kind = sniffImage(bytes)
  if (kind !== 'jpeg' && kind !== 'png') {
    return { ok: false, error: 'Solo puedes subir una foto JPG o PNG del código QR.' }
  }

  const input = `data:image/${kind === 'png' ? 'png' : 'jpeg'};base64,${String(asset.base64).replace(/^data:[^,]*,/, '')}`
  const width = Number(asset.width) || 0
  const height = Number(asset.height) || 0
  const longestSide = Math.max(width, height)
  const resizeActions = longestSide > MAX_SIDE
    ? [{ resize: width >= height ? { width: MAX_SIDE } : { height: MAX_SIDE } }]
    : []
  const resized = await manipulateAsync(input, resizeActions, {
    format: SaveFormat.JPEG,
    compress: 1,
    base64: true,
  })
  if (!resized.base64) {
    return { ok: false, error: 'No se pudo procesar la foto. Elige otra imagen JPG o PNG.' }
  }

  const frame = decodeJpeg(base64ToBytes(resized.base64))
  if (!frame) {
    return { ok: false, error: 'No se pudo leer la foto. Elige una imagen JPG o PNG del QR.' }
  }
  const found = jsQR(frame.data, frame.width, frame.height)
  if (!found) {
    return { ok: false, error: 'No se detectó un código QR legible. Sube una foto nítida del QR completo.' }
  }

  const dataUrl = `data:image/jpeg;base64,${resized.base64}`
  let brandVisible = false
  if (brand === 'plin') {
    const logoRect = plinLogoCropRect(found.location, frame.width, frame.height)
    if (logoRect) {
      const logo = await manipulateAsync(resized.uri, [
        { crop: logoRect },
        { resize: { width: Math.min(1000, logoRect.width * 5) } },
      ], {
        format: SaveFormat.JPEG,
        compress: 1,
        base64: true,
      })
      if (logo.base64) {
        brandVisible = await recognizeWalletBrand({
          uri: logo.uri,
          dataUrl: `data:image/jpeg;base64,${logo.base64}`,
          brand,
        })
      }
    }
    if (!brandVisible) {
      brandVisible = await recognizeWalletBrand({ uri: resized.uri, dataUrl, brand })
    }
  } else {
    brandVisible = await recognizeWalletBrand({ uri: resized.uri, dataUrl, brand })
  }
  if (!brandVisible) {
    return {
      ok: false,
      error: `No se reconoció la palabra ${name} en la imagen. Asegúrate de que se vea el nombre correcto junto al QR.`,
    }
  }

  const crop = qrCropRect(found.location, frame.width, frame.height)
  if (!crop) {
    return { ok: false, error: 'No se pudo recortar el QR. Sube una foto del código completo y derecho.' }
  }
  const cropped = await manipulateAsync(resized.uri, [{ crop }], {
    format: SaveFormat.PNG,
    base64: true,
  })
  if (!cropped.base64) {
    return { ok: false, error: 'No se pudo recortar el QR. Intenta con otra foto.' }
  }
  return { ok: true, qr: `data:image/png;base64,${cropped.base64}` }
}

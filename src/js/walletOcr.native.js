import { recognizeText } from 'expo-ocr-kit'
import { hasWalletBrandText } from './esqr.mjs'

export async function recognizeWalletBrand({ uri, brand }) {
  try {
    const result = await recognizeText(uri)
    return hasWalletBrandText(result.text, brand)
  } catch (error) {
    if (error instanceof Error && error.message.includes("Native module 'ExpoOcrKit' is not available")) {
      throw new Error('La validación de QR en Android/iOS requiere instalar un development build; no funciona en Expo Go.')
    }
    throw error
  }
}

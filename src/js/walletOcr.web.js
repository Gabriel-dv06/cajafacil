import { createWorker } from 'tesseract.js'
import { hasWalletBrandText } from './esqr.mjs'

let workerPromise

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng').catch((error) => {
      workerPromise = null
      throw error
    })
  }
  return workerPromise
}

export async function recognizeWalletBrand({ dataUrl, brand }) {
  const worker = await getWorker()
  const result = await worker.recognize(dataUrl)
  return hasWalletBrandText(result.data.text, brand)
}

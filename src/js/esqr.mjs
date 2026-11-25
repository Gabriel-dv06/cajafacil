// Revisa que un archivo sea una foto JPG o PNG y que dentro haya un código QR.

const ZZ = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6,
  7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31,
  39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
]

const COS = Array.from({ length: 8 }, (_, position) => (
  Array.from({ length: 8 }, (_, frequency) => Math.cos(((2 * position + 1) * frequency * Math.PI) / 16))
))

export function sniffImage(bytes) {
  if (!bytes || bytes.length < 4) return 'otro'
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  return 'otro'
}

export function base64ToBytes(value) {
  const clean = String(value || '').replace(/^data:[^,]*,/, '').replace(/\s/g, '')
  const bin = atob(clean)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

function ratioOk(counts) {
  const total = counts[0] + counts[1] + counts[2] + counts[3] + counts[4]
  if (total < 7) return false
  const unit = total / 7
  const tol = unit * 0.65
  return Math.abs(counts[0] - unit) <= tol
    && Math.abs(counts[1] - unit) <= tol
    && Math.abs(counts[2] - unit * 3) <= tol * 2
    && Math.abs(counts[3] - unit) <= tol
    && Math.abs(counts[4] - unit) <= tol
}

function columnMatches(gray, width, height, x, y, size, darkAt) {
  const half = Math.round(size)
  const counts = [0, 0, 0, 0, 0]
  let state = 0
  for (let py = Math.round(y) - half; py <= Math.round(y) + half; py += 1) {
    if (py < 0 || py >= height) continue
    const dark = darkAt(gray[py * width + x])
    if (counts[0] === 0 && !dark) continue
    if (dark === (state % 2 === 0)) counts[state] += 1
    else if (state < 4) {
      state += 1
      counts[state] = 1
    } else return ratioOk(counts)
  }
  return ratioOk(counts)
}

function crossOk(gray, width, height, x, y, size, darkAt) {
  const center = Math.round(x)
  for (let dx = -2; dx <= 2; dx += 1) {
    const col = center + dx
    if (col < 0 || col >= width) continue
    if (columnMatches(gray, width, height, col, y, size, darkAt)) return true
  }
  return false
}

export function imageHasQr(rgba, width, height) {
  if (!rgba || width < 21 || height < 21) return false
  const count = width * height
  const gray = new Uint8Array(count)
  let sum = 0
  for (let i = 0; i < count; i += 1) {
    const o = i * 4
    const tone = (rgba[o] * 3 + rgba[o + 1] * 6 + rgba[o + 2]) / 10
    gray[i] = tone
    sum += tone
  }
  const mid = sum / count
  const centers = []
  function collect(inverted) {
    const darkAt = inverted ? (value) => value >= mid : (value) => value < mid
    for (let y = 0; y < height; y += 1) {
      const counts = [0, 0, 0, 0, 0]
      let state = -1
      for (let x = 0; x < width; x += 1) {
        const dark = darkAt(gray[y * width + x])
        if (state < 0) {
          if (!dark) continue
          state = 0
          counts[0] = 1
          continue
        }
        if (dark === (state % 2 === 0)) counts[state] += 1
        else if (state < 4) {
          state += 1
          counts[state] = 1
        } else {
          if (ratioOk(counts)) {
            const total = counts[0] + counts[1] + counts[2] + counts[3] + counts[4]
            const cx = x - counts[4] - counts[3] - counts[2] / 2
            if (crossOk(gray, width, height, cx, y, total, darkAt)) centers.push({ x: cx, y, size: total })
          }
          counts[0] = counts[2]
          counts[1] = counts[3]
          counts[2] = counts[4]
          counts[3] = 1
          counts[4] = 0
          state = 3
        }
      }
    }
  }
  collect(false)
  if (centers.length < 3) collect(true)
  return finderTrio(centers)
}

export function hasWalletBrandText(text, brand) {
  const expected = brand === 'yape' ? 'YAPE' : brand === 'plin' ? 'PLIN' : ''
  if (!expected) return false
  const words = String(text || '').toUpperCase().split(/[^A-Z0-9]+/)
  const candidates = [...words]
  for (let start = 0; start < words.length; start += 1) {
    let joined = ''
    for (let end = start; end < Math.min(words.length, start + 3); end += 1) {
      joined += words[end]
      if (joined.length >= 3 && joined.length <= 5) candidates.push(joined)
      if (joined.length > 5) break
    }
  }
  return candidates.some((word) => word.length >= 3 && word.length <= 5 && editDistance(word, expected) <= 2)
}

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      )
      diagonal = above
    }
  }
  return previous[right.length]
}

export function qrCropRect(location, width, height) {
  const points = [
    location?.topLeftCorner,
    location?.topRightCorner,
    location?.bottomLeftCorner,
    location?.bottomRightCorner,
  ]
  if (points.some((point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const padding = Math.max(2, Math.ceil(Math.max(maxX - minX, maxY - minY) * 0.015))
  const originX = Math.max(0, Math.floor(minX - padding))
  const originY = Math.max(0, Math.floor(minY - padding))
  const right = Math.min(width, Math.ceil(maxX + padding))
  const bottom = Math.min(height, Math.ceil(maxY + padding))
  if (right <= originX || bottom <= originY) return null
  return { originX, originY, width: right - originX, height: bottom - originY }
}

export function plinLogoCropRect(location, width, height) {
  const points = [
    location?.topLeftCorner,
    location?.topRightCorner,
    location?.bottomLeftCorner,
    location?.bottomRightCorner,
  ]
  if (points.some((point) => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const span = Math.max(maxX - minX, Math.max(...points.map((point) => point.y)) - minY)
  if (span <= 0) return null
  const centerX = (minX + maxX) / 2
  const left = Math.max(0, Math.floor(centerX - span * 0.38))
  const right = Math.min(width, Math.ceil(centerX + span * 0.38))
  const top = Math.max(0, Math.floor(minY - span * 1.05))
  const bottom = Math.min(height, Math.ceil(minY - span * 0.45))
  if (right <= left || bottom <= top) return null
  return { originX: left, originY: top, width: right - left, height: bottom - top }
}

function finderTrio(points) {
  const groups = []
  for (const point of points) {
    const group = groups.find((item) => Math.abs(item.x - point.x) < point.size && Math.abs(item.y - point.y) < point.size * 0.8)
    if (!group) groups.push({ ...point, n: 1 })
    else {
      group.x = (group.x * group.n + point.x) / (group.n + 1)
      group.y = (group.y * group.n + point.y) / (group.n + 1)
      group.size = (group.size * group.n + point.size) / (group.n + 1)
      group.n += 1
    }
  }
  const marks = groups.filter((item) => item.n >= 1)
  if (marks.length < 3) return false
  for (let i = 0; i < marks.length; i += 1) {
    for (let j = i + 1; j < marks.length; j += 1) {
      for (let k = j + 1; k < marks.length; k += 1) {
        const sizes = [marks[i].size, marks[j].size, marks[k].size]
        const biggest = Math.max(...sizes)
        const smallest = Math.min(...sizes)
        if (smallest < biggest * 0.45) continue
        const d01 = dist(marks[i], marks[j])
        const d02 = dist(marks[i], marks[k])
        const d12 = dist(marks[j], marks[k])
        const sides = [d01, d02, d12].sort((a, b) => a - b)
        if (sides[0] < 12) continue
        const angle = Math.abs(sides[0] * sides[0] + sides[1] * sides[1] - sides[2] * sides[2]) / (2 * sides[0] * sides[1])
        if (angle < 0.45) return true
      }
    }
  }
  return false
}

function dist(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

function readBits(reader, count) {
  let value = 0
  for (let i = 0; i < count; i += 1) {
    const bit = reader.next()
    if (bit < 0) return -1
    value = (value << 1) | bit
  }
  return value
}

function extendValue(value, bits) {
  if (bits === 0) return 0
  const limit = 1 << (bits - 1)
  if (value < limit) return value - ((1 << bits) - 1)
  return value
}

function huffmanTree(counts, symbols) {
  const root = { 0: null, 1: null }
  let code = 0
  let index = 0
  for (let length = 1; length <= 16; length += 1) {
    for (let i = 0; i < counts[length - 1]; i += 1) {
      let node = root
      for (let bit = length - 1; bit >= 0; bit -= 1) {
        const side = (code >> bit) & 1
        if (bit === 0) node[side] = symbols[index]
        else {
          if (typeof node[side] !== 'object' || node[side] == null) node[side] = { 0: null, 1: null }
          node = node[side]
        }
      }
      index += 1
      code += 1
    }
    code <<= 1
  }
  return root
}

function readSymbol(reader, tree) {
  let node = tree
  while (node && typeof node === 'object') {
    const bit = reader.next()
    if (bit < 0) return -1
    node = node[bit]
  }
  return typeof node === 'number' ? node : -1
}

class BitReader {
  constructor(data, start) {
    this.data = data
    this.p = start
    this.buf = 0
    this.left = 0
  }

  next() {
    if (this.left === 0) {
      if (this.p >= this.data.length) return -1
      let byte = this.data[this.p]
      this.p += 1
      if (byte === 0xff) {
        if (this.p >= this.data.length) return -1
        const mark = this.data[this.p]
        this.p += 1
        if (mark !== 0) return -1
      }
      this.buf = byte
      this.left = 8
    }
    this.left -= 1
    return (this.buf >> this.left) & 1
  }
}

function idct(block) {
  const out = new Uint8ClampedArray(64)
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      let sum = 0
      for (let v = 0; v < 8; v += 1) {
        const cv = v === 0 ? 0.70710678118 : 1
        const cosY = COS[y][v]
        for (let u = 0; u < 8; u += 1) {
          const cu = u === 0 ? 0.70710678118 : 1
          sum += cu * cv * block[v * 8 + u] * COS[x][u] * cosY
        }
      }
      const value = Math.round(sum / 4 + 128)
      out[y * 8 + x] = value < 0 ? 0 : value > 255 ? 255 : value
    }
  }
  return out
}

function decodeBlock(reader, dcTree, acTree, pred, quant) {
  const block = new Float64Array(64)
  const dcBits = readSymbol(reader, dcTree)
  if (dcBits < 0) return null
  const diff = extendValue(readBits(reader, dcBits), dcBits)
  pred += diff
  block[0] = pred * quant[0]
  let k = 1
  while (k < 64) {
    const rs = readSymbol(reader, acTree)
    if (rs <= 0) break
    const size = rs & 15
    const run = rs >> 4
    if (size === 0) {
      k += 16
      continue
    }
    k += run
    const extra = readBits(reader, size)
    if (extra < 0 || k >= 64) break
    block[ZZ[k]] = extendValue(extra, size) * quant[ZZ[k]]
    k += 1
  }
  return { block, pred }
}

export function decodeJpeg(bytes) {
  let p = 2
  const quant = []
  const dc = []
  const ac = []
  let width = 0
  let height = 0
  let components = []
  while (p + 4 < bytes.length) {
    if (bytes[p] !== 0xff) {
      p += 1
      continue
    }
    while (bytes[p] === 0xff) p += 1
    const marker = bytes[p]
    p += 1
    if (marker === 0xd9) break
    if (marker === 0xda) {
      const length = (bytes[p] << 8) | bytes[p + 1]
      const scan = []
      const count = bytes[p + 2]
      let q = p + 3
      for (let i = 0; i < count; i += 1) {
        const id = bytes[q]
        const table = bytes[q + 1]
        scan.push({ id, dc: table >> 4, ac: table & 15 })
        q += 2
      }
      q += 3
      return paintJpeg(bytes, q, width, height, components, scan, quant, dc, ac)
    }
    const length = (bytes[p] << 8) | bytes[p + 1]
    const body = p + 2
    const end = p + length
    if (marker === 0xdb) {
      let q = body
      while (q < end) {
        const info = bytes[q]
        q += 1
        const table = new Uint16Array(64)
        const wide = info >> 4
        for (let i = 0; i < 64; i += 1) {
          table[ZZ[i]] = wide ? (bytes[q] << 8) | bytes[q + 1] : bytes[q]
          q += wide ? 2 : 1
        }
        quant[info & 15] = table
      }
    } else if (marker === 0xc4) {
      let q = body
      while (q < end) {
        const info = bytes[q]
        q += 1
        const counts = Array.from(bytes.subarray(q, q + 16))
        q += 16
        const total = counts.reduce((sum, item) => sum + item, 0)
        const symbols = Array.from(bytes.subarray(q, q + total))
        q += total
        const tree = huffmanTree(counts, symbols)
        if (info >> 4) ac[info & 15] = tree
        else dc[info & 15] = tree
      }
    } else if (marker === 0xc0) {
      height = (bytes[body + 1] << 8) | bytes[body + 2]
      width = (bytes[body + 3] << 8) | bytes[body + 4]
      const count = bytes[body + 5]
      components = []
      for (let i = 0; i < count; i += 1) {
        const at = body + 6 + i * 3
        components.push({
          id: bytes[at],
          h: bytes[at + 1] >> 4,
          v: bytes[at + 1] & 15,
          q: bytes[at + 2],
        })
      }
    } else if (marker === 0xc2) {
      return null
    }
    p = end
  }
  return null
}

function paintJpeg(bytes, start, width, height, components, scan, quant, dcTrees, acTrees) {
  if (!width || !height || !components.length) return null
  const maxH = Math.max(...components.map((item) => item.h))
  const maxV = Math.max(...components.map((item) => item.v))
  const mcuW = maxH * 8
  const mcuH = maxV * 8
  const reader = new BitReader(bytes, start)
  const preds = components.map(() => 0)
  const planes = components.map((item) => new Uint8Array(Math.ceil(width / (mcuW / item.h)) * item.h * 8 * Math.ceil(height / (mcuH / item.v)) * item.v * 8))
  const planeW = components.map((item) => Math.ceil(width / mcuW) * item.h * 8)
  const mcuCols = Math.ceil(width / mcuW)
  const mcuRows = Math.ceil(height / mcuH)
  for (let my = 0; my < mcuRows; my += 1) {
    for (let mx = 0; mx < mcuCols; mx += 1) {
      for (let c = 0; c < components.length; c += 1) {
        const comp = components[c]
        const which = scan.find((item) => item.id === comp.id) || scan[c]
        if (!which || !dcTrees[which.dc] || !acTrees[which.ac] || !quant[comp.q]) return null
        for (let vy = 0; vy < comp.v; vy += 1) {
          for (let hx = 0; hx < comp.h; hx += 1) {
            const decoded = decodeBlock(reader, dcTrees[which.dc], acTrees[which.ac], preds[c], quant[comp.q])
            if (!decoded) return null
            preds[c] = decoded.pred
            const pixels = idct(decoded.block)
            const ox = (mx * comp.h + hx) * 8
            const oy = (my * comp.v + vy) * 8
            for (let y = 0; y < 8; y += 1) {
              for (let x = 0; x < 8; x += 1) {
                planes[c][(oy + y) * planeW[c] + ox + x] = pixels[y * 8 + x]
              }
            }
          }
        }
      }
    }
  }
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const samples = components.map((comp, index) => {
        const sx = Math.min(planeW[index] - 1, Math.floor(x * comp.h / maxH))
        const sy = Math.min(planes[index].length / planeW[index] - 1, Math.floor(y * comp.v / maxV))
        return planes[index][sy * planeW[index] + sx]
      })
      const o = (y * width + x) * 4
      if (samples.length === 1) {
        rgba[o] = rgba[o + 1] = rgba[o + 2] = samples[0]
      } else {
        const yy = samples[0]
        const cb = samples[1] - 128
        const cr = samples[2] - 128
        rgba[o] = clamp(yy + 1.402 * cr)
        rgba[o + 1] = clamp(yy - 0.34414 * cb - 0.71414 * cr)
        rgba[o + 2] = clamp(yy + 1.772 * cb)
      }
      rgba[o + 3] = 255
    }
  }
  return { data: rgba, width, height }
}

function clamp(value) {
  const next = Math.round(value)
  if (next < 0) return 0
  if (next > 255) return 255
  return next
}

async function pixelsFromCanvas(dataUrl) {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return null
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const maxSide = 720
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(image, 0, 0, width, height)
      const frame = ctx.getImageData(0, 0, width, height)
      resolve({ data: frame.data, width, height })
    }
    image.onerror = () => resolve(null)
    image.src = dataUrl
  })
}

async function pixelsFromPng(bytes) {
  if (typeof DecompressionStream !== 'function') return null
  const chunks = []
  let p = 8
  let width = 0
  let height = 0
  let color = 0
  while (p + 8 <= bytes.length) {
    const length = (bytes[p] << 24) | (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3]
    const type = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7])
    const data = bytes.subarray(p + 8, p + 8 + length)
    if (type === 'IHDR') {
      width = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3]
      height = (data[4] << 24) | (data[5] << 16) | (data[6] << 8) | data[7]
      if (data[8] !== 8) return null
      color = data[9]
    } else if (type === 'IDAT') chunks.push(data)
    else if (type === 'IEND') break
    p += 12 + length
  }
  if (!width || !height) return null
  const packed = new Uint8Array(chunks.reduce((sum, item) => sum + item.length, 0))
  let at = 0
  for (const chunk of chunks) {
    packed.set(chunk, at)
    at += chunk.length
  }
  const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream('deflate'))
  const raw = new Uint8Array(await new Response(stream).arrayBuffer())
  const channels = color === 6 ? 4 : color === 2 ? 3 : color === 4 ? 2 : 1
  const stride = width * channels
  const rgba = new Uint8ClampedArray(width * height * 4)
  let src = 0
  let prev = new Uint8Array(stride)
  for (let y = 0; y < height; y += 1) {
    const filter = raw[src]
    src += 1
    const row = raw.subarray(src, src + stride)
    src += stride
    const cur = new Uint8Array(stride)
    for (let i = 0; i < stride; i += 1) {
      const left = i >= channels ? cur[i - channels] : 0
      const up = prev[i] || 0
      const ul = i >= channels ? prev[i - channels] || 0 : 0
      let value = row[i]
      if (filter === 1) value += left
      else if (filter === 2) value += up
      else if (filter === 3) value += Math.floor((left + up) / 2)
      else if (filter === 4) value += paeth(left, up, ul)
      cur[i] = value & 255
    }
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4
      const s = x * channels
      if (channels === 1) rgba[o] = rgba[o + 1] = rgba[o + 2] = cur[s]
      else {
        rgba[o] = cur[s]
        rgba[o + 1] = cur[s + 1]
        rgba[o + 2] = cur[s + 2]
      }
      rgba[o + 3] = 255
    }
    prev = cur
  }
  return shrink({ data: rgba, width, height })
}

function paeth(left, up, ul) {
  const base = left + up - ul
  const dl = Math.abs(base - left)
  const du = Math.abs(base - up)
  const dul = Math.abs(base - ul)
  if (dl <= du && dl <= dul) return left
  if (du <= dul) return up
  return ul
}

function shrink(frame) {
  const maxSide = 720
  const scale = Math.min(1, maxSide / Math.max(frame.width, frame.height))
  if (scale === 1) return frame
  const width = Math.max(1, Math.round(frame.width * scale))
  const height = Math.max(1, Math.round(frame.height * scale))
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    const sy = Math.min(frame.height - 1, Math.floor(y / scale))
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(frame.width - 1, Math.floor(x / scale))
      const from = (sy * frame.width + sx) * 4
      const to = (y * width + x) * 4
      data[to] = frame.data[from]
      data[to + 1] = frame.data[from + 1]
      data[to + 2] = frame.data[from + 2]
      data[to + 3] = 255
    }
  }
  return { data, width, height }
}

async function pixelsOf(bytes, kind, base64) {
  const mime = kind === 'png' ? 'image/png' : 'image/jpeg'
  const drawn = await pixelsFromCanvas(`data:${mime};base64,${base64}`)
  if (drawn) return drawn
  if (kind === 'jpeg') {
    const frame = decodeJpeg(bytes)
    return frame ? shrink(frame) : null
  }
  return pixelsFromPng(bytes)
}

export async function checkQrFile({ base64 }) {
  let bytes
  try {
    bytes = base64ToBytes(base64)
  } catch {
    return { ok: false, error: 'No pude leer ese archivo. Elige una foto JPG o PNG del código QR.' }
  }
  const kind = sniffImage(bytes)
  if (kind !== 'jpeg' && kind !== 'png') {
    return { ok: false, error: 'Solo puedes subir una foto JPG o PNG del código QR. No acepto otros archivos.' }
  }
  const pixels = await pixelsOf(bytes, kind, String(base64 || '').replace(/^data:[^,]*,/, ''))
  if (!pixels) {
    return { ok: false, error: 'No pude leer esa foto. Elige una imagen JPG o PNG del QR.' }
  }
  if (!imageHasQr(pixels.data, pixels.width, pixels.height)) {
    return { ok: false, error: 'Esa imagen no es un código QR. Sube solo el QR de Yape o de Plin, completo y derecho.' }
  }
  return { ok: true, kind }
}

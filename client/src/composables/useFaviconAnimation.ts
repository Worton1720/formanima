import { onMounted, onUnmounted } from 'vue'

export function useFaviconAnimation() {
  let rafId: number | null = null
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null
  let img: HTMLImageElement | null = null
  let link: HTMLLinkElement | null = null
  let loaded = false
  let frame = 0

  function getOrCreateLink(): HTMLLinkElement {
    let el = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-animated]')
    if (!el) {
      el = document.createElement('link')
      el.rel = 'icon'
      el.setAttribute('data-animated', 'true')
      document.head.appendChild(el)
    }
    return el
  }

  function tick() {
    if (!loaded || !ctx || !canvas || !img || !link) {
      rafId = requestAnimationFrame(tick)
      return
    }

    frame++

    // Медленное базовое мерцание (синус) + быстрые случайные всплески
    const base = 0.82 + Math.sin(frame * 0.04) * 0.1
    const flicker = Math.random() > 0.85 ? (Math.random() * 0.18 - 0.09) : 0
    const brightness = Math.min(1, Math.max(0.6, base + flicker))

    // Лёгкое покачивание по вертикали
    const offsetY = Math.sin(frame * 0.03) * 1.2

    ctx.clearRect(0, 0, 32, 32)
    ctx.globalAlpha = brightness
    ctx.drawImage(img, 0, offsetY, 32, 32)
    ctx.globalAlpha = 1

    link.href = canvas.toDataURL('image/png')

    // ~20 FPS достаточно для favicon
    setTimeout(() => {
      rafId = requestAnimationFrame(tick)
    }, 50)
  }

  onMounted(() => {
    canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    ctx = canvas.getContext('2d')
    link = getOrCreateLink()

    img = new Image()
    img.onload = () => { loaded = true }
    img.src = '/logo-icon.png'

    rafId = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    if (rafId !== null) cancelAnimationFrame(rafId)
  })
}

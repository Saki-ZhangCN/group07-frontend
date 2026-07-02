const FALLBACK_COVER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4f46e5"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
  <rect width="800" height="450" fill="url(#g)"/><circle cx="400" cy="190" r="72" fill="none" stroke="white" stroke-width="14" opacity=".9"/>
  <path d="M330 190h140M400 120v140" stroke="white" stroke-width="14" stroke-linecap="round" opacity=".9"/>
  <text x="400" y="330" fill="white" font-size="38" text-anchor="middle" font-family="sans-serif">在线教育课程</text>
</svg>`)}`

export function resourceUrl(path) {
  if (!path) return FALLBACK_COVER
  if (/^(https?:|data:|blob:)/i.test(path)) return path

  const normalized = path.startsWith('/') ? path : `/${path}`
  const configuredBase = import.meta.env.VITE_RESOURCE_BASE_URL
  if (configuredBase) return `${configuredBase.replace(/\/$/, '')}${normalized}`

  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (/^https?:\/\//i.test(apiBase || '')) {
    return `${new URL(apiBase).origin}${normalized}`
  }
  return normalized
}

export function courseCoverUrl(path) {
  return resourceUrl(path || '/uploads/default-image.jpg')
}

export function useFallbackCover(event) {
  const image = event?.target
  if (image && image.src !== FALLBACK_COVER) image.src = FALLBACK_COVER
}

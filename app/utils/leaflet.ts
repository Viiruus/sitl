const SCRIPT_ID = 'bdk-leaflet-script'
const STYLE_ID = 'bdk-leaflet-style'
const LEAFLET_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet'

let loading: Promise<any> | null = null

const loadAsset = (
  id: string,
  create: () => HTMLScriptElement | HTMLLinkElement,
  isLoaded: (element: HTMLScriptElement | HTMLLinkElement) => boolean,
) => new Promise<void>((resolve, reject) => {
  const existing = document.getElementById(id) as HTMLScriptElement | HTMLLinkElement | null
  if (existing && isLoaded(existing)) {
    resolve()
    return
  }
  const element = existing || create()
  element.id = id
  const cleanup = () => {
    clearTimeout(timeout)
    element.removeEventListener('load', onLoad)
    element.removeEventListener('error', onError)
  }
  const onLoad = () => {
    cleanup()
    resolve()
  }
  const onError = () => {
    cleanup()
    element.remove()
    reject(new Error('Impossible de charger Leaflet.'))
  }
  const timeout = setTimeout(onError, 15000)
  element.addEventListener('load', onLoad, { once: true })
  element.addEventListener('error', onError, { once: true })
  if (!existing) document.head.appendChild(element)
})

export const ensureLeafletLoaded = async () => {
  if (typeof window === 'undefined') return null
  if (!loading) {
    loading = Promise.all([
      loadAsset(STYLE_ID, () => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `${LEAFLET_URL}.css`
        return link
      }, element => Boolean((element as HTMLLinkElement).sheet)),
      (window as any).L ? Promise.resolve() : loadAsset(SCRIPT_ID, () => {
        const script = document.createElement('script')
        script.src = `${LEAFLET_URL}.js`
        script.async = true
        return script
      }, () => Boolean((window as any).L)),
    ]).then(() => {
      if (!(window as any).L) throw new Error('Leaflet indisponible.')
      return (window as any).L
    }).catch(error => {
      loading = null
      throw error
    })
  }
  return loading
}

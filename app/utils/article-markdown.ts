import { Marked, type RendererObject, type Tokens } from 'marked'

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const safeUrl = (value: string, allowMail = false) => {
  const trimmed = value.trim()
  if (/^(#|\/)(?!\/)/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString()
    if (allowMail && url.protocol === 'mailto:') return url.toString()
  } catch {
    return null
  }

  return null
}

const renderer: RendererObject = {
  html({ text }: Tokens.HTML | Tokens.Tag) {
    return escapeHtml(text)
  },
  link({ href, title, tokens }: Tokens.Link) {
    const label = this.parser.parseInline(tokens)
    const url = safeUrl(href, true)
    if (!url) return label
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
    const externalAttributes = /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${escapeHtml(url)}"${titleAttribute}${externalAttributes}>${label}</a>`
  },
  image({ href, title, text }: Tokens.Image) {
    const url = safeUrl(href)
    if (!url) return ''
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : ''
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttribute} loading="lazy">`
  },
}

const articleMarkdown = new Marked({
  gfm: true,
  breaks: false,
  renderer,
})

export function renderArticleMarkdown(markdown: string) {
  return articleMarkdown.parse(markdown || '') as string
}

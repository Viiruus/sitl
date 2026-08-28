type LegacyArticleBlock = {
  type?: unknown
  text?: unknown
  url?: unknown
  alt?: unknown
}

const legacyBlockToMarkdown = (block: LegacyArticleBlock) => {
  if (block.type === 'heading' && typeof block.text === 'string') {
    return `## ${block.text.trim()}`
  }
  if (block.type === 'paragraph' && typeof block.text === 'string') {
    return block.text.trim()
  }
  if (block.type === 'image' && typeof block.url === 'string') {
    const alt = typeof block.alt === 'string' ? block.alt.replace(/[\[\]]/g, '').trim() : ''
    return `![${alt}](${block.url.trim()})`
  }
  return ''
}

/** Converts the former block format on read so existing articles remain editable. */
export function articleContentToMarkdown(content: unknown) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(legacyBlockToMarkdown).filter(Boolean).join('\n\n')
}

export function markdownContainsText(markdown: string) {
  const withoutImages = markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  const withoutSyntax = withoutLinks.replace(/[`*_>#~\-|\[\]()]/g, ' ')
  return /[\p{L}\p{N}]/u.test(withoutSyntax)
}

export function articleMarkdownExcerpt(content: unknown, maxLength = 180) {
  const markdown = articleContentToMarkdown(content)
  const plainText = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plainText.length <= maxLength) return plainText
  return `${plainText.slice(0, maxLength).replace(/\s+\S*$/, '').trim()}…`
}

const markdownBlockToPlainText = (block: string) => block
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[`*_>#~|]/g, ' ')
  .replace(/^\s*[-+]\s+/gm, '')
  .replace(/\s+/g, ' ')
  .trim()

const truncateSeoDescription = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value

  const candidate = value.slice(0, maxLength).trim()
  if (/[.!?…]$/.test(candidate)) return candidate

  const shortened = value.slice(0, Math.max(1, maxLength - 1))
  const sentenceEnd = Math.max(
    shortened.lastIndexOf('. '),
    shortened.lastIndexOf('! '),
    shortened.lastIndexOf('? '),
  )
  if (sentenceEnd >= Math.floor(maxLength * 0.65)) {
    return shortened.slice(0, sentenceEnd + 1).trim()
  }

  return `${shortened.replace(/\s+\S*$/, '').trim()}…`
}

/** Builds a search-friendly summary while ignoring Markdown images and introductory metadata. */
export function articleSeoDescription(content: unknown, maxLength = 180) {
  const markdown = articleContentToMarkdown(content)
  const narrativeParagraphs = markdown
    .split(/\n\s*\n/)
    .map(raw => ({
      raw: raw.trim(),
      text: markdownBlockToPlainText(raw),
    }))
    .filter(({ raw, text }) => {
      if (!text || /^#{1,6}\s/.test(raw) || /^!\[[^\]]*\]\([^)]*\)$/.test(raw)) return false
      // Article introductions sometimes begin with a bold date and location.
      if (/^\*\*[^*]+\*\*$/.test(raw) && text.length < 80) return false
      return true
    })
    .map(({ text }) => text)

  return truncateSeoDescription(narrativeParagraphs.join(' '), maxLength)
}

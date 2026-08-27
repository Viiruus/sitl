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

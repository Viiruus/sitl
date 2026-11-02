export type BrigadeImageVariant = { url: string; width: number; size?: number }

export type BrigadeBankImage = {
  id: number
  url: string
  alt: string
  variants: BrigadeImageVariant[]
  credit: string
  folder: { id: number; name: string }
}

export type BrigadeImageToShare = {
  url: string
  variants: BrigadeImageVariant[]
  alt?: string
}

export function normalizeBrigadeFolderName(value: string) {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ')
}

export function brigadeFolderNameKey(value: string) {
  return normalizeBrigadeFolderName(value)
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr-FR').replace(/[’'\s_-]+/g, ' ')
    .trim()
}

export function brigadeImageThumbnail(image: Pick<BrigadeBankImage, 'url' | 'variants'>) {
  const variants = [...image.variants].sort((a, b) => a.width - b.width)
  return variants.find(variant => variant.width >= 480)?.url || image.url
}

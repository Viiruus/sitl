<script setup lang="ts">
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'

const props = withDefaults(defineProps<{
  moniteur: any
  imageSizes?: string
}>(), {
  imageSizes: '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw',
})

const fallbackImage = '/images/escalade-grande-voie-calanques.jpg'

const profileImageFor = (moniteur: any) =>
  resolveStoredImageSrc(moniteur?.profileImageUrl, moniteur?.profileImageVariants) || fallbackImage

const profileImageSrcset = (moniteur: any) => buildStoredSrcset(moniteur?.profileImageVariants)

const locationLabelFor = (moniteur: any) => moniteur?.baseLocation || 'Localisation à venir'

const nextStageDate = computed(() => {
  const stage = props.moniteur?.nextStage
  if (!stage?.dateDebut) return null
  return formatSessionRangeLabel(stage.dateDebut, stage.dateFin)
})
</script>

<template>
  <NuxtLink
    :to="`/moniteurs/${moniteur.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
  >
    <div class="relative aspect-square overflow-hidden rounded-xl outline-1 -outline-offset-1 outline-white/10">
      <img
        class="absolute inset-0 h-full w-full object-cover"
        :src="profileImageFor(moniteur)"
        :srcset="profileImageSrcset(moniteur)"
        :alt="moniteur.fullName"
        decoding="async"
        :sizes="imageSizes"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-brand-950/35 via-transparent to-transparent" />
    </div>
    <div class="flex flex-1 flex-col px-1 pt-1">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 pt-2">
          <h3 class="truncate text-xl font-semibold tracking-tight text-white group-hover:text-secondaryBrand-200">
          {{ moniteur.fullName }}
          </h3>
          <div class="mt-2 flex h-12 items-start gap-2 text-sm text-brand-100/75">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6" />
            </svg>
            <span class="line-clamp-2"><span class="sr-only">Camp de base : </span>{{ locationLabelFor(moniteur) }}</span>
          </div>
        </div>
        <GuideFranceLocator
          :department="moniteur.department"
          :latitude="moniteur.baseLatitude"
          :longitude="moniteur.baseLongitude"
          :location-label="locationLabelFor(moniteur)"
        />
      </div>

      <div class="mt-auto pt-4">
        <div v-if="nextStageDate" class="flex h-28 items-start gap-3 rounded-xl bg-secondaryBrand-400/10 px-3 py-3 ring-1 ring-secondaryBrand-300/15">
          <svg class="mt-0.5 h-5 w-5 shrink-0 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path stroke-linecap="round" d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          <div class="min-w-0">
            <p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-secondaryBrand-200/70">Prochain stage</p>
            <p class="mt-1 text-sm font-semibold text-white">{{ nextStageDate }}</p>
            <p class="mt-0.5 line-clamp-1 text-xs text-brand-100/60">{{ moniteur.nextStage.titre }}</p>
          </div>
        </div>
        <div v-else class="flex h-28 items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-xs text-brand-100/50">
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          Prochain stage bientôt annoncé
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

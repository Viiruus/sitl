<script setup lang="ts">
import { buildStoredSrcset, resolveStoredImageSrc } from '~/composables/useStoredImageVariants'
import { formatDurationDays, formatSessionRangeLabel } from '~~/shared/utils/aventure-schedule'
import { getGuideRoleLabel } from '~~/shared/utils/guide-gender'

const props = withDefaults(defineProps<{
  stage: any
  session?: any
  headingLevel?: 'h2' | 'h3'
  imageSizes?: string
  withBorder?: boolean
}>(), {
  session: null,
  headingLevel: 'h2',
  imageSizes: '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw',
  withBorder: true,
})

const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Terrain d’aventure',
  VIA_FERRATA: 'Via ferrata',
}

const disciplineIcons: Record<string, string> = {
  GRANDE_VOIE: '/images/grande-voie-white.png',
  FALAISE: '/images/couenne-white.png',
  BLOC: '/images/bloc-white.png',
  TRAD: '/images/trad-white.png',
  VIA_FERRATA: '/images/via-ferrata-white.svg',
}

const disciplineImages: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
  VIA_FERRATA: '/images/rappel-Calanques.jpg',
}

const displaySession = computed(() => props.session ?? props.stage?.nextSession ?? null)

const formatDisciplineLabel = (value?: string | null) => {
  if (!value) return 'Escalade'
  return disciplineLabels[value] ?? value.replace(/_/g, ' ')
}

const iconPathForDiscipline = (value?: string | null) => {
  if (!value) return disciplineIcons.GRANDE_VOIE
  return disciplineIcons[value] ?? disciplineIcons.GRANDE_VOIE
}

const imageForDiscipline = (value?: string | null) => {
  if (!value) return disciplineImages.GRANDE_VOIE
  return disciplineImages[value] ?? disciplineImages.GRANDE_VOIE
}

const stageCoverSrc = (stage: any) =>
  resolveStoredImageSrc(stage?.coverImageUrl, stage?.coverImageVariants) || imageForDiscipline(stage?.discipline)

const stageCoverSrcset = (stage: any) => buildStoredSrcset(stage?.coverImageVariants)

const guideAvatarSrc = (stage: any) =>
  resolveStoredImageSrc(stage?.guideImageUrl, stage?.guideImageVariants) || imageForDiscipline(stage?.discipline)

const guideAvatarSrcset = (stage: any) => buildStoredSrcset(stage?.guideImageVariants)

const formatSessionRange = (session: any) => {
  if (!session) return 'Date à confirmer'
  return formatSessionRangeLabel(session.dateDebut, session.dateFin)
}
</script>

<template>
  <NuxtLink
    :to="`/stages-escalade/${stage.slug}`"
    class="block overflow-hidden rounded-3xl bg-brand-950 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:shadow-3xl hover:shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-400"
    :class="withBorder ? 'border border-brand-900 hover:border-secondaryBrand-500/50' : 'border-0'"
  >
    <div class="relative h-72 w-full overflow-hidden">
      <img
        :src="stageCoverSrc(stage)"
        :srcset="stageCoverSrcset(stage)"
        :alt="stage.titre"
        class="size-full object-cover transition duration-500 hover:scale-105"
        decoding="async"
        :sizes="imageSizes"
        loading="lazy"
      />
      <StageSoldOutRibbon v-if="stage.estComplet" />
      <div class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
      <div class="absolute inset-0 flex flex-col justify-between px-6 py-6 text-white">
        <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
          <div class="flex flex-1 flex-wrap items-center gap-3">
            <span class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20">
              {{ formatDisciplineLabel(stage.discipline) }}
            </span>
            <span class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              {{ formatDurationDays(stage.jours) }}
            </span>
          </div>
          <div class="ml-auto">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/30 sm:h-14 sm:w-14">
              <img
                :src="iconPathForDiscipline(stage.discipline)"
                :alt="formatDisciplineLabel(stage.discipline)"
                class="h-8 w-8 object-contain sm:h-10 sm:w-10"
              />
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <component :is="headingLevel" class="truncate text-2xl font-semibold">
            {{ stage.titre }}
          </component>
          <p v-if="stage.sousTitre" class="text-sm text-brand-100/80">
            {{ stage.sousTitre }}
          </p>
        </div>
        <div class="flex flex-col gap-1 text-sm text-white">
          <span class="inline-flex items-center gap-2 text-xs font-semibold text-white">
            <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {{ formatSessionRange(displaySession) }}
          </span>
          <span class="inline-flex items-center gap-2 text-xs font-semibold text-white">
            <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
              <circle cx="12" cy="11" r="2.3" />
            </svg>
            {{ stage.lieuLabel }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-center justify-between text-sm text-white">
        <div class="flex items-center gap-3 text-sm text-brand-100/80">
          <img
            :src="guideAvatarSrc(stage)"
            :srcset="guideAvatarSrcset(stage)"
            :alt="stage.guideName || getGuideRoleLabel(stage.guideGender, { capitalized: true })"
            class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
            decoding="async"
            sizes="40px"
            loading="lazy"
          />
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
              {{ getGuideRoleLabel(stage.guideGender, { capitalized: true }) }}
            </p>
            <p class="font-semibold text-white">
              {{ stage.guideName || `${getGuideRoleLabel(stage.guideGender, { capitalized: true })} local${stage.guideGender === 'female' ? 'e' : ''}` }}
            </p>
          </div>
        </div>
        <span class="font-semibold text-right">
          {{ stage.prixParPersonne }} € <span class="text-xs text-brand-200">/ pers</span>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

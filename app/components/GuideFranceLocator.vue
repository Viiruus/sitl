<script setup lang="ts">
const props = defineProps<{
  department?: string | null
  latitude?: number | null
  longitude?: number | null
  locationLabel?: string | null
}>()

const regionMarkers = [
  { codes: ['02', '59', '60', '62', '80'], longitude: 2.7, latitude: 49.9 },
  { codes: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'], longitude: 6, latitude: 48.6 },
  { codes: ['14', '27', '50', '61', '76'], longitude: 0, latitude: 49 },
  { codes: ['22', '29', '35', '56'], longitude: -3, latitude: 48 },
  { codes: ['75', '77', '78', '91', '92', '93', '94', '95'], longitude: 2.5, latitude: 48.7 },
  { codes: ['18', '28', '36', '37', '41', '45'], longitude: 1.7, latitude: 47.3 },
  { codes: ['21', '25', '39', '58', '70', '71', '89', '90'], longitude: 4.8, latitude: 47 },
  { codes: ['44', '49', '53', '72', '85'], longitude: -0.7, latitude: 47.4 },
  { codes: ['16', '17', '19', '23', '24', '33', '40', '47', '64', '79', '86', '87'], longitude: -0.4, latitude: 45 },
  { codes: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'], longitude: 4.8, latitude: 45.5 },
  { codes: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'], longitude: 2, latitude: 43.8 },
  { codes: ['04', '05', '06', '13', '83', '84'], longitude: 6, latitude: 43.8 },
  { codes: ['2A', '2B'], longitude: 9, latitude: 42.2 },
]

const projectLongitude = (longitude: number) => 10 + (longitude + 4.59235) * 5.56
const projectLatitude = (latitude: number) => 5 + (51.148506 - latitude) * 8

const departmentCode = computed(() => {
  const match = props.department?.trim().toUpperCase().match(/\b(2A|2B|0[1-9]|[1-8]\d|9[0-5]|97[1-6])\b/)
  return match?.[1] ?? null
})

const gpsMarker = computed(() => {
  const latitude = Number(props.latitude)
  const longitude = Number(props.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  const x = projectLongitude(longitude)
  const y = projectLatitude(latitude)
  if (x < 4 || x > 96 || y < 4 || y > 86) return null

  return { x, y }
})

const marker = computed(() => {
  if (gpsMarker.value) return gpsMarker.value
  const region = regionMarkers.find(region => departmentCode.value && region.codes.includes(departmentCode.value))
  if (!region) return null
  return {
    x: projectLongitude(region.longitude),
    y: projectLatitude(region.latitude),
  }
})
</script>

<template>
  <div
    class="shrink-0"
    role="img"
    :aria-label="gpsMarker
      ? `Localisation du camp de base ${locationLabel || ''}`
      : marker
        ? `Localisation approximative du camp de base dans le département ${departmentCode}`
      : 'Carte de France — localisation précise du camp de base à renseigner'"
  >
    <svg class="h-20 w-20" viewBox="0 0 100 90" fill="none" aria-hidden="true">
      <!-- Contour Natural Earth 1:110m, données cartographiques du domaine public. -->
      <path
        d="M69.9 18.5 72.6 20.6 80.6 22 77.8 27.5 77 33.2 75.5 34.6 73 33.9 73.2 35.9 69.1 40.4 69 44 71.7 42.8 73.6 46.3 73.4 48.5 75 51.5 73.1 54 74.5 60.1 77.5 61.2 76.9 64.6 71.8 69.2 60.9 67 52.8 69.6 52.1 74.4 45.7 75.4 39.4 71.8 37.4 73.6 27.2 69.9 25 66.8 27.8 62 28.9 46.1 23.2 37.7 19.1 33.6 10.6 30.5 10 24.7 17.2 23 26.5 25 24.8 16 30 19.4 43 13.2 44.6 6.6 49.5 5 50.3 7.8 52.9 7.9 55.5 11.2 59.4 14.9 62.2 14.3 67.1 18 68.3 18.6Z"
        class="fill-white/[0.045] stroke-white/20"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
      <path
        d="M84.2 73.2 87.7 70.1 88.7 77 86.9 83.1 84.3 81.5 83 76.1Z"
        class="fill-white/[0.045] stroke-white/20"
        stroke-width="1.3"
        stroke-linejoin="round"
      />
      <template v-if="marker">
        <circle :cx="marker.x" :cy="marker.y" r="6.5" :class="gpsMarker ? 'fill-secondaryBrand-400/25' : 'fill-secondaryBrand-400/15'" />
        <circle :cx="marker.x" :cy="marker.y" r="3.2" class="fill-secondaryBrand-300 stroke-brand-950" stroke-width="1.8" />
      </template>
    </svg>
  </div>
</template>

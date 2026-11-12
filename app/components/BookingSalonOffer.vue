<script setup lang="ts">
import type { SalonBookingOffer } from '~~/shared/utils/salon-escalade-offer'

defineProps<{ offer?: SalonBookingOffer | null }>()
</script>

<template>
  <div v-if="offer" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
    <p class="font-bold">{{ offer.label }} · −{{ offer.discountPercent }} %</p>
    <p class="mt-1 leading-relaxed">Inscription pendant le Salon : {{ offer.discountPercent }} % de réduction sur ce stage, à prendre en compte pour le règlement.</p>
  </div>
</template>

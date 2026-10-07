<script setup lang="ts">
import { departmentLandings } from '~/data/department-landings'
import { escaladeDepartments } from '~~/shared/data/escalade-departments'

definePageMeta({ key: route => route.path })
const slug = String(useRoute().params.departement ?? '')
const content = departmentLandings.find(page => escaladeDepartments[page.code].slug === slug)
if (!content) throw createError({ statusCode: 404, statusMessage: 'Ce département n’est pas disponible.' })
</script>

<template>
  <DepartmentLandingPage v-if="content" :key="content.code" :content="content" />
</template>

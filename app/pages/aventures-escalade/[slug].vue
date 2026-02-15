<script setup lang="ts">
const route = useRoute()

const slug = typeof route.params.slug === 'string' ? route.params.slug : null

await navigateTo(
  {
    path: slug ? `/stages-escalade/${slug}` : '/stages-escalade',
    query: route.query,
    hash: route.hash,
  },
  { redirectCode: 301 },
)
</script>

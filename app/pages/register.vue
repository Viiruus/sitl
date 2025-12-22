<script setup lang="ts">
const route = useRoute()

const email = ref('')
const password = ref('')
const source = computed(() => (route.query.source as string) || 'direct')

const loading = ref(false)
const error = ref<string | null>(null)

const submit = async () => {
  error.value = null
  loading.value = true
  try {
    await $fetch('/api/register', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        source: source.value,  // ⬅️ ici
      },
    })
    await navigateTo('/onboarding')
  } catch (e: any) {
    error.value = e?.data?.message || 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
}
</script>

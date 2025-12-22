<template>

  <div class="bg-brand-950">
    <!-- Header réutilisable -->
    <AppHeader />

    <!-- Hero Section -->
    <div class="py-24 md:py-32 lg:py-56">
      <div class="mx-auto grid max-w-7xl grid-cols-1 gap-20 px-6 lg:px-8 xl:grid-cols-3">
        <div class="mx-auto max-w-2xl lg:mx-0">
          <h2 class="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">Le moniteur</h2>
          <p class="mt-6 text-lg/8 text-gray-400">Je suis ton guide dédié pour t’accompagner dans chaque projet : découvrir la falaise, gagner en autonomie ou vivre une grande voie mémorable.</p>
        </div>
        <div class="mx-auto max-w-2xl xl:col-span-2">
          <div class="rounded-3xl bg-white/5 p-8 shadow-lg shadow-black/30 ring-1 ring-white/10">
            <img class="aspect-[4/3] w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-white/10" :src="guide.imageUrl" alt="" />
            <h3 class="mt-6 text-3xl font-semibold text-white">{{ guide.name }}</h3>
            <p class="text-base/7 text-secondaryBrand-200">{{ guide.role }}</p>
            <p class="mt-4 text-base/7 text-gray-300">{{ guide.bio }}</p>
            <ul role="list" class="mt-6 flex gap-x-6">
              <li>
                <a :href="guide.xUrl" class="text-gray-400 hover:text-gray-300">
                  <span class="sr-only">X</span>
                  <svg class="size-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11.4678 8.77491L17.2961 2H15.915L10.8543 7.88256L6.81232 2H2.15039L8.26263 10.8955L2.15039 18H3.53159L8.87581 11.7878L13.1444 18H17.8063L11.4675 8.77491H11.4678ZM9.57608 10.9738L8.95678 10.0881L4.02925 3.03974H6.15068L10.1273 8.72795L10.7466 9.61374L15.9156 17.0075H13.7942L9.57608 10.9742V10.9738Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a :href="guide.linkedinUrl" class="text-gray-400 hover:text-gray-300">
                  <span class="sr-only">LinkedIn</span>
                  <svg class="size-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Footer réutilisable -->
  <AppFooter />
  
</template>

<script setup>
const guide = {
  name: 'Nicolas Guillemain',
  role: 'Guide d’escalade diplômé d’État',
  imageUrl: '/images/guide-nicolas.jpg',
  bio: 'Passionné d’escalade depuis plus de 20 ans, je t’accompagne en grande voie, falaise sportive ou terrain d’aventure pour t’aider à progresser en toute sécurité, comprendre les manips et vivre des moments mémorables en montagne.',
  xUrl: '#',
  linkedinUrl: '#',
}
</script>

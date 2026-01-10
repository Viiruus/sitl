<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <AppHeader />

    <!-- States -->
    <section
      v-if="pending"
      class="mx-auto max-w-3xl px-6 py-32 text-center text-brand-100"
    >
      Chargement de l'aventure...
    </section>

    <section
      v-else-if="error || !stage"
      class="mx-auto max-w-3xl px-6 py-32 text-center text-brand-100"
    >
      <p class="text-lg font-semibold">
        Impossible de trouver cette aventure.
      </p>
      <NuxtLink
        to="/aventures-escalade"
        class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
      >
        Revenir aux aventures
      </NuxtLink>
    </section>

    <section v-else>
      <!-- HERO + GUIDE + STATS -->
      <div class="relative isolate overflow-hidden bg-brand-950 pb-16 pt-40 sm:pt-48 lg:pt-56">
        <!-- Fond image -->
        <div class="absolute inset-0 -z-10">
          <img
            :src="heroImage"
            :alt="stage.titre"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-brand-950 via-brand-950/85 to-brand-950"
          />
        </div>

        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <!-- Titre + Guide côte à côte -->
          <div
            class="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]"
          >
            <!-- Titre + tags -->
            <div class="space-y-6">
              <div class="flex flex-wrap items-center gap-3 text-xs">
                <span class="inline-flex items-center justify-center rounded-full bg-secondaryBrand-400/80 p-2 shadow-lg shadow-secondaryBrand-900/30">
                  <img
                    :src="iconPathForDiscipline(stage.discipline)"
                    :alt="formatDisciplineLabel(stage.discipline)"
                    class="h-8 w-8 object-contain"
                  />
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-brand-900/70 px-3 py-1 text-[11px] font-medium text-brand-100"
                >
                  <svg
                    class="h-3.5 w-3.5 text-secondaryBrand-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z"
                    />
                    <circle cx="12" cy="11" r="2.3" />
                  </svg>
                  <span class="text-sm">
                    {{ stage.lieuLabel }}
                    <span v-if="stage.region" class="ml-1">· {{ stage.region }}</span>
                  </span>
                </span>
              </div>

              <div class="space-y-3">
                <h1
                  class="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
                >
                  {{ stage.titre }}
                </h1>
                <p
                  v-if="stage.sousTitre"
                  class="text-sm text-brand-100/85 sm:text-base"
                >
                  {{ stage.sousTitre }}
                </p>

                <!-- STATS SECTION -->
                <div class="pt-4 flex flex-wrap gap-3">
                  <div class="inline-flex items-center gap-2 rounded-full bg-brand-900/70 px-3 py-2 text-sm text-white ring-1 ring-white/10">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-secondaryBrand-200/90">Durée</span>
                    <span class="font-semibold">{{ stage.jours }} {{ stage.jours > 1 ? 'jours' : 'jour' }}</span>
                  </div>
                  <div class="inline-flex items-center gap-2 rounded-full bg-brand-900/70 px-3 py-2 text-sm text-white ring-1 ring-white/10">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-secondaryBrand-200/90">Niveau</span>
                    <span class="font-semibold">{{ stage.niveauMinimum || 'Tous niveaux' }}</span>
                  </div>
                  <div class="inline-flex items-center gap-2 rounded-full bg-brand-900/70 px-3 py-2 text-sm text-white ring-1 ring-white/10">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-secondaryBrand-200/90">Places max</span>
                    <span class="font-semibold">{{ stage.placesMax }}</span>
                  </div>
                  <div class="inline-flex items-center gap-2 rounded-full bg-brand-900/70 px-3 py-2 text-sm text-white ring-1 ring-white/10">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-secondaryBrand-200/90">Tarif / pers</span>
                    <span class="font-semibold">{{ stage.prixParPersonne }} €</span>
                  </div>
                </div>


              </div>
            </div>

            <!-- Bloc Guide + mini galerie à droite -->
            <div class="space-y-12 lg:sticky lg:top-24">
              <NuxtLink
                v-if="guideFullName"
                :to="guideProfileLink || '#'"
                class="block space-y-3 rounded-3xl bg-brand-950/85 p-5 ring-1 ring-secondaryBrand-400/40 shadow-xl shadow-black/40 transition hover:ring-secondaryBrand-300/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondaryBrand-300"
              >
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-200">
                  Moniteur de l’aventure
                </p>
                <div class="flex items-center gap-4">
                  <div
                    class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-secondaryBrand-400 bg-brand-900"
                  >
                    <img
                      v-if="guideImage"
                      :src="guideImage"
                      :alt="guideFullName"
                      class="size-full object-cover"
                    />
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm font-semibold text-white">
                      {{ guideFullName }}
                    </p>
                    <p v-if="guideBaseLocation" class="text-xs text-brand-200">
                      Basé·e à {{ guideBaseLocation }}
                    </p>
                    <p v-if="languesList.length" class="text-[11px] text-brand-300">
                      Langues : {{ languesList.join(', ') }}
                    </p>
                  </div>
                </div>
                <p
                  v-if="guideBioShort"
                  class="text-xs text-brand-100/90"
                >
                  {{ guideBioShort }}
                </p>
                <p
                  v-else
                  class="text-xs text-brand-100/80"
                >
                  Moniteur·rice d’escalade passionné·e de belles lignes, de grande voie
                  et d’ambiances conviviales, aux manettes de ta prochaine aventure.
                </p>

              </NuxtLink>

              <div
                v-if="galerieImages.length"
                class="mt-3 grid grid-cols-3 gap-3"
              >
                <button
                  v-for="(img, idx) in galerieImages.slice(0, 3)"
                  :key="img.id || idx"
                  type="button"
                  class="relative h-28 w-full overflow-hidden rounded-xl bg-white/5 transition hover:opacity-100"
                  @click="() => openLightbox(idx)"
                >
                  <img :src="img.url" :alt="img.alt || stageTitle" class="size-full object-cover" loading="lazy" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN + TABS -->
      <main class="bg-brand-950 pb-24">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <!-- Onglets -->
          <div class="mb-6 border-b border-white/10 pb-2">
            <nav class="flex gap-2 overflow-x-auto text-xs">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                @click="activeTab = tab.id"
                :class="[
                  'whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition',
                  activeTab === tab.id
                    ? 'bg-secondaryBrand-500 text-brand-950'
                    : 'bg-brand-900 text-brand-100 hover:bg-brand-800',
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div
            class="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start"
          >
            <!-- COLONNE GAUCHE : contenu tabulé -->
            <div class="space-y-8 text-sm text-brand-100">
              <!-- TAB : OVERVIEW -->
              <section
                v-if="activeTab === 'overview'"
                class="space-y-8"
              >
                <div class="space-y-6">
                  <div class="rounded-3xl bg-brand-900/70 p-6 ring-1 ring-white/10">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 class="text-xl font-semibold text-white uppercase">
                          En bref
                        </h2>
                      </div>
                    </div>
                    <p class="mt-3 text-sm text-brand-100/90">
                      {{ resumeCeQuiTattend || "Une aventure locale pour progresser en grimpe sans perdre le kif." }}
                    </p>
                  </div>
                  <div class="grid gap-6 lg:grid-cols-2">
                    <div
                      v-if="hasPrerequisSection"
                      class="rounded-3xl bg-brand-900/50 p-6 ring-1 ring-white/10"
                    >
                      <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                        Pre-requis
                      </h3>
                      <ul
                        v-if="prerequisList.length"
                        class="mt-4 space-y-2 text-sm text-brand-100/90"
                      >
                        <li
                          v-for="item in prerequisList"
                          :key="item"
                          class="flex gap-2 rounded-2xl bg-brand-900/70 px-3 py-2"
                        >
                          <span class="mt-2 h-1.5 w-1.5 rounded-full bg-brand-400" />
                          <span>{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                    <div
                      v-if="hasObjectifsSection"
                      class="rounded-3xl bg-brand-900/50 p-6 ring-1 ring-white/10"
                    >
                      <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                        Objectifs
                      </h3>
                      <p
                        v-if="objectifsText"
                        class="mt-2 text-sm text-brand-100/90 whitespace-pre-line"
                      >
                        {{ objectifsText }}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- TAB : PROGRAMME -->
              <section
                v-else-if="activeTab === 'programme'"
                class="space-y-4"
              >
                <div
                  v-if="stage.descriptionLongue"
                  class="rounded-2xl bg-brand-900/40 p-4 text-sm text-brand-100/90 ring-1 ring-white/10"
                >
                  <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                    Descriptif détaillé
                  </h3>
                  <p class="mt-2 text-sm text-brand-100/90 whitespace-pre-line">
                    {{ stage.descriptionLongue }}
                  </p>
                </div>

                <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                  Programme jour par jour
                </h3>
                <div
                  v-if="programmeJours.length"
                  class="mt-4 space-y-3"
                >
                  <article
                    v-for="jour in programmeJours"
                    :key="jour.id"
                    class="flex gap-3 rounded-xl bg-brand-900/50 p-3 ring-1 ring-white/10"
                  >
                    <div
                      class="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondaryBrand-500 text-[11px] font-semibold text-brand-950"
                    >
                      J{{ jour.ordre || 1 }}
                    </div>
                    <div class="space-y-1">
                      <h3 class="text-sm font-semibold text-white">
                        {{ jour.titre }}
                      </h3>
                      <p
                        v-if="jour.lieuLabel"
                        class="text-[11px] uppercase tracking-wide text-brand-200"
                      >
                        {{ jour.lieuLabel }}
                      </p>
                      <p
                        v-if="jour.description"
                        class="text-sm text-brand-100/90 whitespace-pre-line"
                      >
                        {{ jour.description }}
                      </p>
                    </div>
                  </article>
                </div>

                <p
                  v-else
                  class="mt-3 text-sm text-brand-100/80"
                >
                  Le programme détaillé sera partagé par le moniteur avant le départ.
                </p>
              </section>

              <!-- TAB : INFOS PRATIQUES -->
              <section
                v-else-if="activeTab === 'infos'"
                class="space-y-6"
              >
                <!-- Matériel / Transport -->
                <div class="grid gap-4 lg:grid-cols-2">
                  <div class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10">
                    <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                      Matériel
                    </h3>
                    <div v-if="equipementRequisList.length">
                      <p class="text-sm font-semibold text-brand-200">
                        À apporter
                      </p>
                      <ul class="mt-1 space-y-1 text-xs text-brand-100/90">
                        <li
                          v-for="item in equipementRequisList"
                          :key="'req-' + item"
                          class="flex gap-2"
                        >
                          <span
                            class="mt-2 h-1.5 w-1.5 rounded-full bg-secondaryBrand-400"
                          />
                          <span class="text-sm">{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                    <div v-if="equipementFourniList.length" class="mt-4">
                      <p class="text-sm font-semibold text-brand-200">
                        Fournis par le guide
                      </p>
                      <ul class="mt-1 space-y-1 text-xs text-brand-100/90">
                        <li
                          v-for="item in equipementFourniList"
                          :key="'fourni-' + item"
                          class="flex gap-2"
                        >
                          <span
                            class="mt-2 h-1.5 w-1.5 rounded-full bg-brand-400"
                          />
                          <span class="text-sm">{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                    <p
                      v-if="!equipementRequisList.length && !equipementFourniList.length"
                      class="text-sm text-brand-100/80"
                    >
                      La liste précise du matériel est envoyée après inscription.
                    </p>
                  </div>

                  <div class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10">
                    <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                      Transport & RDV
                    </h3>
                    <p
                      v-if="stage.transportLabel"
                      class="text-sm text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.transportLabel }}
                    </p>
                    <p
                      v-if="stage.pointRdv"
                      class="text-sm text-brand-100/90"
                    >
                      <span class="font-semibold text-sm">Point de rendez-vous :</span>
                      {{ stage.pointRdv }}
                    </p>
                    <p
                      v-if="stage.pointsLocaux"
                      class="text-sm text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.pointsLocaux }}
                    </p>
                    <p
                      v-if="!hasTransport"
                      class="text-sm text-brand-100/90 whitespace-pre-line"
                    >
                      L'organisation pour le transport sera communiquée par le moniteur après l'inscription.
                    </p>
                  </div>
                </div>

                <!-- Inclus / Non inclus -->
                <div class="grid gap-4 lg:grid-cols-2">
                  <div
                    class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10"
                  >
                    <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                      Inclus
                    </h3>
                    <p
                      class="text-sm text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.inclus || 'Encadrement par un moniteur·rice diplômé·e, choix de secteurs adaptés, brief sécurité.' }}
                    </p>
                  </div>

                  <div
                    class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10"
                  >
                    <h3 class="text-xl font-semibold uppercase tracking-wide text-white">
                      Non inclus
                    </h3>
                    <p
                      class="text-sm text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.nonInclus || 'Transport, hébergement et repas selon les besoins du groupe.' }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="mapEmbedUrl"
                  class="rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-200">
                        Localisation
                      </p>
                      <p class="text-sm text-brand-100/85">
                        {{ stage.lieuLabel }}
                      </p>
                    </div>
                    <NuxtLink
                      :to="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stage.lieuLabel || '')}`"
                      target="_blank"
                      rel="noopener"
                      class="text-xs font-semibold text-secondaryBrand-300 hover:text-secondaryBrand-200 underline"
                    >
                      Ouvrir dans Google Maps
                    </NuxtLink>
                  </div>
                  <div class="mt-3 overflow-hidden rounded-xl ring-1 ring-white/10">
                    <iframe
                      :src="mapEmbedUrl"
                      width="100%"
                      height="300"
                      style="border:0;"
                      allowfullscreen
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </section>
            </div>

            <div class="space-y-6">
              <!-- COLONNE DROITE : encart Réservation sticky -->
              <aside class="lg:sticky lg:top-32 lg:h-fit">
                <div
                  class="relative rounded-3xl bg-white p-6 text-gray-900 shadow-2xl shadow-black/30 ring-1 ring-gray-900/10"
                >
                  <div class="flex items-start justify-between gap-3">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                      INSCRIPTION
                    </p>
                    <div class="relative group/info">
                      <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center text-brand-800 transition hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-secondaryBrand-400 focus:ring-offset-2 focus:ring-offset-white"
                        aria-label="Infos inscription"
                      >
                        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <circle cx="12" cy="12" r="9" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8h.01M11 12h1v4h1" />
                        </svg>
                      </button>
                      <div
                        class="pointer-events-none absolute right-0 top-10 z-10 w-64 rounded-2xl bg-secondaryBrand-400 px-4 py-3 text-[11px] font-semibold leading-snug text-brand-950 shadow-lg shadow-secondaryBrand-900/30 ring-1 ring-secondaryBrand-300/70 opacity-0 translate-y-1 transition duration-200 ease-out group-hover/info:opacity-100 group-hover/info:translate-y-0 group-focus-within/info:opacity-100 group-focus-within/info:translate-y-0"
                      >
                        Lorsque tu t’inscris, le moniteur prend contact avec toi pour l’organisation.
                        <br/>
                        Tu règles l’acompte et le solde directement auprès de lui.
                        <br/>
                        Tu comptes les dodos et tu pars à l’aventure.
                      </div>
                    </div>
                  </div>
                  <h3 class="mt-2 text-lg font-semibold text-gray-900">
                    Tu peux partir quand ?
                  </h3>
                  <p class="mt-1 text-xs text-gray-500" v-if="hasSessions">
                    Choisis le ou les créneaux qui te conviennent le mieux.
                    <br/>
                    Le moniteur de la Brigade du kiff te recontacte pour organiser le stage.
                  </p>

                  <!-- Messages -->
                  <p
                    v-if="bookingError"
                    class="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
                  >
                    {{ bookingError }}
                  </p>
                  <p
                    v-if="bookingSuccess"
                    class="mt-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700"
                  >
                    {{ bookingSuccess }}
                  </p>

                  <div class="mt-5 space-y-4">
                    <template v-if="hasSessions">
                    <div class="space-y-3">
                      <p class="text-xs font-medium text-gray-700">
                        Dates disponibles
                      </p>
                      <div class="space-y-3">
                        <label
                            v-for="session in availableSessions"
                            :key="session.id"
                            class="flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm"
                          >
                            <input
                              type="checkbox"
                              class="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              :value="String(session.id)"
                              v-model="selectedSessionIds"
                              :disabled="bookingLoading"
                            />
                            <div class="space-y-1">
                              <p class="font-semibold text-gray-900">
                                {{ formatSessionDate(session) }}
                              </p>
                              <p class="text-xs text-brand-600">
                                {{ session.placesReservees || 0 }} personnes intéressées
                              </p>
                              <p
                                v-if="session.userIsBooked"
                                class="text-xs font-semibold text-emerald-600"
                              >
                                Tu t’es déjà positionné·e sur cette date
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        @click="handleInterestClick"
                        :disabled="!selectedSessionIds.length || bookingLoading || allSelectedAlreadyInterested"
                        :class="[
                          'mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-md transition',
                          (!selectedSessionIds.length || bookingLoading || allSelectedAlreadyInterested)
                            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                            : 'bg-brand-600 text-white hover:bg-brand-500',
                        ]"
                      >
                        <span v-if="bookingLoading">
                          Envoi en cours...
                        </span>
                        <span v-else-if="allSelectedAlreadyInterested">
                          Déjà positionné·e dessus
                        </span>
                        <span v-else>
                          Je m’inscris !
                        </span>
                        <svg
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M8 5l8 7-8 7"
                          />
                        </svg>
                      </button>
                    </template>
                    <template v-else>
                      <p class="text-sm text-gray-500">
                        Il n’y a pas encore de date proposée pour ce stage. Indique nous le créneau sur lequel tu es disponible !
                      </p>
                    </template>
                  </div>
                  <details
                    v-if="hasSessions"
                    class="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
                    :open="suggestionDetailsOpen"
                    @toggle="onSuggestionToggle"
                  >
                    <summary class="flex cursor-pointer items-center justify-between gap-3 text-left">
                      <div>
                        <p class="font-semibold text-gray-900">
                          Aucune de ces dates ne colle ?
                        </p>
                        <p class="text-xs text-gray-500">
                          Propose un créneau : on regroupe les grimpeurs dispos et on te recontacte.
                        </p>
                      </div>
                      <svg
                        class="h-5 w-5 text-gray-500 transition"
                        :class="suggestionDetailsOpen ? 'rotate-180' : ''"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>

                    <div v-show="suggestionDetailsOpen" class="mt-4 space-y-3">
                      <div>
                        <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                          Intervalle de dates
                        </label>
                        <ClientOnly>
                          <VueDatePicker
                            v-model="datePickerModel"
                            range
                            :enable-time-picker="false"
                            :min-date="new Date()"
                            :locale="datePickerLocale"
                            :formats="datePickerFormats"
                            placeholder="JJ/MM/AAAA → JJ/MM/AAAA"
                            :teleport="true"
                            :disabled="suggestionLoading"
                            class="mt-2"
                            input-class-name="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                          />
                        </ClientOnly>
                        <p class="text-[11px] text-gray-400">
                          Choisis une date de début et, si besoin, une date de fin.
                        </p>
                      </div>
                      <div>
                        <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                          Message pour le moniteur
                        </label>
                        <textarea
                          rows="3"
                          class="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                          placeholder="Ex: dispo le week-end, on est déjà 3 personnes motivées..."
                          v-model="customComment"
                          :disabled="suggestionLoading"
                        />
                      </div>
                      <p v-if="suggestionError" class="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                        {{ suggestionError }}
                      </p>
                      <p v-if="suggestionSuccess" class="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
                        {{ suggestionSuccess }}
                      </p>
                      <button
                        type="button"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondaryBrand-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        :disabled="suggestionLoading || !suggestionRange.start"
                        @click="handleSuggestionClick"
                      >
                        <span v-if="suggestionLoading">Envoi en cours...</span>
                        <span v-else>Je propose ce créneau</span>
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
                        </svg>
                      </button>
                    </div>
                  </details>
                  <div
                    v-else
                    class="mt-8 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
                  >
                    <div>
                      <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                        Intervalle de dates
                      </label>
                      <ClientOnly>
                        <VueDatePicker
                          v-model="datePickerModel"
                          range
                          :enable-time-picker="false"
                          :min-date="new Date()"
                          :locale="datePickerLocale"
                          :formats="datePickerFormats"
                          placeholder="JJ/MM/AAAA → JJ/MM/AAAA"
                          :teleport="true"
                          :disabled="suggestionLoading"
                          class="mt-2"
                          input-class-name="w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        />
                      </ClientOnly>
                      <p class="text-[11px] text-gray-400">
                        Choisis une date de début et, si besoin, une date de fin.
                      </p>
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                        Message pour le moniteur
                      </label>
                      <textarea
                        rows="3"
                        class="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        placeholder="Ex: dispo le week-end, on est déjà 3 personnes motivées..."
                        v-model="customComment"
                        :disabled="suggestionLoading"
                      />
                    </div>
                    <p v-if="suggestionError" class="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                      {{ suggestionError }}
                    </p>
                    <p v-if="suggestionSuccess" class="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
                      {{ suggestionSuccess }}
                    </p>
                    <button
                      type="button"
                      class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondaryBrand-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-secondaryBrand-900/30 transition hover:bg-secondaryBrand-400 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                      :disabled="suggestionLoading || !suggestionRange.start"
                      @click="handleSuggestionClick"
                    >
                      <span v-if="suggestionLoading">Envoi en cours...</span>
                      <span v-else>Je propose ce créneau</span>
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </aside>
            </div>

          </div>

          
        </div>
      </main>

      <!-- AUTRES AVENTURES -->
      <section v-if="filteredOtherStages.length" class="bg-brand-900 py-16">
        <div class="mx-auto max-w-7xl px-6 lg:px-8 space-y-8">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold text-white">
              Autres aventures qui peuvent te plaire
            </h2>
            <NuxtLink
              to="/aventures-escalade"
              class="text-sm font-semibold text-secondaryBrand-300 hover:text-secondaryBrand-200"
            >
              Voir toutes les aventures →
            </NuxtLink>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <NuxtLink
              v-for="s in filteredOtherStages"
              :key="s.id"
              :to="`/aventures-escalade/${s.slug}`"
              class="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition hover:-translate-y-1"
            >
              <div>{{ s.value?.sessions }}</div>
              <div class="relative h-52">
                <img
                  :src="s.coverImageUrl || imageForDiscipline(s.discipline)"
                  :alt="s.titre"
                  class="size-full object-cover transition duration-500 hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                <div class="absolute inset-4 flex flex-col justify-between">
                  <div class="flex flex-wrap items-center gap-3 text-xs text-white sm:flex-row sm:justify-between">
                    <div class="flex flex-wrap items-center gap-2 flex-1">
                      <span
                        class="inline-flex max-w-[70%] items-center rounded-full bg-secondaryBrand-400/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondaryBrand-100 ring-1 ring-white/20"
                      >
                        {{ formatDisciplineLabel(s.discipline) }}
                      </span>
                      <span
                        class="inline-flex items-center rounded-full border border-brand-200/40 bg-brand-950/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                      >
                        {{ s.jours }} {{ s.jours > 1 ? 'jours' : 'jour' }}
                      </span>
                    </div>
                    <div class="ml-auto">
                      <span
                        class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondaryBrand-400/80 shadow-lg shadow-secondaryBrand-900/30 sm:h-14 sm:w-14"
                      >
                        <img
                          :src="iconPathForDiscipline(s.discipline)"
                          :alt="formatDisciplineLabel(s.discipline)"
                          class="h-8 w-8 object-contain sm:h-10 sm:w-10"
                        />
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1 text-sm text-white">
                    <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                      <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {{ displayNextSession(s) ? formatSessionRange(displayNextSession(s)) : 'Date à confirmer' }}
                    </span>
                    <span class="inline-flex items-center gap-2 font-semibold text-xs text-white">
                      <svg class="h-4 w-4 text-secondaryBrand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21c-4-4-6-7-6-10a6 6 0 0 1 12 0c0 3-2 6-6 10Z" />
                        <circle cx="12" cy="11" r="2.3" />
                      </svg>
                      {{ s.lieuLabel }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex flex-1 flex-col p-5">
                <h3 class="mt-2 text-xl font-semibold text-white">
                  {{ s.titre }}
                </h3>
                <p class="mt-1 line-clamp-2 text-sm text-brand-100/80">
                  {{ s.sousTitre }}
                </p>
                <div class="mt-6 flex items-center justify-between text-sm text-white">
                  <div class="flex items-center gap-3 text-sm text-brand-100/80">
                    <img
                      :src="s.guideImageUrl || imageForDiscipline(s.discipline)"
                      :alt="s.guideName || 'Moniteur'"
                      class="h-10 w-10 rounded-full border border-white/20 bg-brand-900 object-cover"
                    />
                    <div>
                      <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">
                        Moniteur
                      </p>
                      <p class="font-semibold text-white">
                        {{ s.guideName || 'Moniteur local' }}
                      </p>
                    </div>
                  </div>
                  <span class="font-semibold text-right">
                    {{ s.prixParPersonne }} € <span class="text-brand-200 text-xs">/ pers</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </section>

    <AppFooter />

    <Teleport to="body">
      <div
        v-if="showLightbox"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        @click.self="closeLightbox"
      >
        <button
          type="button"
          class="absolute right-4 top-4 rounded-full border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20"
          @click="closeLightbox"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
        <div class="relative w-full max-w-4xl">
          <img
            v-if="currentGalleryImage"
            :src="currentGalleryImage.url"
            :alt="currentGalleryImage.alt || stageTitle"
            class="max-h-[80vh] w-full rounded-2xl object-contain"
          />
          <div class="mt-3 flex items-center justify-between text-xs text-white/80">
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-full border border-white/30 bg-white/10 px-3 py-1 transition hover:bg-white/20"
                @click="goToPrevImage"
                :aria-disabled="galerieImages.length < 2"
                :disabled="galerieImages.length < 2"
              >
                Précédent
              </button>
              <button
                type="button"
                class="rounded-full border border-white/30 bg-white/10 px-3 py-1 transition hover:bg-white/20"
                @click="goToNextImage"
                :aria-disabled="galerieImages.length < 2"
                :disabled="galerieImages.length < 2"
              >
                Suivant
              </button>
            </div>
            <div class="flex gap-1.5">
              <span
                v-for="(img, idx) in galerieImages"
                :key="img.id || idx"
                class="h-1.5 w-1.5 rounded-full transition"
                :class="idx === galleryIndex ? 'bg-secondaryBrand-300' : 'bg-white/40'"
              />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { fr as dateFnsFr } from 'date-fns/locale'
import '@vuepic/vue-datepicker/dist/main.css'
const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(`/api/aventures/${slug}`)

const stage = computed(() => data.value?.aventure)
const stageTitle = computed(() => stage.value?.titre || 'Aventure')
const otherStages = computed(() => data.value?.autres ?? [])
const filteredOtherStages = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const list = (otherStages.value || []).map((a: any) => {
    const { next, hasAnySession } = findNextSession(a, todayMs)
    const nextDate = next?.dateDebut ? new Date(next.dateDebut).getTime() : null
    return { ...a, nextDate, hasSessions: hasAnySession, derivedNextSession: next }
  })
  return list
    .filter((a: any) => {
      if (a.nextDate) return a.nextDate >= todayMs
      if (a.hasSessions) return false
      return true
    })
    .sort((a: any, b: any) => {
      if (a.nextDate && b.nextDate) return a.nextDate - b.nextDate
      if (a.nextDate && !b.nextDate) return -1
      if (!a.nextDate && b.nextDate) return 1
      return 0
    })
})

const findNextSession = (aventure: any, todayMs: number) => {
  const sessions: any[] = []
  console.log(aventure.sessions)
  if (Array.isArray(aventure?.sessions)) {
    sessions.push(...aventure.sessions)
  }
  if (aventure?.nextSession) {
    sessions.push(aventure.nextSession)
  }

  const hasAnySession = sessions.length > 0
  const future = sessions
    .filter((s) => s?.dateDebut && !Number.isNaN(new Date(s.dateDebut).getTime()))
    .map((s) => ({ ...s, _ts: new Date(s.dateDebut).getTime() }))
    .filter((s) => s._ts >= todayMs)
    .sort((a, b) => a._ts - b._ts)

  if (future.length) {
    const best = { ...future[0] }
    delete best._ts
    return { next: best, hasAnySession }
  }
  return { next: null, hasAnySession }
}

const displayNextSession = (aventure: any) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return findNextSession(aventure, today.getTime()).next
}

// Onglets
const tabs = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'programme', label: 'Programme' },
  { id: 'infos', label: 'Infos pratiques' },
] as const

const activeTab = ref<(typeof tabs)[number]['id']>('overview')

// Helpers JSON → string[]
const toStringArray = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string')
  }
  return [String(value)]
}

const prerequisList = computed(() =>
  toStringArray(stage.value?.prerequis ?? []),
)
const hasPrerequisSection = computed(
  () => prerequisList.value.length > 0 || Boolean(ageRange.value),
)
const equipementRequisList = computed(() =>
  toStringArray(stage.value?.equipementRequis ?? []),
)
const equipementFourniList = computed(() =>
  toStringArray(stage.value?.equipementFourni ?? []),
)
const languesList = computed(() =>
  toStringArray(stage.value?.langues ?? []),
)

const ageRange = computed(() => {
  const s = stage.value
  if (!s) return ''
  if (s.ageMin && s.ageMax) return `${s.ageMin}–${s.ageMax} ans`
  if (s.ageMin) return `À partir de ${s.ageMin} ans`
  if (s.ageMax) return `Jusqu’à ${s.ageMax} ans`
  return ''
})

const objectifsText = computed(() => (stage.value?.objectifs || '').trim())
const hasObjectifsSection = computed(() => objectifsText.value.length > 0)

const programmeJours = computed(() => {
  const jours = stage.value?.programmeJours || []
  return [...jours].sort(
    (a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0),
  )
})

const galerieImages = computed(() => stage.value?.images || [])
const galleryIndex = ref(0)
const showLightbox = ref(false)
watch(
  galerieImages,
  (images) => {
    if (!images?.length) {
      galleryIndex.value = 0
      return
    }
    galleryIndex.value = Math.min(galleryIndex.value, images.length - 1)
  },
  { immediate: true },
)
const currentGalleryImage = computed(() => {
  const images = galerieImages.value
  if (!images.length) return null
  const index = Math.min(Math.max(galleryIndex.value, 0), images.length - 1)
  return images[index]
})
const goToPrevImage = () => {
  const images = galerieImages.value
  if (!images.length) return
  galleryIndex.value =
    (galleryIndex.value - 1 + images.length) % images.length
}
const goToNextImage = () => {
  const images = galerieImages.value
  if (!images.length) return
  galleryIndex.value = (galleryIndex.value + 1) % images.length
}
const selectGalleryImage = (index: number) => {
  if (index < 0 || index >= galerieImages.value.length) return
  galleryIndex.value = index
}
const openLightbox = (index: number) => {
  selectGalleryImage(index)
  showLightbox.value = true
}
const closeLightbox = () => {
  showLightbox.value = false
}

// Lightbox keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!showLightbox.value) return
  if (event.key === 'Escape') {
    closeLightbox()
  } else if (event.key === 'ArrowLeft') {
    goToPrevImage()
  } else if (event.key === 'ArrowRight') {
    goToNextImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Résumé court de "ce qui t'attend"
const resumeCeQuiTattend = computed(() => {
  const s = stage.value
  if (!s) return ''
  const source =
    s.descriptionCourte ||
    s.descriptionLongue ||
    s.pointsLocaux ||
    ''
  if (!source) return ''
  if (source.length <= 220) return source
  return source.slice(0, 220).trimEnd() + '…'
})

// Hero image
const disciplineImageMap: Record<string, string> = {
  GRANDE_VOIE: '/images/escalade-grande-voie-calanques.jpg',
  FALAISE: '/images/falaise-escalade-beaufortain.jpg',
  BLOC: '/images/bloc-Pays-Basque-Mondarrain.jpg',
  TRAD: '/images/falaise-Calanques2.jpg',
}

const imageForDiscipline = (value?: string | null) => {
  if (!value) return '/images/escalade-grande-voie-calanques.jpg'
  return disciplineImageMap[value] || '/images/escalade-grande-voie-calanques.jpg'
}

const heroImage = computed(() => {
  if (!stage.value) {
    return '/images/escalade-grande-voie-calanques.jpg'
  }
  if (stage.value.coverImageUrl) {
    return stage.value.coverImageUrl
  }
  if (Array.isArray(stage.value.images) && stage.value.images.length > 0) {
    return stage.value.images[0].url
  }
  return imageForDiscipline(stage.value.discipline)
})

const mapEmbedUrl = computed(() => {
  const label = stage.value?.lieuLabel || stage.value?.region || stage.value?.titre
  if (!label) return null
  return `https://www.google.com/maps?q=${encodeURIComponent(label)}&output=embed`
})

// ----- Guide / moniteur -----
const guide = computed(() => stage.value?.guide || null)

const guideFullName = computed(() => guide.value?.fullName || null)

const guideSlug = computed(() => guide.value?.slug || null)

const guideProfileLink = computed(() =>
  guideSlug.value ? `/moniteurs/${guideSlug.value}` : null,
)

const guideImage = computed(
  () => guide.value?.profile?.profileImageUrl || null,
)

const guideBaseLocation = computed(
  () =>
    guide.value?.profile?.baseLocation ||
    stage.value?.lieuLabel ||
    null,
)

const guideBioShort = computed(() => {
  const bio = guide.value?.profile?.bio || ''
  if (!bio) return ''
  return bio.length > 220 ? bio.slice(0, 220).trimEnd() + '…' : bio
})

const guideInstagramUrl = computed(
  () => guide.value?.profile?.instagramUrl || null,
)

const guideWebsiteUrl = computed(
  () => guide.value?.profile?.websiteUrl || null,
)

// Format helpers
const disciplineLabels: Record<string, string> = {
  GRANDE_VOIE: 'Grande voie',
  FALAISE: 'Falaise',
  BLOC: 'Bloc',
  TRAD: 'Trad',
}

const disciplineIconMap: Record<string, string> = {
  GRANDE_VOIE: '/images/grande-voie.png',
  FALAISE: '/images/couenne.png',
  BLOC: '/images/bloc.png',
  TRAD: '/images/trad.png',
}

const iconPathForDiscipline = (value?: string | null) => {
  if (!value) return disciplineIconMap.GRANDE_VOIE
  return disciplineIconMap[value] ?? disciplineIconMap.GRANDE_VOIE
}

const formatDisciplineLabel = (value?: string | null) => {
  if (!value) return 'Aventure'
  return disciplineLabels[value] ?? value
}

const formatSessionDate = (session: any) => {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const start = formatter.format(new Date(session.dateDebut))
  const end = formatter.format(new Date(session.dateFin))
  return start === end ? start : `${start} → ${end}`
}

const formatSessionRange = (session?: { dateDebut?: string | Date; dateFin?: string | Date } | null) => {
  if (!session?.dateDebut) return ''
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const start = formatter.format(new Date(session.dateDebut))
  if (!session.dateFin) return start
  const end = formatter.format(new Date(session.dateFin))
  return start === end ? start : `${start} → ${end}`
}

const { loggedIn } = useUserSession()
const router = useRouter()

const bookingLoading = ref(false)
const bookingError = ref<string | null>(null)
const bookingSuccess = ref<string | null>(null)
const customComment = ref('')
const customDateRange = ref<[Date | null, Date | null]>([null, null])
const datePickerModel = computed<[Date | null, Date | null] | null>({
  get() {
    const [start, end] = customDateRange.value
    return start || end ? customDateRange.value : null
  },
  set(value) {
    if (Array.isArray(value)) {
      customDateRange.value = [value[0] ?? null, value[1] ?? null]
      return
    }
    customDateRange.value = [value ?? null, null]
  },
})
const datePickerLocale = dateFnsFr
const datePickerFormats = {
  input: 'dd/MM/yyyy',
  preview: 'dd/MM/yyyy',
}
const suggestionDetailsOpen = ref(false)
const suggestionLoading = ref(false)
const suggestionError = ref<string | null>(null)
const suggestionSuccess = ref<string | null>(null)

const hasSessions = computed(
  () => !!(stage.value?.sessions && stage.value.sessions.length),
)

const availableSessions = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (stage.value?.sessions || []).filter((s: any) => {
    if (!s?.dateDebut) return false
    const ts = new Date(s.dateDebut).getTime()
    return !Number.isNaN(ts) && ts >= today.getTime()
  })
})

const selectedSessionIds = ref<string[]>([])

const selectedSessions = computed(() => {
  const ids = selectedSessionIds.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessions = (stage.value?.sessions || []).filter((s: any) => {
    if (!s?.dateDebut) return false
    const ts = new Date(s.dateDebut).getTime()
    return !Number.isNaN(ts) && ts >= today.getTime()
  })
  return sessions.filter((s: any) => ids.includes(String(s.id)))
})

const overviewHighlights = computed(() => {
  const data = stage.value
  if (!data) return []
  const highlights: { label: string; value: string }[] = []
  if (data.discipline) {
    highlights.push({
      label: 'Discipline',
      value: formatDisciplineLabel(data.discipline),
    })
  }
  if (data.jours) {
    highlights.push({
      label: 'Durée',
      value: `${data.jours} jour${data.jours > 1 ? 's' : ''}`,
    })
  }
  if (data.niveauMinimum) {
    highlights.push({
      label: 'Niveau',
      value: data.niveauMinimum,
    })
  }
  if (data.placesMax) {
    highlights.push({
      label: 'Places',
      value: `${data.placesMax} max`,
    })
  }
  if (data.prixParPersonne) {
    highlights.push({
      label: 'Tarif / pers',
      value: `${data.prixParPersonne} €`,
    })
  }
  return highlights
})

const allSelectedAlreadyInterested = computed(() => {
  if (!selectedSessionIds.value.length) return false
  if (!selectedSessions.value.length) return false
  return selectedSessions.value.every((s: any) => s?.userIsBooked)
})

const suggestionRange = computed(() => {
  const [startDate, endDate] = customDateRange.value || [null, null]
  const start = startDate ? formatInputDate(startDate) : ''
  const end = endDate ? formatInputDate(endDate) : ''
  return { start, end }
})

const formatInputDate = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// pré-sélection de la première session
watch(
  () => stage.value?.sessions,
  (sessions) => {
    selectedSessionIds.value = []
  },
  { immediate: true },
)

const onSuggestionToggle = (event: Event) => {
  const target = event.target as HTMLDetailsElement | undefined
  suggestionDetailsOpen.value = target?.open ?? false
}

const handleInterestClick = async () => {
  bookingError.value = null
  bookingSuccess.value = null

  if (!selectedSessionIds.value.length) return

  // 1) S'il n'est pas connecté → login
  if (!loggedIn.value) {
    const redirect = encodeURIComponent(route.fullPath)
    await router.push(`/login?redirect=${redirect}`)
    return
  }

  bookingLoading.value = true
  try {
    const sessions = stage.value?.sessions || []
    const targets = selectedSessionIds.value
      .map((id) => sessions.find((s: any) => String(s.id) === id))
      .filter((s: any) => s && !s.userIsBooked)

    if (!targets.length) {
      bookingSuccess.value =
        'Tu es déjà positionné·e sur ces dates. Merci !'
      return
    }

    for (const session of targets) {
      await $fetch<{
        booking: any
        already: boolean
        message: string
      }>('/api/bookings', {
        method: 'POST',
        body: {
          sessionId: Number(session.id),
        },
      })

      session.userIsBooked = true
      session.placesReservees = (session.placesReservees || 0) + 1
    }

    bookingSuccess.value =
      'Merci ! Ton intérêt a bien été pris en compte 💛'
  } catch (err: any) {
    const message =
      err?.data?.statusMessage ||
      err?.data?.message ||
      "Impossible de créer la réservation."
    bookingError.value = message
  } finally {
    bookingLoading.value = false
  }
}

const handleSuggestionClick = async () => {
  suggestionError.value = null
  suggestionSuccess.value = null

  const { start, end } = suggestionRange.value
  if (!start) {
    suggestionError.value = 'Merci de sélectionner au moins une date valide.'
    return
  }

  if (!loggedIn.value) {
    const redirect = encodeURIComponent(route.fullPath)
    await router.push(`/login?redirect=${redirect}`)
    return
  }

  suggestionLoading.value = true
  try {
    const body: { startDate: string; endDate?: string; comment?: string } = {
      startDate: start,
    }
    if (end) body.endDate = end
    if (customComment.value) body.comment = customComment.value

    const res = await $fetch<{
      suggestion: any
      message: string
    }>(`/api/aventures/${slug}/suggestions`, {
      method: 'POST',
      body,
    })

    suggestionSuccess.value =
      res.message || 'Merci ! Nous avons noté tes disponibilités.'
    customDateRange.value = [null, null]
    customComment.value = ''
  } catch (err: any) {
    suggestionError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      'Impossible de soumettre ta proposition.'
  } finally {
    suggestionLoading.value = false
  }
}


// SEO
watchEffect(() => {
  if (stage.value) {
    useHead({
      title: `${stage.value.titre} - Brigade du kiff`,
      meta: [
        {
          name: 'description',
          content:
            resumeCeQuiTattend.value ||
            stage.value.sousTitre ||
            stage.value.pointsLocaux ||
            '',
        },
      ],
    })
  }
})
</script>

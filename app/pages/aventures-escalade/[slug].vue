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
            class="grid items-start gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)]"
          >
            <!-- Titre + tags -->
            <div class="max-w-3xl space-y-6">
              <div class="flex flex-wrap items-center gap-3 text-xs">
                <span
                  class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-white/80"
                >
                  {{ formatDisciplineLabel(stage.discipline) }}
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
                  <span>
                    {{ stage.lieuLabel }}
                    <span v-if="stage.region" class="ml-1">· {{ stage.region }}</span>
                  </span>
                </span>
              </div>

              <div class="space-y-3">
                <h1
                  class="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
                >
                  {{ stage.titre }}
                </h1>
                <p
                  v-if="stage.sousTitre"
                  class="text-balance text-sm text-brand-100/85 sm:text-base"
                >
                  {{ stage.sousTitre }}
                </p>
                <p
                  v-else-if="resumeCeQuiTattend"
                  class="text-sm text-brand-100/85 sm:text-base"
                >
                  {{ resumeCeQuiTattend }}
                </p>
              </div>
            </div>

            <!-- Bloc Guide à droite -->
            <div
              v-if="guideFullName"
              class="space-y-3 rounded-3xl bg-brand-950/85 p-5 ring-1 ring-secondaryBrand-400/40 shadow-xl shadow-black/40"
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

              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <a
                  v-if="guideInstagramUrl"
                  :href="guideInstagramUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-brand-100 ring-1 ring-white/10 hover:bg-white/10"
                >
                  Instagram
                </a>
                <a
                  v-if="guideWebsiteUrl"
                  :href="guideWebsiteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-brand-100 ring-1 ring-white/10 hover:bg-white/10"
                >
                  En savoir plus sur le guide
                </a>
              </div>
            </div>
          </div>

          <!-- Stats compactes -->
          <div class="mt-10">
            <div
              class="grid gap-4 rounded-3xl bg-brand-950/85 p-4 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur sm:grid-cols-2 lg:grid-cols-4"
            >
              <div class="rounded-2xl bg-brand-900/80 p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-200">
                  Durée
                </p>
                <p class="mt-2 text-2xl font-semibold text-white">
                  {{ stage.jours }} {{ stage.jours > 1 ? 'jours' : 'jour' }}
                </p>
              </div>

              <div class="rounded-2xl bg-brand-900/80 p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-200">
                  Niveau
                </p>
                <p class="mt-2 text-2xl font-semibold text-white">
                  {{ stage.niveauMinimum || 'Tous niveaux' }}
                </p>
                <p v-if="stage.autonomieMini" class="mt-1 text-[11px] text-brand-100/80">
                  Autonomie mini : {{ stage.autonomieMini }}
                </p>
              </div>

              <div class="rounded-2xl bg-brand-900/80 p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-200">
                  Places max
                </p>
                <p class="mt-2 text-2xl font-semibold text-white">
                  {{ stage.placesMax }}
                </p>
              </div>

              <div class="rounded-2xl bg-brand-900/80 p-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-200">
                  Tarif / pers
                </p>
                <p class="mt-2 text-2xl font-semibold text-white">
                  {{ stage.prixParPersonne }} €
                </p>
              </div>
            </div>
          </div>

          
        </div>
      </div>

      <!-- MAIN + TABS -->
      <main class="bg-brand-950 pb-24 pt-10">
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
            <div class="space-y-8">
              <!-- TAB : OVERVIEW -->
              <section
                v-if="activeTab === 'overview'"
                class="space-y-8"
              >
                <!-- En bref -->
                <div class="space-y-3 rounded-2xl bg-brand-900/70 p-5 ring-1 ring-white/10">
                  <h2 class="text-xs font-semibold uppercase tracking-wide text-white">En bref</h2>
                  <p class="text-sm text-brand-100/90">
                    {{ resumeCeQuiTattend || "Une aventure locale pour progresser en grimpe sans perdre le kif." }}
                  </p>
                  <ul class="mt-2 space-y-1 text-xs text-brand-100/90">
                    <li class="flex gap-2">
                      <span class="mt-1 h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                      <span>{{ formatDisciplineLabel(stage.discipline) }} · {{ stage.jours }} jour{{ stage.jours > 1 ? 's' : '' }}</span>
                    </li>
                    <li v-if="stage.niveauMinimum" class="flex gap-2">
                      <span class="mt-1 h-1.5 w-1.5 rounded-full bg-secondaryBrand-400" />
                      <span>Niveau conseillé : {{ stage.niveauMinimum }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Pour qui ? -->
                <div
                  class="space-y-3 rounded-2xl bg-brand-900/40 p-5 ring-1 ring-white/10"
                >
                  <h3 class="text-xs font-semibold uppercase tracking-wide text-white">Pour qui ?</h3>
                  <p
                    v-if="stage.descriptionCourte"
                    class="text-sm text-brand-100/90"
                  >
                    {{ stage.descriptionCourte }}
                  </p>
                  <p
                    v-else
                    class="text-sm text-brand-100/80"
                  >
                    Grimpeur·euse motivé·e, avec envie de se faire plaisir sur le rocher
                    en sécurité, dans une ambiance conviviale.
                  </p>

                  <ul
                    v-if="prerequisList.length"
                    class="mt-2 space-y-1 text-xs text-brand-100/90"
                  >
                    <li
                      v-for="item in prerequisList"
                      :key="item"
                      class="flex gap-2"
                    >
                      <span class="mt-1 h-1.5 w-1.5 rounded-full bg-brand-400" />
                      <span>{{ item }}</span>
                    </li>
                  </ul>

                  <p v-if="ageRange" class="mt-2 text-[11px] text-brand-200">
                    Âge conseillé : {{ ageRange }}
                  </p>
                </div>

                <!-- Ce qui t’attend (détail en accordéon) -->
                <div class="space-y-3">
                  <details
                    v-if="stage.descriptionLongue"
                    class="mt-2 rounded-2xl bg-brand-900/40 p-3 text-sm text-brand-100/90 ring-1 ring-white/5"
                  >
                    <summary class="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-brand-200">
                      Voir le descriptif détaillé
                    </summary>
                    <p class="mt-2 whitespace-pre-line">
                      {{ stage.descriptionLongue }}
                    </p>
                  </details>
                </div>
              </section>

              <!-- TAB : PROGRAMME -->
              <section
                v-else-if="activeTab === 'programme'"
                class="space-y-4"
              >
                <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                  Programme jour par jour
                </h3>
                <p class="text-xs text-brand-200">
                  Trame indicative : le guide adapte selon le groupe et les conditions.
                </p>

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
                      <h3 class="text-xs font-semibold text-white">
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
                        class="text-xs text-brand-100/90 whitespace-pre-line"
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
                  Le programme détaillé sera partagé par le guide avant le départ.
                </p>
              </section>

              <!-- TAB : INFOS PRATIQUES -->
              <section
                v-else-if="activeTab === 'infos'"
                class="space-y-6"
              >
                <!-- Objectifs + Inclus / Non inclus -->
                <div class="grid gap-4 lg:grid-cols-3">
                  <div
                    class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10"
                  >
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                      Objectifs
                    </h3>
                    <p
                      v-if="stage.objectifs"
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.objectifs }}
                    </p>
                    <p
                      v-else
                      class="text-xs text-brand-100/80"
                    >
                      Construire ton autonomie et ton plaisir en falaise / grande voie,
                      sans pression.
                    </p>
                  </div>

                  <div
                    class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10"
                  >
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                      Inclus
                    </h3>
                    <p
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.inclus || 'Encadrement par un moniteur·rice diplômé·e, choix de secteurs adaptés, brief sécurité.' }}
                    </p>
                  </div>

                  <div
                    class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10"
                  >
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                      Non inclus
                    </h3>
                    <p
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.nonInclus || 'Transport, hébergement et repas selon les besoins du groupe.' }}
                    </p>
                  </div>
                </div>

                <!-- Hébergement / Matériel / Transport -->
                <div class="grid gap-4 lg:grid-cols-3">
                  <!-- Hébergement -->
                  <div class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                      Hébergement & repas
                    </h3>
                    <p
                      v-if="stage.hebergementLabel || stage.hebergementDetails"
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      <span
                        v-if="stage.hebergementLabel"
                        class="font-medium"
                      >
                        {{ stage.hebergementLabel }}<br />
                      </span>
                      <span v-if="stage.hebergementDetails">
                        {{ stage.hebergementDetails }}
                      </span>
                    </p>
                    <p
                      v-else
                      class="text-xs text-brand-100/80"
                    >
                      Hébergement et repas précisés par le guide en amont.
                    </p>
                    <p
                      v-if="stage.repasLabel"
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.repasLabel }}
                    </p>
                  </div>

                  <!-- Matériel -->
                  <div class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                      Matériel
                    </h3>
                    <div v-if="equipementRequisList.length">
                      <p class="text-[11px] font-semibold text-brand-200">
                        À apporter
                      </p>
                      <ul class="mt-1 space-y-1 text-xs text-brand-100/90">
                        <li
                          v-for="item in equipementRequisList"
                          :key="'req-' + item"
                          class="flex gap-2"
                        >
                          <span
                            class="mt-1 h-1.5 w-1.5 rounded-full bg-secondaryBrand-400"
                          />
                          <span>{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                    <div v-if="equipementFourniList.length" class="mt-3">
                      <p class="text-[11px] font-semibold text-brand-200">
                        Fournis par le guide
                      </p>
                      <ul class="mt-1 space-y-1 text-xs text-brand-100/90">
                        <li
                          v-for="item in equipementFourniList"
                          :key="'fourni-' + item"
                          class="flex gap-2"
                        >
                          <span
                            class="mt-1 h-1.5 w-1.5 rounded-full bg-brand-400"
                          />
                          <span>{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                    <p
                      v-if="!equipementRequisList.length && !equipementFourniList.length"
                      class="text-xs text-brand-100/80"
                    >
                      La liste précise du matériel est envoyée après inscription.
                    </p>
                  </div>

                  <!-- Transport -->
                  <div class="space-y-2 rounded-2xl bg-brand-900/40 p-4 ring-1 ring-white/10">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                      Transport & RDV
                    </h3>
                    <p
                      v-if="stage.transportLabel"
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.transportLabel }}
                    </p>
                    <p
                      v-if="stage.pointRdv"
                      class="text-xs text-brand-100/90"
                    >
                      <span class="font-semibold">Point de rendez-vous :</span>
                      {{ stage.pointRdv }}
                    </p>
                    <p
                      v-if="stage.pointsLocaux"
                      class="text-xs text-brand-100/90 whitespace-pre-line"
                    >
                      {{ stage.pointsLocaux }}
                    </p>
                  </div>
                </div>
              </section>

              <!-- TAB : PHOTOS -->
              <section
                v-else-if="activeTab === 'photos'"
                class="space-y-4"
              >
                <h3 class="text-xs font-semibold uppercase tracking-wide text-white">
                  Photos de l’aventure
                </h3>
                <p class="text-xs text-brand-200">
                  Pour te donner un avant-goût des ambiances, sans tout spoiler.
                </p>

                <div
                  v-if="galerieImages.length"
                  class="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4"
                >
                  <div
                    v-for="img in galerieImages"
                    :key="img.id"
                    class="group relative h-32 overflow-hidden rounded-2xl bg-brand-900/60 md:h-36 lg:h-40"
                  >
                    <img
                      :src="img.url"
                      :alt="img.alt || stage.titre"
                      class="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div
                      class="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent"
                    />
                  </div>
                </div>

                <p
                  v-else
                  class="mt-3 text-sm text-brand-100/80"
                >
                  Les premières images arrivent bientôt 🌄
                </p>
              </section>
            </div>

            <!-- COLONNE DROITE : encart Réservation sticky -->
            <aside class="lg:sticky lg:top-32 lg:h-fit">
              <div
                class="rounded-3xl bg-white p-6 text-gray-900 shadow-2xl shadow-black/30 ring-1 ring-gray-900/10"
              >
                <p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                  Réservation
                </p>
                <h3 class="mt-2 text-lg font-semibold text-gray-900">
                  Choisis ta ou tes dates
                </h3>
                <p class="mt-1 text-xs text-gray-500" v-if="hasSessions">
                  Indique-nous les dates qui t’intéressent. Le moniteur te recontactera pour regrouper les motivé·es.
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
                        v-for="session in stage.sessions"
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
                      Je suis intéressé·e par ces dates
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
                  <!--<template v-else>
                    <p class="text-sm text-gray-500">
                      Pas encore de dates planifiées. Écris à la Brigade du kif pour
                      co-construire une date qui colle à ton groupe.
                    </p>
                  </template>-->
                </div>
                <div class="mt-8 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700" v-if="hasSessions">
                  <p class="font-semibold text-gray-900">
                    Aucune de ces dates ne colle ?
                  </p>
                  <p class="text-xs text-gray-500">
                    Propose un créneau : on regroupe les grimpeurs dispo et on te recontacte.
                  </p>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Premier jour</label>
                      <input
                        type="date"
                        class="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        v-model="customStartDate"
                        :disabled="suggestionLoading"
                      />
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Dernier jour (optionnel)</label>
                      <input
                        type="date"
                        class="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        v-model="customEndDate"
                        :disabled="suggestionLoading"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Message pour le moniteur</label>
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
                    :disabled="suggestionLoading || !customStartDate"
                    @click="handleSuggestionClick"
                  >
                    <span v-if="suggestionLoading">Envoi en cours...</span>
                    <span v-else>Je propose ce créneau</span>
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 5l8 7-8 7" />
                    </svg>
                  </button>
                </div>
                <div class="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700" v-else>
                  <p class="text-xs text-gray-500">
                    Propose un créneau : on regroupe les grimpeurs dispo et on te recontacte.
                  </p>
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Premier jour</label>
                      <input
                        type="date"
                        class="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        v-model="customStartDate"
                        :disabled="suggestionLoading"
                      />
                    </div>
                    <div>
                      <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Dernier jour (optionnel)</label>
                      <input
                        type="date"
                        class="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        v-model="customEndDate"
                        :disabled="suggestionLoading"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Message pour le moniteur</label>
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
                    :disabled="suggestionLoading || !customStartDate"
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
      </main>

      <!-- AUTRES AVENTURES -->
      <section
        v-if="otherStages.length"
        class="bg-brand-900 py-16"
      >
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
              v-for="autre in otherStages"
              :key="autre.id"
              :to="`/aventures-escalade/${autre.slug}`"
              class="group flex flex-col overflow-hidden rounded-2xl bg-white/5 shadow-lg shadow-black/40 ring-1 ring-white/10"
            >
              <div class="relative h-40 overflow-hidden">
                <img
                  :src="
                    autre.coverImageUrl ||
                    imageForDiscipline(autre.discipline)
                  "
                  :alt="autre.titre"
                  class="size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent"
                />
                <span
                  class="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-brand-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white"
                >
                  {{ formatDisciplineLabel(autre.discipline) }}
                </span>
              </div>
              <div class="flex flex-1 flex-col p-4">
                <h3 class="text-sm font-semibold text-white">
                  {{ autre.titre }}
                </h3>
                <p class="mt-1 line-clamp-2 text-xs text-brand-100/80">
                  {{ autre.sousTitre }}
                </p>
                <div class="pt-4 flex items-center justify-between text-xs mt-auto">
                  <span class="font-semibold text-secondaryBrand-300">
                    {{ autre.prixParPersonne }} € / pers
                  </span>
                  <span
                    class="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-100"
                  >
                    Voir l’aventure
                    <svg
                      class="h-3 w-3"
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
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch(`/api/aventures/${slug}`)

const stage = computed(() => data.value?.aventure)
const otherStages = computed(() => data.value?.autres ?? [])

// Onglets
const tabs = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'programme', label: 'Programme' },
  { id: 'infos', label: 'Infos pratiques' },
  { id: 'photos', label: 'Photos' },
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

const programmeJours = computed(() => {
  const jours = stage.value?.programmeJours || []
  return [...jours].sort(
    (a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0),
  )
})

const galerieImages = computed(() => stage.value?.images || [])

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

// ----- Guide / moniteur -----
const guide = computed(() => stage.value?.guide || null)

const guideFullName = computed(() => guide.value?.fullName || null)

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

const formatDisciplineLabel = (value?: string | null) => {
  if (!value) return 'Aventure'
  return disciplineLabels[value] ?? value
}

const formatSessionDate = (session: any) => {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  })
  const start = formatter.format(new Date(session.dateDebut))
  const end = formatter.format(new Date(session.dateFin))
  return start === end ? start : `${start} → ${end}`
}

const { loggedIn } = useUserSession()
const router = useRouter()

const bookingLoading = ref(false)
const bookingError = ref<string | null>(null)
const bookingSuccess = ref<string | null>(null)
const customStartDate = ref('')
const customEndDate = ref('')
const customComment = ref('')
const suggestionLoading = ref(false)
const suggestionError = ref<string | null>(null)
const suggestionSuccess = ref<string | null>(null)

const hasSessions = computed(
  () => !!(stage.value?.sessions && stage.value.sessions.length),
)

const selectedSessionIds = ref<string[]>([])

const selectedSessions = computed(() => {
  const ids = selectedSessionIds.value
  const sessions = stage.value?.sessions || []
  return sessions.filter((s: any) => ids.includes(String(s.id)))
})

const allSelectedAlreadyInterested = computed(() => {
  if (!selectedSessionIds.value.length) return false
  if (!selectedSessions.value.length) return false
  return selectedSessions.value.every((s: any) => s?.userIsBooked)
})

// pré-sélection de la première session
watch(
  () => stage.value?.sessions,
  (sessions) => {
    selectedSessionIds.value = []
  },
  { immediate: true },
)

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

  if (!customStartDate.value) {
    suggestionError.value = 'Merci de sélectionner au moins une date de départ.'
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
      startDate: customStartDate.value,
    }
    if (customEndDate.value) body.endDate = customEndDate.value
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
    customStartDate.value = ''
    customEndDate.value = ''
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
      title: `${stage.value.titre} - Brigade du kif`,
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

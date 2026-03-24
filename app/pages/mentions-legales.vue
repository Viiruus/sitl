<script setup lang="ts">
useSeoMeta({
  title: 'Mentions légales',
  description: 'Mentions légales du site brigadedukiff.com édité par l’association Brigade du Kiff.',
  robots: 'noindex, follow',
  googleBot: 'noindex, follow',
})
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-4xl px-6 pb-16 pt-40 lg:px-8">
      <div class="rounded-3xl border border-brand-800 bg-brand-900/70 p-8 shadow-2xl shadow-black/40">
        <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">Informations légales</p>
        <h1 class="mt-3 text-3xl font-semibold text-secondaryBrand-200">
          Mentions légales
        </h1>

        <div class="mt-8 space-y-8 text-sm leading-relaxed text-brand-100/85">
          <section class="space-y-3">
            <p>
              Le site brigadedukiff.com est édité par l’association BRIGADE DU KIFF (BDK), association régie par la loi du 1er juillet 1901.
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Siège social</h2>
            <p>
              190 rue d'Épernay<br>
              73630 Sainte-Reine<br>
              France
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Adresse e-mail</h2>
            <p>
              <a class="text-secondaryBrand-200 hover:text-secondaryBrand-100" href="mailto:yo@brigadedukiff.com">yo@brigadedukiff.com</a>
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Numéro RNA</h2>
            <p>W732012328</p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">SIRET</h2>
            <p>102 428 349 00017</p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Codirecteurs de la publication</h2>
            <p>Nicolas Guillemain et Fabien Moyon</p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Hébergeur</h2>
            <p>
              Vercel Inc.<br>
              440 N Barranca Avenue #4133<br>
              Covina, CA 91723<br>
              United States<br>
              Contact :
              <a class="text-secondaryBrand-200 hover:text-secondaryBrand-100" href="mailto:privacy@vercel.com">privacy@vercel.com</a>
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Propriété intellectuelle</h2>
            <p>
              L’ensemble des contenus présents sur le site brigadedukiff.com, incluant, de façon non limitative, les textes, images, graphismes, logo, icônes, vidéos, sons et éléments visuels, sont la propriété exclusive de BRIGADE DU KIFF (BDK) ou de leurs titulaires respectifs, sauf mention contraire.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, de tout ou partie du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Responsabilité</h2>
            <p>
              BRIGADE DU KIFF (BDK) s’efforce de fournir sur le site brigadedukiff.com des informations aussi précises que possible. Toutefois, l’association ne pourra être tenue responsable des omissions, inexactitudes ou carences dans la mise à jour, qu’elles soient de son fait ou du fait de tiers partenaires.
            </p>
            <p>
              Les informations diffusées sur le site sont données à titre indicatif et sont susceptibles d’évoluer.
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Liens externes</h2>
            <p>
              Le site peut contenir des liens vers des sites ou services tiers, notamment Instagram, Facebook et WhatsApp. BRIGADE DU KIFF (BDK) ne peut être tenue responsable du contenu, du fonctionnement ou des politiques de confidentialité de ces services tiers.
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Données personnelles</h2>
            <p>
              Le site peut être amené à traiter certaines données personnelles dans le cadre de l’authentification des utilisateurs via WhatsApp.
            </p>
            <p>
              Pour toute question relative à la protection des données personnelles, vous pouvez contacter l’association à l’adresse suivante :
              <a class="text-secondaryBrand-200 hover:text-secondaryBrand-100" href="mailto:yo@brigadedukiff.com">yo@brigadedukiff.com</a>.
            </p>
            <p>
              Une politique de confidentialité distincte pourra préciser les finalités des traitements, les données concernées, leur durée de conservation et les droits des personnes concernées.
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Cookies et traceurs</h2>
            <p>
              À ce jour, le site n’utilise pas d’outil de mesure d’audience de type analytics.
            </p>
            <p>
              Le site peut toutefois recourir à des traceurs strictement nécessaires à son fonctionnement ou à l’authentification, ainsi qu’à des services tiers liés à WhatsApp. Si des cookies ou traceurs non strictement nécessaires venaient à être utilisés ultérieurement, ils feraient l’objet d’une information spécifique et, lorsque la réglementation l’exige, du recueil préalable du consentement de l’utilisateur.
            </p>
          </section>

          <section class="space-y-3">
            <h2 class="text-lg font-semibold text-white">Droit applicable</h2>
            <p>Le présent site est soumis au droit français.</p>
          </section>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

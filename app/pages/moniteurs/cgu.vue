<script setup lang="ts">
useHead({
  title: "CGU Moniteurs - Brigade du kiff",
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-brand-950 text-white">
    <AppHeader />

    <main class="mx-auto max-w-4xl px-6 pt-40 pb-16 lg:px-8">
      <div class="rounded-3xl border border-brand-800 bg-brand-900/70 p-8 shadow-2xl shadow-black/40">
        <p class="text-xs uppercase tracking-[0.3em] text-brand-200/70">CGU Moniteurs</p>
        <h1 class="mt-3 text-3xl font-semibold text-secondaryBrand-200">
          Conditions générales d'utilisation des Moniteurs
        </h1>
        <p class="mt-2 text-sm text-brand-100/70">Version [27/01/2026]</p>

        <div class="mt-8 space-y-5 text-sm leading-relaxed text-brand-100/85">
          <p><strong>1. Objet</strong><br />Les présentes conditions encadrent la création de compte Moniteur et la publication de stages d’encadrement sur la Plateforme.</p>
          <p><strong>2. Indépendance – pas de lien de subordination</strong><br />Le Moniteur agit en professionnel indépendant. La Plateforme n’est ni employeur, ni mandataire, ni co-organisateur.</p>
          <p><strong>3. Déclarations obligatoires du Moniteur</strong><br />Le Moniteur déclare et garantit pendant toute la durée d’utilisation :</p>
          <ul class="list-disc space-y-1 pl-5">
            <li>être légalement qualifié pour encadrer l’escalade contre rémunération,</li>
            <li>exercer dans le respect de la réglementation applicable,</li>
            <li>disposer d’une RC professionnelle couvrant son activité,</li>
            <li>disposer d’un statut lui permettant de facturer (SIRET / structure),</li>
            <li>fournir des informations exactes et à jour sur son profil et ses stages.</li>
          </ul>
          <p><strong>4. Contenu des stages – interdictions</strong><br />4.1. Le Moniteur décrit fidèlement ses stages (programme, niveau, prérequis, lieux, taille de groupe, matériel, etc.).<br />4.2. Le Moniteur fournit ses conditions d’annulation / report et les modalités de paiement directement avec lui.<br />4.3. Interdiction : le Moniteur s’engage à ne pas publier d’offres présentées comme “séjours” ou “tout compris” intégrant hébergement/transport/restauration dans un prix global via la Plateforme, afin d’éviter toute confusion avec une vente de services de voyage.</p>
          <p><strong>5. Contrat direct avec le grimpeur</strong><br />Le Moniteur contracte directement avec le Grimpeur et assume seul : paiement, facturation, annulation, sécurité, conformité, gestion des litiges.</p>
          <p><strong>6. Responsabilité – garantie</strong><br />Le Moniteur est seul responsable de l’exécution du stage et garantit la Plateforme contre les réclamations résultant de ses manquements (dans la limite permise par la loi et sauf faute de la Plateforme).</p>
          <p><strong>7. Contenus et droits</strong><br />Le Moniteur garantit détenir les droits sur les contenus publiés. Il concède une licence d’affichage/diffusion à la Plateforme pour les besoins du service.</p>
          <p><strong>8. Modération / suspension</strong><br />La Plateforme peut déréférencer un stage ou suspendre un compte en cas de fausse déclaration, danger manifeste, contenu illicite, ou plaintes sérieuses répétées.</p>
          <p><strong>9. Données personnelles</strong><br />Le Moniteur n’utilise les données reçues que pour répondre aux demandes liées à ses stages et respecte la réglementation.</p>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

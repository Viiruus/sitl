/**
 * Seed data for your SQLite DB.
 *
 * This version assumes you have updated your schema to include:
 * - Aventure.coverImageUrl String?
 * - Aventure.images AventureImage[]
 * - model AventureImage { aventureId, url, alt?, position?, kind? }
 *
 * And (if you choose to add them) richer "travel-like" fields such as:
 * - descriptionCourte, descriptionLongue, objectifs
 * - prerequis Json?, equipementRequis Json?, equipementFourni Json?
 * - hebergementLabel, hebergementDetails, repasLabel, transportLabel
 * - pointRdv, langues Json?, ageMin, ageMax
 * - niveauTechnique, niveauPhysique
 * - disciplinesComplementaires Json?
 * - programmeJours AventureJour[]
 *
 * If some of these fields are not in your schema yet,
 * you can safely remove the corresponding properties in the seed.
 *
 * Default import uses "@prisma/client".
 * If your client is generated elsewhere (e.g. ./src/generated),
 * update the import accordingly.
 *
 * Usage:
 *   npx prisma db push
 *   npx prisma generate
 *   npx tsx prisma/seed.ts
 */

import pkg from "@prisma/client"

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})

const {
  PrismaClient,
  UserRole,
  AventureDiscipline,
  AventureFormule,
  AventureSessionStatut,
  BookingStatut,
  ImageKind,
} = pkg

const prisma = new PrismaClient({ adapter })


// ---------- Helpers ----------

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// ---------- Guides ----------

async function seedGuides() {
  const guides = []

  // 1) Nicolas – Brigade du kif
  guides.push(
    await prisma.user.upsert({
      where: { email: 'nicolas@brigadedukif.dev' },
      update: {
        role: UserRole.GUIDE,
        firstName: 'Nicolas',
        lastName: 'Guillemain',
        department: '73 - Savoie',
        acquisitionSource: 'direct',
        guideProfile: {
          upsert: {
            update: {
              bio:
                "Moniteur d’escalade et créateur de la Brigade du kif. J’adore imaginer des aventures locales, " +
                'mixer progression, moments de vie et bons plans terroir sans perdre le plaisir de grimper.',
              baseLocation: 'Massif des Bauges & Vercors',
              instagramUrl: 'https://www.instagram.com/brigadedukif',
              websiteUrl: 'https://brigadedukif.fr',
              // mets ici une vraie image de toi si tu veux
              profileImageUrl:
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
            },
            create: {
              bio:
                "Moniteur d’escalade et créateur de la Brigade du kif. J’adore imaginer des aventures locales, " +
                'mixer progression, moments de vie et bons plans terroir sans perdre le plaisir de grimper.',
              baseLocation: 'Massif des Bauges & Vercors',
              instagramUrl: 'https://www.instagram.com/brigadedukif',
              websiteUrl: 'https://brigadedukif.fr',
              profileImageUrl:
                'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
            },
          },
        },
      },
      create: {
        email: 'nicolas@brigadedukif.dev',
        role: UserRole.GUIDE,
        firstName: 'Nicolas',
        lastName: 'Guillemain',
        department: '73 - Savoie',
        acquisitionSource: 'direct',
        guideProfile: {
          create: {
            bio:
              "Moniteur d’escalade et créateur de la Brigade du kif. J’adore imaginer des aventures locales, " +
              'mixer progression, moments de vie et bons plans terroir sans perdre le plaisir de grimper.',
            baseLocation: 'Massif des Bauges & Vercors',
            instagramUrl: 'https://www.instagram.com/brigadedukif',
            websiteUrl: 'https://brigadedukif.fr',
            profileImageUrl:
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
          },
        },
      },
      include: { guideProfile: true },
    }),
  )

  // 2) Emma – Fontainebleau / bloc
  guides.push(
    await prisma.user.upsert({
      where: { email: 'emma.fontainebleau@guides.test' },
      update: {
        role: UserRole.GUIDE,
        firstName: 'Emma',
        lastName: 'Laurent',
        department: '77 - Seine-et-Marne',
        acquisitionSource: 'instagram',
        guideProfile: {
          upsert: {
            update: {
              bio:
                'Spécialisée en bloc extérieur, j’aide les grimpeur·euses à passer du pan à la forêt en confiance, ' +
                'avec un gros focus sur la gestuelle et la sécurité.',
              baseLocation: 'Fontainebleau',
              instagramUrl: 'https://www.instagram.com/bleau_avec_emma',
              websiteUrl: null,
              profileImageUrl:
                'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
            },
            create: {
              bio:
                'Spécialisée en bloc extérieur, j’aide les grimpeur·euses à passer du pan à la forêt en confiance, ' +
                'avec un gros focus sur la gestuelle et la sécurité.',
              baseLocation: 'Fontainebleau',
              instagramUrl: 'https://www.instagram.com/bleau_avec_emma',
              websiteUrl: null,
              profileImageUrl:
                'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
            },
          },
        },
      },
      create: {
        email: 'emma.fontainebleau@guides.test',
        role: UserRole.GUIDE,
        firstName: 'Emma',
        lastName: 'Laurent',
        department: '77 - Seine-et-Marne',
        acquisitionSource: 'instagram',
        guideProfile: {
          create: {
            bio:
              'Spécialisée en bloc extérieur, j’aide les grimpeur·euses à passer du pan à la forêt en confiance, ' +
              'avec un gros focus sur la gestuelle et la sécurité.',
            baseLocation: 'Fontainebleau',
            instagramUrl: 'https://www.instagram.com/bleau_avec_emma',
            websiteUrl: null,
            profileImageUrl:
              'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
          },
        },
      },
      include: { guideProfile: true },
    }),
  )

  // 3) Yannis – trad & fissures Pays basque
  guides.push(
    await prisma.user.upsert({
      where: { email: 'yannis.trad@guides.test' },
      update: {
        role: UserRole.GUIDE,
        firstName: 'Yannis',
        lastName: 'Martin',
        department: '64 - Pyrénées-Atlantiques',
        acquisitionSource: 'bouche_a_oreille',
        guideProfile: {
          upsert: {
            update: {
              bio:
                'Grimpeur trad amoureux des fissures basques. Je transmets les bases du coinceur sans prise de tête, ' +
                'avec beaucoup de pédagogie et une vraie place pour le groupe.',
              baseLocation: 'Pays basque',
              instagramUrl: 'https://www.instagram.com/trad_pays_basque',
              websiteUrl: null,
              profileImageUrl:
                'https://images.unsplash.com/photo-1546530967-21531b891dd4?auto=format&fit=crop&w=600&q=80',
            },
            create: {
              bio:
                'Grimpeur trad amoureux des fissures basques. Je transmets les bases du coinceur sans prise de tête, ' +
                'avec beaucoup de pédagogie et une vraie place pour le groupe.',
              baseLocation: 'Pays basque',
              instagramUrl: 'https://www.instagram.com/trad_pays_basque',
              websiteUrl: null,
              profileImageUrl:
                'https://images.unsplash.com/photo-1546530967-21531b891dd4?auto=format&fit=crop&w=600&q=80',
            },
          },
        },
      },
      create: {
        email: 'yannis.trad@guides.test',
        role: UserRole.GUIDE,
        firstName: 'Yannis',
        lastName: 'Martin',
        department: '64 - Pyrénées-Atlantiques',
        acquisitionSource: 'bouche_a_oreille',
        guideProfile: {
          create: {
            bio:
              'Grimpeur trad amoureux des fissures basques. Je transmets les bases du coinceur sans prise de tête, ' +
              'avec beaucoup de pédagogie et une vraie place pour le groupe.',
            baseLocation: 'Pays basque',
            instagramUrl: 'https://www.instagram.com/trad_pays_basque',
            websiteUrl: null,
            profileImageUrl:
              'https://images.unsplash.com/photo-1546530967-21531b891dd4?auto=format&fit=crop&w=600&q=80',
          },
        },
      },
      include: { guideProfile: true },
    }),
  )

  return guides
}

// ---------- Grimpeurs (communauté) ----------

async function seedClimbers() {
  const climbersData = [
    {
      email: 'lea@grimpe.test',
      firstName: 'Léa',
      lastName: 'Dubois',
      department: '38 - Isère',
      acquisitionSource: 'direct',
      typesOfClimbing: ['sport', 'multi'],
      climbsMainly: 'lead',
      environments: ['falaise', 'salle_privee'],
      autonomy: ['assur_tete', 'manip_haut_de_voie'],
      frequency: '2_3',
      gradeLevel: '6a_6c',
      tripStyles: ['aventure', 'confort'],
    },
    {
      email: 'thomas@grimpe.test',
      firstName: 'Thomas',
      lastName: 'Morel',
      department: '69 - Rhône',
      acquisitionSource: 'direct',
      typesOfClimbing: ['bloc', 'sport'],
      climbsMainly: 'lead',
      environments: ['salle_privee', 'falaise'],
      autonomy: ['assur_tete'],
      frequency: '1',
      gradeLevel: '5a_5c',
      tripStyles: ['aventure'],
    },
    {
      email: 'ines@grimpe.test',
      firstName: 'Inès',
      lastName: 'Garcia',
      department: '64 - Pyrénées-Atlantiques',
      acquisitionSource: 'instagram',
      typesOfClimbing: ['bloc'],
      climbsMainly: 'toprope',
      environments: ['salle_privee'],
      autonomy: [],
      frequency: '2_3',
      gradeLevel: 'dont_know',
      tripStyles: ['aventure'],
    },
  ] as const

  const climbers = []

  for (const c of climbersData) {
    climbers.push(
      await prisma.user.upsert({
        where: { email: c.email },
        update: {
          role: UserRole.CLIMBER,
          firstName: c.firstName,
          lastName: c.lastName,
          department: c.department,
          acquisitionSource: c.acquisitionSource,
          typesOfClimbing: c.typesOfClimbing,
          climbsMainly: c.climbsMainly,
          environments: c.environments,
          autonomy: c.autonomy,
          frequency: c.frequency,
          gradeLevel: c.gradeLevel,
          tripStyles: c.tripStyles,
          onboarded: true,
          onboardingStep: 3,
        },
        create: {
          email: c.email,
          role: UserRole.CLIMBER,
          firstName: c.firstName,
          lastName: c.lastName,
          department: c.department,
          acquisitionSource: c.acquisitionSource,
          typesOfClimbing: c.typesOfClimbing,
          climbsMainly: c.climbsMainly,
          environments: c.environments,
          autonomy: c.autonomy,
          frequency: c.frequency,
          gradeLevel: c.gradeLevel,
          tripStyles: c.tripStyles,
          onboarded: true,
          onboardingStep: 3,
        },
      }),
    )
  }

  return climbers
}

// ---------- Aventures ----------

async function seedAventures(guides: any[]) {
  const [nicolas, emma, yannis] = guides
  const now = new Date()

  type SessionSeed = {
    offsetDays: number
    durationDays: number
    placesTotales: number
  }

  type ImageSeed = {
    url: string
    alt: string
    kind?: ImageKind
    position?: number
  }

  type JourSeed = {
    ordre: number
    titre: string
    description?: string
    lieuLabel?: string
    discipline?: AventureDiscipline
  }

  const aventures: {
    slug: string
    guideId: number
    titre: string
    sousTitre?: string
    discipline: AventureDiscipline
    formule: AventureFormule
    disciplinesComplementaires?: string[]
    lieuLabel: string
    region?: string
    jours: number
    placesMax: number
    niveauMinimum?: string
    autonomieMini?: string
    prixParPersonne: number
    inclus?: string
    nonInclus?: string
    pointsLocaux?: string
    descriptionCourte?: string
    descriptionLongue?: string
    objectifs?: string
    prerequis?: string[]
    equipementRequis?: string[]
    equipementFourni?: string[]
    hebergementLabel?: string
    hebergementDetails?: string
    repasLabel?: string
    transportLabel?: string
    pointRdv?: string
    langues?: string[]
    ageMin?: number
    ageMax?: number
    coverImageUrl?: string
    images?: ImageSeed[]
    programmeJours?: JourSeed[]
    estPublie: boolean
    sessions: SessionSeed[]
  }[] = [
    // 1) Orpierre – immersion complète
    {
      slug: 'aventure-escalade-a-orpierre-petites-grandes-voies',
      guideId: nicolas.id,
      titre: 'Orpierre : petites et grandes voies dans les Alpes du Sud',
      sousTitre:
        '4 jours pour enchaîner couennes et grandes voies en douceur, dans un village entièrement tourné vers la grimpe.',
      discipline: AventureDiscipline.GRANDE_VOIE,
      formule: AventureFormule.GRIMPE_SEULEMENT,
      disciplinesComplementaires: ['FALAISE'],
      lieuLabel: 'Orpierre, Hautes-Alpes',
      region: 'Provence-Alpes-Côte d’Azur',
      jours: 4,
      placesMax: 6,
      niveauMinimum: '5b',
      autonomieMini: 'assur_tete',
      prixParPersonne: 640,
      inclus:
        'Encadrement, matériel de sécurité collectif, hébergement en gîte en chambre partagée, petits-déjeuners et dîners.',
      nonInclus:
        'Transport jusqu’à Orpierre, pique-niques du midi, boissons et dépenses personnelles.',
      pointsLocaux:
        'Village 100 % grimpe, terrasses au soleil, producteurs locaux (miels, fromages, pains) et belles lumières de fin de journée.',
      descriptionCourte:
        'Une immersion grande voie + couenne pour prendre confiance en tête, en réversible et dans la gestion d’une course sur plusieurs longueurs.',
      descriptionLongue:
        "On alterne couennes à la journée pour consolider les bases en tête, et grandes voies accessibles pour faire le lien : manip’ de relais, communication, " +
        'gestion de l’itinéraire. Le tout en petit groupe, avec du temps pour débriefer, ajuster et profiter du village le soir.',
      objectifs:
        '- Consolider l’assurage en tête et les réflexes sécurité.\n' +
        '- Découvrir ou revoir les manipulations de relais en grande voie équipée.\n' +
        '- Apprendre à choisir une voie adaptée à son niveau et à son envie du jour.\n' +
        '- Vivre une aventure collective sans se prendre trop au sérieux.',
      prerequis: [
        'Être à l’aise dans le 5b en tête ou en moulinette en falaise ou SAE.',
        "Savoir assurer un·e grimpeur·euse en tête avec un système d’assurage adapté.",
      ],
      equipementRequis: [
        'Chaussons d’escalade',
        'Baudrier',
        "Casque d'escalade",
        'Veste coupe-vent / couche chaude',
        'Petit sac à dos (20–30 L)',
      ],
      equipementFourni: [
        'Cordes à double et à simple',
        'Dégaines et matériel de relais',
        'Système d’assurage si besoin',
      ],
      hebergementLabel: 'Gîte confortable au cœur du village',
      hebergementDetails:
        'Chambres partagées, ambiance grimpeurs. Linge fourni. Espaces communs pour débriefer les journées.',
      repasLabel:
        'Petits-déjeuners et dîners inclus au gîte. Pique-niques du midi à prévoir (possibilité d’acheter sur place).',
      transportLabel:
        'Covoiturage encouragé jusqu’à Orpierre. Arrivée la veille ou le matin même selon ton organisation.',
      pointRdv:
        'Place principale d’Orpierre, devant le kiosque, le jour 1 à 9h.',
      langues: ['Français'],
      ageMin: 18,
      ageMax: 65,
      coverImageUrl: '/images/falaise-Calanques2.jpg',
      images: [
        {
          url: '/images/falaise-Calanques2.jpg',
          alt: 'Grande paroi lumineuse style Orpierre',
          kind: ImageKind.COVER,
          position: 1,
        },
        {
          url: '/images/escalade-grande-voie-calanques.jpg',
          alt: 'Longueur en grande voie avec vue dégagée',
          kind: ImageKind.GALLERY,
          position: 2,
        },
        {
          url: '/images/falaise-escalade-beaufortain.jpg',
          alt: 'Couenne en dalle au soleil',
          kind: ImageKind.GALLERY,
          position: 3,
        },
      ],
      programmeJours: [
        {
          ordre: 1,
          titre: 'Retrouvailles & couennes pour se mettre dans le bain',
          description:
            'Accueil au village, vérification du matos, couennes en dalle pour reprendre ses marques en tête, ateliers vol et assurage dynamique.',
          lieuLabel: 'Secteurs écoles proches du village',
          discipline: AventureDiscipline.FALAISE,
        },
        {
          ordre: 2,
          titre: 'Première grande voie en réversible',
          description:
            'Choix d’un itinéraire adapté au groupe (4–6 longueurs). Travail sur la communication, les relais et la gestion de la longueur.',
          lieuLabel: 'Grande paroi dominante Orpierre',
          discipline: AventureDiscipline.GRANDE_VOIE,
        },
        {
          ordre: 3,
          titre: 'Approfondir et adapter les longueurs',
          description:
            'Reprise des points de vigilance, variantes possibles selon les envies : couennes plus dures, 2ème grande voie plus engagée ou plus ludique.',
          lieuLabel: 'Secteurs au soleil ou à l’ombre selon les conditions.',
          discipline: AventureDiscipline.GRANDE_VOIE,
        },
        {
          ordre: 4,
          titre: 'Dernières longueurs & bilan collectif',
          description:
            'Matinée sur le rocher, puis temps de bilan : ce que tu emmènes chez toi pour la suite de ta pratique.',
          lieuLabel: 'Couennes ou mini grande voie selon l’énergie du groupe',
          discipline: AventureDiscipline.FALAISE,
        },
      ],
      estPublie: true,
      sessions: [
        { offsetDays: 20, durationDays: 4, placesTotales: 6 },
        { offsetDays: 65, durationDays: 4, placesTotales: 6 },
      ],
    },

    // 2) Presles – autonomie grande voie
    {
      slug: 'aventure-grande-voie-presles-autonomie-joyeuse',
      guideId: nicolas.id,
      titre: 'Presles : autonomie grande voie en mode Brigade du kif',
      sousTitre:
        '2 jours pour oser se lancer en grande voie équipée, sans pression, avec un accompagnement pas à pas.',
      discipline: AventureDiscipline.GRANDE_VOIE,
      formule: AventureFormule.GRIMPE_SEULEMENT,
      lieuLabel: 'Presles, Vercors',
      region: 'Auvergne-Rhône-Alpes',
      jours: 2,
      placesMax: 4,
      niveauMinimum: '6a',
      autonomieMini: 'assur_tete',
      prixParPersonne: 320,
      inclus:
        'Encadrement, cordes et matériel collectif, ateliers relais et réchappe.',
      nonInclus:
        'Hébergement, repas, transport jusqu’au point de rendez-vous.',
      pointsLocaux:
        'Bars de grimpeurs, fermes du Vercors et spots de coucher de soleil inoubliables.',
      descriptionCourte:
        'Un format court et intense pour comprendre ce qui se passe réellement dans une grande voie et repartir avec des bases solides.',
      descriptionLongue:
        "On part sur une ou deux grandes voies adaptées, avec des temps d’échange au relais pour faire le point : du concret, de la pédagogie et de " +
        'la place pour le plaisir d’être en paroi. Si la météo le permet, on s’offre un final en beauté pour la dernière longueur.',
      objectifs:
        '- Comprendre l’enchaînement logique des manip en grande voie.\n' +
        "- Savoir préparer une sortie (topo, météo, choix d’itinéraire).\n" +
        '- Gagner en confiance pour partir ensuite avec des partenaires en toute lucidité.',
      prerequis: [
        'Être à l’aise dans le 6a en tête ou en moulinette.',
        'Avoir déjà fait au moins une journée en falaise naturelle.',
      ],
      equipementRequis: [
        'Chaussons',
        'Baudrier',
        'Casque',
        'Vêtements adaptés (vent / soleil)',
      ],
      equipementFourni: [
        'Cordes à double',
        'Dégaines et matériel de relais',
        "Systèmes d'assurage si besoin",
      ],
      hebergementLabel: 'Hébergement libre (gîte, van, bivouac)',
      hebergementDetails:
        'Nicolas te proposera quelques options selon ton budget et ton mode de vie.',
      repasLabel: 'Repas libres, souvent l’occasion de tester les tables locales.',
      transportLabel:
        'Rendez-vous en covoiturage encouragé, accès route au plateau de Presles.',
      pointRdv: 'Parking principal des falaises de Presles, jour 1 à 9h.',
      langues: ['Français'],
      ageMin: 18,
      ageMax: 65,
      coverImageUrl: '/images/escalade-grande-voie-calanques.jpg',
      images: [
        {
          url: '/images/escalade-grande-voie-calanques.jpg',
          alt: 'Corde en grande voie avec vue sur la mer',
          kind: ImageKind.COVER,
          position: 1,
        },
        {
          url: '/images/falaise-escalade-beaufortain.jpg',
          alt: 'Relais confortable en falaise',
          kind: ImageKind.GALLERY,
          position: 2,
        },
      ],
      programmeJours: [
        {
          ordre: 1,
          titre: 'Grande voie de chauffe',
          description:
            'Grande voie école de 4–5 longueurs pour revoir toutes les manipulations en contexte réel.',
          lieuLabel: 'Paroi école de Presles',
          discipline: AventureDiscipline.GRANDE_VOIE,
        },
        {
          ordre: 2,
          titre: 'Grande voie plus engagée & bilan',
          description:
            'On monte d’un cran ou on consolide selon le groupe. Débrief et plan pour la suite de ta pratique.',
          lieuLabel: 'Paroi lumineuse selon conditions météo',
          discipline: AventureDiscipline.GRANDE_VOIE,
        },
      ],
      estPublie: true,
      sessions: [
        { offsetDays: 10, durationDays: 2, placesTotales: 4 },
        { offsetDays: 45, durationDays: 2, placesTotales: 4 },
      ],
    },

    // 3) Bauges – falaise & terroir
    {
      slug: 'aventure-falaise-bauges-grimpe-terroir',
      guideId: nicolas.id,
      titre: 'Les Bauges : falaise & terroir savoyard',
      sousTitre:
        'Grimpe en couenne le matin, bons produits locaux l’après-midi et couchers de soleil en montagne.',
      discipline: AventureDiscipline.FALAISE,
      formule: AventureFormule.GRIMPE_SEULEMENT,
      lieuLabel: 'Massif des Bauges',
      region: 'Auvergne-Rhône-Alpes',
      jours: 3,
      placesMax: 8,
      niveauMinimum: '5b',
      autonomieMini: 'assur_tete',
      prixParPersonne: 290,
      inclus:
        'Encadrement, prêt de dégaines et matériel collectif, ateliers techniques.',
      nonInclus:
        'Hébergement, repas, dégustations éventuelles, transport.',
      pointsLocaux:
        'Fromageries, fermes, petits cafés de villages et points de vue de fin de journée.',
      descriptionCourte:
        'Un séjour falaise pour progresser en tête dans un cadre doux et un rythme cool.',
      descriptionLongue:
        "On alterne matinées de grimpe concentrée sur un secteur choisi et après-midis plus souples (balade, baignade, dégustation). L’idée : " +
        'ne pas faire que grimper, mais vivre vraiment le territoire.',
      objectifs:
        '- Gagner en aisance en tête dans le 5/6.\n' +
        '- Travailler la lecture de voie et la pose de pied.\n' +
        '- Découvrir les falaises des Bauges sans se perdre dans le topo.',
      prerequis: [
        'Être autonome en moulinette en falaise ou SAE.',
        'Avoir déjà testé la grimpe en tête (même en salle).',
      ],
      equipementRequis: [
        'Chaussons',
        'Baudrier',
        'Casque',
        'Vêtements adaptés à la météo',
        'Gourde, snack',
      ],
      equipementFourni: ['Cordes', 'Dégaines', 'Matériel collectif'],
      hebergementLabel: 'Hébergement libre ou gîtes partenaires',
      hebergementDetails:
        'Possibilité de suggestions de gîtes / camping selon tes envies.',
      repasLabel:
        'Repas libres, souvent l’occasion de tester les tables locales.',
      transportLabel:
        'Rendez-vous sur les parkings des secteurs (covoiturage encouragé).',
      pointRdv: 'Parking de la première falaise, jour 1 à 9h.',
      langues: ['Français'],
      ageMin: 16,
      ageMax: 70,
      coverImageUrl: '/images/falaise-escalade-beaufortain.jpg',
      images: [
        {
          url: '/images/falaise-escalade-beaufortain.jpg',
          alt: 'Falaise en moyenne montagne dans les Bauges',
          kind: ImageKind.COVER,
          position: 1,
        },
      ],
      programmeJours: [
        {
          ordre: 1,
          titre: 'Découverte du secteur & ajustement du niveau',
          description:
            'Grimpe sur un secteur école pour caler attentes et envies, premiers objectifs définis.',
          lieuLabel: 'Falaise école des Bauges',
          discipline: AventureDiscipline.FALAISE,
        },
        {
          ordre: 2,
          titre: 'Journée progression en tête',
          description:
            'Travail ciblé sur le clipage, la gestion du mental et les essais à la limite.',
          lieuLabel: 'Secteurs adaptés au groupe',
          discipline: AventureDiscipline.FALAISE,
        },
        {
          ordre: 3,
          titre: 'Projet perso & grimpe plaisir',
          description:
            'Tu essaies ta voie “rêve du week-end” ou tu consolides ce qui a été vu.',
          lieuLabel: 'Dernier spot sympa avec belle vue',
          discipline: AventureDiscipline.FALAISE,
        },
      ],
      estPublie: true,
      sessions: [
        { offsetDays: 18, durationDays: 3, placesTotales: 8 },
      ],
    },

    // 4) Fontainbleau – bloc
    {
      slug: 'aventure-bloc-fontainebleau-initiation-foret',
      guideId: emma.id,
      titre: 'Fontainebleau : passer du pan à la forêt',
      sousTitre:
        'Une journée pour apprivoiser le bloc extérieur, la lecture de ligne et la sécurité sur crashpads.',
      discipline: AventureDiscipline.BLOC,
      formule: AventureFormule.GRIMPE_SEULEMENT,
      lieuLabel: 'Forêt de Fontainebleau',
      region: 'Île-de-France',
      jours: 1,
      placesMax: 10,
      niveauMinimum: null as any,
      autonomieMini: null as any,
      prixParPersonne: 95,
      inclus:
        'Encadrement, crashpads collectifs, briefing sécurité, ateliers lecture de blocs.',
      nonInclus:
        'Transport, repas, crashpad perso si tu préfères grimper avec ton matos.',
      pointsLocaux:
        'Boulangeries, cafés de grimpeurs et petits coins calmes en forêt.',
      descriptionCourte:
        'Idéal si tu grimpes surtout en salle et que tu veux découvrir Bleau sans te faire peur.',
      descriptionLongue:
        "On choisit un secteur accessible, avec des blocs de tous niveaux. On parle réception, placement des pads, gestion du groupe et lecture de passages. " +
        'Objectif : que tu repartes avec les bons réflexes pour y retourner en autonomie.',
      objectifs:
        '- Comprendre les spécificités du bloc extérieur.\n' +
        '- Apprendre à placer et utiliser des crashpads.\n' +
        '- Travailler la lecture de bloc et la gestuelle sur grès.',
      prerequis: ['Grimper un peu en bloc en salle, quel que soit le niveau.'],
      equipementRequis: ['Chaussons', 'Vêtements confortables', 'Eau & encas'],
      equipementFourni: ['Crashpads collectifs', 'Brosses à prises'],
      hebergementLabel: null,
      hebergementDetails: null,
      repasLabel:
        'Repas libres (pique-nique ou boulangerie). On peut se caler un café avant ou après.',
      transportLabel:
        'Rendez-vous directement sur le parking du secteur (coordonnées communiquées la veille).',
      pointRdv: 'Parking du secteur choisi, jour 1 vers 9h30.',
      langues: ['Français'],
      ageMin: 14,
      ageMax: 65,
      coverImageUrl: '/images/bloc-Pays-Basque-Mondarrain.jpg',
      images: [
        {
          url: '/images/bloc-Pays-Basque-Mondarrain.jpg',
          alt: 'Bloc sur rocher avec crashpads',
          kind: ImageKind.COVER,
          position: 1,
        },
      ],
      programmeJours: [
        {
          ordre: 1,
          titre: 'Bloc, pads & forêt',
          description:
            'Accueil, échauffement collectif, ateliers placements de crashpads, grimpe encadrée sur un circuit adapté au groupe.',
          lieuLabel: 'Secteur choisi selon météo et affluence',
          discipline: AventureDiscipline.BLOC,
        },
      ],
      estPublie: true,
      sessions: [
        { offsetDays: 7, durationDays: 1, placesTotales: 10 },
        { offsetDays: 21, durationDays: 1, placesTotales: 10 },
      ],
    },

    // 5) Pays basque – trad
    {
      slug: 'aventure-trad-initiation-fissures-pays-basque',
      guideId: yannis.id,
      titre: 'Pays basque : initiation trad & fissures',
      sousTitre:
        'Découvrir le coinceur sans se crisper : fissures faciles, ateliers matériel et ambiance basque.',
      discipline: AventureDiscipline.TRAD,
      formule: AventureFormule.GRIMPE_SEULEMENT,
      disciplinesComplementaires: ['FALAISE'],
      lieuLabel: 'Falaises du Pays basque',
      region: 'Nouvelle-Aquitaine',
      jours: 2,
      placesMax: 4,
      niveauMinimum: '5c',
      autonomieMini: 'assur_tete',
      prixParPersonne: 340,
      inclus:
        'Encadrement, tout le matériel trad collectif (friends, coinceurs, sangles).',
      nonInclus:
        'Transport, hébergement, repas, matériel perso (chaussons, casque, baudrier).',
      pointsLocaux:
        'Falaises confidentielles, villages basques, éventuel bivouac selon la météo et les envies.',
      descriptionCourte:
        'Une porte d’entrée vers le trad pour comprendre comment poser et évaluer des protections en fissure.',
      descriptionLongue:
        "On commence par des ateliers au sol et sur blocs bas, puis on grimpe sur des lignes faciles pour tester les placements. " +
        'L’idée n’est pas de faire du dur, mais de sentir comment fonctionne ce type de grimpe en sécurité.',
      objectifs:
        '- Comprendre la logique des protections trad.\n' +
        '- Tester et évaluer un placement avant de grimper dessus.\n' +
        '- Aborder la grimpe en fissure en douceur.',
      prerequis: [
        'Être à l’aise dans le 5c en tête en escalade sportive.',
        "Avoir envie de découvrir quelque chose de nouveau sans pression de performance.",
      ],
      equipementRequis: [
        'Chaussons',
        'Baudrier',
        'Casque',
        'Vêtements adaptés',
      ],
      equipementFourni: [
        'Jeu complet de friends & câblés',
        'Sangles, dégaines, cordes',
      ],
      hebergementLabel: 'Bivouac ou hébergement libre',
      hebergementDetails:
        'Possibilité de bivouac (si conditions OK) ou suggestion de gîtes / campings.',
      repasLabel:
        'Repas libres, souvent au rythme du groupe et des spots découverts.',
      transportLabel:
        'Rendez-vous sur un parking accessible en voiture, covoiturage encouragé.',
      pointRdv: 'Parking d’un spot de grimpe choisi selon météo, jour 1 à 9h.',
      langues: ['Français'],
      ageMin: 18,
      ageMax: 60,
      coverImageUrl: '/images/falaise-Calanques2.jpg',
      images: [
        {
          url: '/images/falaise-Calanques2.jpg',
          alt: 'Falaise avec fissures et lumière douce',
          kind: ImageKind.COVER,
          position: 1,
        },
      ],
      programmeJours: [
        {
          ordre: 1,
          titre: 'Ateliers coinceurs & premières fissures',
          description:
            'Beaucoup de pédagogie au sol, puis petites longueurs faciles pour tester les placements.',
          lieuLabel: 'Secteur école trad',
          discipline: AventureDiscipline.TRAD,
        },
        {
          ordre: 2,
          titre: 'Petite voie trad & gestion du mental',
          description:
            'Mise en situation réelle sur une voie trad accessible, avec accompagnement rapproché.',
          lieuLabel: 'Falaise adaptée au groupe',
          discipline: AventureDiscipline.TRAD,
        },
      ],
      estPublie: true,
      sessions: [
        { offsetDays: 30, durationDays: 2, placesTotales: 4 },
      ],
    },
  ]

  // Upsert des aventures + images + programme + sessions
  for (const a of aventures) {
    const slug = a.slug || slugify(a.titre)

    const aventure = await prisma.aventure.upsert({
      where: { slug },
      update: {
        titre: a.titre,
        sousTitre: a.sousTitre,
        discipline: a.discipline,
        formule: a.formule,
        disciplinesComplementaires: a.disciplinesComplementaires ?? [],
        lieuLabel: a.lieuLabel,
        pays: 'France',
        region: a.region,
        jours: a.jours,
        placesMax: a.placesMax,
        niveauMinimum: a.niveauMinimum,
        autonomieMini: a.autonomieMini,
        prixParPersonne: a.prixParPersonne,
        devise: 'EUR',
        inclus: a.inclus,
        nonInclus: a.nonInclus,
        pointsLocaux: a.pointsLocaux,
        descriptionCourte: a.descriptionCourte,
        descriptionLongue: a.descriptionLongue,
        objectifs: a.objectifs,
        prerequis: a.prerequis ?? [],
        equipementRequis: a.equipementRequis ?? [],
        equipementFourni: a.equipementFourni ?? [],
        hebergementLabel: a.hebergementLabel,
        hebergementDetails: a.hebergementDetails,
        repasLabel: a.repasLabel,
        transportLabel: a.transportLabel,
        pointRdv: a.pointRdv,
        langues: a.langues ?? ['Français'],
        ageMin: a.ageMin,
        ageMax: a.ageMax,
        coverImageUrl: a.coverImageUrl,
        estPublie: a.estPublie,
      },
      create: {
        slug,
        titre: a.titre,
        sousTitre: a.sousTitre,
        discipline: a.discipline,
        formule: a.formule,
        disciplinesComplementaires: a.disciplinesComplementaires ?? [],
        lieuLabel: a.lieuLabel,
        pays: 'France',
        region: a.region,
        jours: a.jours,
        placesMax: a.placesMax,
        niveauMinimum: a.niveauMinimum,
        autonomieMini: a.autonomieMini,
        prixParPersonne: a.prixParPersonne,
        devise: 'EUR',
        inclus: a.inclus,
        nonInclus: a.nonInclus,
        pointsLocaux: a.pointsLocaux,
        descriptionCourte: a.descriptionCourte,
        descriptionLongue: a.descriptionLongue,
        objectifs: a.objectifs,
        prerequis: a.prerequis ?? [],
        equipementRequis: a.equipementRequis ?? [],
        equipementFourni: a.equipementFourni ?? [],
        hebergementLabel: a.hebergementLabel,
        hebergementDetails: a.hebergementDetails,
        repasLabel: a.repasLabel,
        transportLabel: a.transportLabel,
        pointRdv: a.pointRdv,
        langues: a.langues ?? ['Français'],
        ageMin: a.ageMin,
        ageMax: a.ageMax,
        coverImageUrl: a.coverImageUrl,
        guideId: a.guideId,
        estPublie: a.estPublie,
      },
    })

    // Images
    await prisma.aventureImage.deleteMany({ where: { aventureId: aventure.id } })
    if (a.images && a.images.length) {
      for (const img of a.images) {
        await prisma.aventureImage.create({
          data: {
            aventureId: aventure.id,
            url: img.url,
            alt: img.alt,
            kind: img.kind ?? ImageKind.GALLERY,
            position: img.position ?? null,
          },
        })
      }
    }

    // Programme jours
    await prisma.aventureJour.deleteMany({ where: { aventureId: aventure.id } })
    if (a.programmeJours && a.programmeJours.length) {
      for (const j of a.programmeJours) {
        await prisma.aventureJour.create({
          data: {
            aventureId: aventure.id,
            ordre: j.ordre,
            titre: j.titre,
            description: j.description ?? null,
            lieuLabel: j.lieuLabel ?? null,
            discipline: j.discipline ?? null,
          },
        })
      }
    }

    // Sessions
    await prisma.aventureSession.deleteMany({ where: { aventureId: aventure.id } })
    for (const s of a.sessions) {
      const dateDebut = addDays(now, s.offsetDays)
      const dateFin = addDays(dateDebut, s.durationDays - 1)

      await prisma.aventureSession.create({
        data: {
          aventureId: aventure.id,
          dateDebut,
          dateFin,
          statut: AventureSessionStatut.OUVERT,
          placesTotales: s.placesTotales,
          placesReservees: 0,
          prixSpecifique: null,
        },
      })
    }
  }
}

// ---------- Bookings ----------

async function seedBookings() {
  const climbers = await prisma.user.findMany({
    where: { role: UserRole.CLIMBER },
  })
  if (!climbers.length) return

  const sessions = await prisma.aventureSession.findMany({
    orderBy: { dateDebut: 'asc' },
    include: { aventure: true },
  })
  if (!sessions.length) return

  const picks = [
    {
      climber: climbers[0],
      session: sessions[0],
      participants: 1,
      statut: BookingStatut.CONFIRMEE,
    },
    sessions[1]
      ? {
          climber: climbers[1] ?? climbers[0],
          session: sessions[1],
          participants: 2,
          statut: BookingStatut.EN_ATTENTE,
        }
      : null,
    sessions[2]
      ? {
          climber: climbers[2] ?? climbers[0],
          session: sessions[2],
          participants: 1,
          statut: BookingStatut.CONFIRMEE,
        }
      : null,
  ].filter(Boolean) as {
    climber: any
    session: any
    participants: number
    statut: BookingStatut
  }[]

  for (const p of picks) {
    const price =
      p.session.prixSpecifique ?? p.session.aventure.prixParPersonne
    const montant = price * p.participants

    await prisma.booking.create({
      data: {
        userId: p.climber.id,
        sessionId: p.session.id,
        participants: p.participants,
        statut: p.statut,
        montant,
      },
    })

    await prisma.aventureSession.update({
      where: { id: p.session.id },
      data: {
        placesReservees: { increment: p.participants },
      },
    })
  }
}

// ---------- main ----------

async function main() {
  console.log('🌱 Seed Brigade du kif : guides, grimpeurs, aventures...')
  const guides = await seedGuides()
  await seedClimbers()
  await seedAventures(guides)
  await seedBookings()
  console.log('✅ Seed terminé.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

type PartnerOffer = {
  id: string
  title: string
  description: string
  code: string
  discounts: {
    products: string
    percent: number
    priceBefore?: number
    priceAfter?: number
  }[]
}

// Offres et codes communiqués par 4c+. Garder les codes côté serveur :
// ils ne doivent être transmis qu’aux moniteurs authentifiés.
export const partnerBenefits: {
  name: string
  websiteUrl: string
  offers: PartnerOffer[]
}[] = [
  {
    name: '4c+',
    websiteUrl: 'https://4c-plus.com/',
    offers: [
      {
        id: '4c-plus-moniteurs',
        title: 'Pour les moniteur·ice·s',
        description: 'Équipe-toi pour tes prochaines aventures avec les remises moniteurs.',
        code: 'KIFFPRO_REMISEMAX',
        discounts: [
          { products: 'Joker, Opera, Sunrise', percent: 18.5 },
          { products: 'Back up', percent: 13 },
          { products: 'Cobra, Iceline, Joker 100 m', percent: 5 },
          { products: 'Friends et Ice line GD 50 m', percent: 10 },
          { products: 'Booste, Stinger, Opera gold et 100 m', percent: 12 },
          { products: 'Tenaya Iati et Tanta', percent: 15 },
          { products: 'Tenaya Indalo et Aruma', percent: 11.92 },
          { products: 'Spelenium', percent: 17.5 },
        ],
      },
      {
        id: '4c-plus-parc-materiel',
        title: 'Casques et parc matériel',
        description: 'Profite de tarifs dédiés pour équiper ton parc matériel.',
        code: 'PARCMATOS442',
        discounts: [
          { products: 'Bobbie', percent: 25, priceBefore: 44.99, priceAfter: 33.74 },
          { products: 'Pixie', percent: 25, priceBefore: 49.95, priceAfter: 37.46 },
          { products: 'Aeroteam IV', percent: 10, priceBefore: 38, priceAfter: 34.20 },
          { products: 'Rockstar', percent: 10, priceBefore: 39, priceAfter: 35.10 },
          { products: 'Neo', percent: 20, priceBefore: 52.50, priceAfter: 42 },
          { products: 'Neo Kid', percent: 20, priceBefore: 48.11, priceAfter: 38.49 },
        ],
      },
      {
        id: '4c-plus-clients',
        title: 'Pour tes clients',
        description: 'Un code à partager avec tes clients pour leurs achats de matériel.',
        code: 'KIFF26',
        discounts: [
          { products: 'Karma, Joker 100 m, cordes doubles', percent: 5 },
          { products: 'Chaussons d’escalade', percent: 10 },
          { products: 'Cordes', percent: 10 },
          { products: 'Back up', percent: 10 },
        ],
      },
    ],
  },
]

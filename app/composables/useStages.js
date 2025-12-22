// composables/useStages.js
export const useStages = () => {
  const stages = [
    {
      id: 1,
      slug: 'escalade-grande-voie-presles',
      type: 'grande-voie',
      title: 'Week-end autonomie en grande voie',
      location: 'Presles, Vercors',
      description: 'Pour apprendre des manips efficaces et gagner en autonomie, grimper les plus jolies grandes voies dans un niveau qui vous correspond, en tête ou en second.',
      imageUrl: '/images/Presles.jpg',
      imageUrlTiny: '/images/Presles2.png',
      imageUrlHuge: '/images/falaise-Presles.jpg',
      date: 'Vendredi 2 Avril - Dimanche 4 Avril 2027',
      datetime: '2027-04-02',
      category: [
        { title: 'Grande Voie', href: '#' },
        { title: 'Autonomie', href: '#' }
      ],
      informations: [
        { name: 'Jours d\'escalade', value: '2' },
        { name: 'Places maximum', value: '2' },
        { name: 'Prix par personne', value: '500€' },
        { name: 'Niveau minimum requis', value: '5b' },
      ],
      values: [
        'Préparation d\'itinéraire la veille d\'une grande voie',
        'Apprenez les techniques spécifiques à l’escalade en grandes voies équipées : utilisation d’une corde à double, mise en place d’un relai et assurage du second de cordée, construire et descendre un rappel',
        'Grimpez en toute sécurité et familiarisez vous avec l’élément, la falaise',
        'Faites le plein de sensation en pleine nature',
        'Partagez un moment en montagne avec un professionnel passionné et créer un souvenir mémorable',
        'Donnez une nouvelle dimension à votre pratique de l’escalade'
      ],
      programme: [
        'Jour 1: Approche et premières voies',
        'Jour 2: Perfectionnement des techniques',
      ],
      materielInclus: [
        'L\’ encadrement par un professionnel de l’escalade diplômé d’état',
        'Le prêt du matériel de sécurité: baudrier, casque, longe',
        'Le matériel d’escalade (sauf les chaussons)'
      ],
      materielAPrevoir: [
        'Chaussons d\'escalade',
        'Vêtements légers et adaptés à la pratique de l’escalade',
        'Lunette de soleil',
        'Sac à dos',
        'Chaussures d’approche',
        'Eau',
        'Encas préféré'
      ]
    },
    {
      id: 2,
      slug: 'buoux',
      type: 'falaise',


      title: 'Stage falaise à Buoux',
      location: 'Buoux, Luberon',
      description: 'À la belle falaise de Buoux pour se perfectionner et prendre confiance.',

      imageUrl: '/images/falaise-Buoux3.jpg',
      imageUrlTiny: '/images/Buoux.png',
      imageUrlHuge: '/images/Buoux-camp-de-base.jpg',

      date: 'Samedi 10 Avril - Samedi 17 Avril 2027',
      datetime: '2027-04-10',
      category: [
        { title: 'Falaise', href: '#' },
        { title: 'Progression', href: '#' }
      ],
      informations: [
        { name: 'Jours d\'escalade', value: '5' },
        { name: 'Places maximum', value: '6' },
        { name: 'Prix par personne', value: '500€' },
        { name: 'Niveau minimum requis', value: '5a' },
      ],
      values: [
        'Préparation d\'itinéraire la veille d\'une grande voie',
        'Apprenez les techniques spécifiques à l’escalade en grandes voies équipées : utilisation d’une corde à double, mise en place d’un relai et assurage du second de cordée, construire et descendre un rappel',
        'Grimpez en toute sécurité et familiarisez vous avec l’élément, la falaise',
        'Faites le plein de sensation en pleine nature',
        'Partagez un moment en montagne avec un professionnel passionné et créer un souvenir mémorable',
        'Donnez une nouvelle dimension à votre pratique de l’escalade'
      ],
      programme: [
        'Jour 1: Approche et premières voies',
        'Jour 2: Perfectionnement des techniques',
      ],
      materielInclus: [
        'L\’ encadrement par un professionnel de l’escalade diplômé d’état',
        'Le prêt du matériel de sécurité: baudrier, casque, longe',
        'Le matériel d’escalade (sauf les chaussons)'
      ],
      materielAPrevoir: [
        'Chaussons d\'escalade',
        'Vêtements légers et adaptés à la pratique de l’escalade',
        'Lunette de soleil',
        'Sac à dos',
        'Chaussures d’approche',
        'Eau',
        'Encas préféré'
      ]
    },
    {
      id: 3,
      slug: 'bauges',
      type: 'falaise',
      title: 'Stage falaise dans les Bauges',
      location: 'Massif des Bauges, Savoie',
      description: 'Je te fais découvrir le massif dans lequel je vis. Plusieurs secteurs très intéressants sont envisageables en fonction des conditions et du niveau du groupe.',
      imageUrl: '/images/falaise-Bauges-Chatelard-Garins.jpg',
      imageUrlTiny: '/images/Garins.png',
      imageUrlHuge: '/images/falaise-Bauges-Chatelard-Garins.jpg',
      date: 'Samedi 24 Juillet - Samedi 31 Juillet 2027',
      datetime: '2027-07-24',
      category: [
        { title: 'Falaise', href: '#' },
        { title: 'Progression', href: '#' }
      ],
      informations: [
        { name: 'Jours d\'escalade', value: '5' },
        { name: 'Places maximum', value: '6' },
        { name: 'Prix par personne', value: '500€' },
        { name: 'Niveau minimum requis', value: '5a' },
      ],
      values: [
        'Préparation d\'itinéraire la veille d\'une grande voie',
        'Apprenez les techniques spécifiques à l’escalade en grandes voies équipées : utilisation d’une corde à double, mise en place d’un relai et assurage du second de cordée, construire et descendre un rappel',
        'Grimpez en toute sécurité et familiarisez vous avec l’élément, la falaise',
        'Faites le plein de sensation en pleine nature',
        'Partagez un moment en montagne avec un professionnel passionné et créer un souvenir mémorable',
        'Donnez une nouvelle dimension à votre pratique de l’escalade'
      ],
      programme: [
        'Jour 1: Approche et premières voies',
        'Jour 2: Perfectionnement des techniques',
      ],
      materielInclus: [
        'L\’ encadrement par un professionnel de l’escalade diplômé d’état',
        'Le prêt du matériel de sécurité: baudrier, casque, longe',
        'Le matériel d’escalade (sauf les chaussons)'
      ],
      materielAPrevoir: [
        'Chaussons d\'escalade',
        'Vêtements légers et adaptés à la pratique de l’escalade',
        'Lunette de soleil',
        'Sac à dos',
        'Chaussures d’approche',
        'Eau',
        'Encas préféré'
      ]
    },
  ]

  const getStageBySlug = (slug) => {
    return stages.find(stage => stage.slug === slug)
  }

  const getStagesByType = (type) => {
    return stages.filter(stage => stage.type === type)
  }

  return {
    stages,
    getStageBySlug,
    getStagesByType
  }
}

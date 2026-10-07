import type { EscaladeDepartmentCode } from './escalade-departments'

// Only departments with an existing climbing landing page are listed here.
// The French Pyrenees also cover Aude (11) and Pyrénées-Orientales (66).
export const escaladeMassifs = [
  {
    name: 'Pyrénées', departments: ['09', '31', '64', '65'],
    source: 'https://www.agencedespyrenees.fr/enjeux-du-territoire/',
  },
  {
    name: 'Alpes', departments: ['04', '05', '26', '38', '73', '74'],
    source: 'https://www.prefectures-regions.gouv.fr/content/download/101594/645734/file/plaquette_presentation_massif_des_alpes_v10_novembre2022.pdf',
  },
  {
    name: 'Bauges', departments: ['73', '74'],
    source: 'https://parcdesbauges.com/patrimoines-remarquables/',
  },
  {
    name: 'Vercors', departments: ['26', '38'],
    source: 'https://www.parc-du-vercors.fr/le-perimetre-et-les-chiffres-cles',
  },
  {
    name: 'Chartreuse', departments: ['38', '73'],
    source: 'https://www.parc-chartreuse.net/comprendre-le-parc/le-parc-naturel-regional-de-chartreuse/le-parc-de-chartreuse/',
  },
  {
    name: 'Belledonne', departments: ['38', '73'],
    source: 'https://www.espacebelledonne.fr/portrait-de-belledonne/',
  },
  {
    name: 'Écrins', departments: ['05', '38'],
    source: 'https://www.ecrins-parcnational.fr/linstitution-et-le-territoire',
  },
  {
    name: 'Cévennes', departments: ['07', '30', '34', '48'],
    source: 'https://www.cevennes-parcnational.fr/fr/des-decouvertes/parcourir-le-parc/les-cinq-massifs',
    // The southern Cévennes also reach Hérault, outside the national park.
    additionalSource: 'https://www.herault-tourisme.com/fr/activites/culture-a-vivre/sur-les-routes-medievales-de-lherault/entre-seranne-et-monts-de-saint-guilhem/',
  },
] as const satisfies ReadonlyArray<{
  name: string
  departments: readonly EscaladeDepartmentCode[]
  source: string
  additionalSource?: string
}>

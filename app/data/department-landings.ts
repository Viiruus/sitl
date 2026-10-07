import type { EscaladeDepartmentCode } from '~~/shared/data/escalade-departments'
import { additionalDepartmentLandings } from './additional-department-landings'

export type DepartmentLandingContent = {
  code: EscaladeDepartmentCode
  seoTitle: string
  seoDescription: string
  hero: { eyebrow: string; title: string; intro: string; image?: string }
  order: Array<'projects' | 'guides' | 'stages' | 'map' | 'areas'>
  guideTitle: string
  guideIntro: string
  projectsTitle: string
  projects: Array<{ eyebrow: string; title: string; description: string; cta: string }>
  stagesTitle: string
  stagesIntro: string
  areasTitle: string
  areasIntro: string
  areas: Array<{ title: string; eyebrow: string; description: string; tip: string }>
  faqTitle: string
  faqs: Array<{ question: string; answer: string }>
  contactTitle: string
  contactIntro: string
  relatedCodes: EscaladeDepartmentCode[]
}

// Each department has its own visitor needs, places and questions.
// Sources: hautes-alpes.net/experiences/escalade/, grenoble-tourisme.com,
// alpes-isere.com, tourismegard.com, herault-tourisme.com, lozere-tourisme.com,
// cevennes-ardeche.com and ardeche-guide.com.
export const departmentLandings: DepartmentLandingContent[] = [
  {
    code: '05',
    seoTitle: 'Escalade dans les Hautes-Alpes : Briançon, stages & moniteurs',
    seoDescription: 'Prépare ta sortie d’escalade autour de Briançon, à Ailefroide ou dans les Hautes-Alpes : moniteurs locaux, initiation en falaise et projets en grande voie.',
    hero: {
      eyebrow: 'Briançon, Vallouise et Alpes du Sud',
      title: 'Escalade dans les Hautes-Alpes',
      intro: 'Une journée sur le rocher pendant ton séjour à Briançon, une première grande voie à Ailefroide ou un projet plus ambitieux en cordée ? Trouve un moniteur pour faire de tes vacances en montagne une aventure à ta mesure.',
      image: '/images/falaise-Ceuse.jpg',
    },
    order: ['guides', 'areas', 'projects', 'stages', 'map'],
    guideTitle: 'Ta prochaine cordée se prépare autour de Briançon',
    guideIntro: 'Tu viens pour découvrir ou tu as déjà quelques longueurs dans les bras ? Partage ton expérience et tes dates avec un moniteur du Briançonnais. Vous choisirez ensemble le rocher et le format de la sortie.',
    projectsTitle: 'Une falaise pour commencer, une paroi pour aller plus loin',
    projects: [
      { eyebrow: 'Pendant les vacances', title: 'Une première journée dehors', description: 'Entre deux randonnées, réserve un moment pour découvrir l’escalade en falaise. Une séance privée permet de tenir compte de ton groupe et du temps que tu veux passer sur le rocher.', cta: 'Préparer ta découverte' },
      { eyebrow: 'En cordée', title: 'Découvrir plusieurs longueurs', description: 'Ailefroide ou le Briançonnais te donnent envie de prendre de la hauteur ? Ton expérience, l’approche et les conditions permettront de choisir une grande voie cohérente avec ton projet.', cta: 'Parler de ta grande voie' },
      { eyebrow: 'Un cap technique', title: 'Affiner tes gestes et tes manips', description: 'Lecture du rocher, progression en tête, organisation au relais : précise ce que tu souhaites travailler pour construire un accompagnement utile à ta pratique.', cta: 'Définir ton objectif' },
    ],
    stagesTitle: 'Les prochains stages dans les Hautes-Alpes et à proximité',
    stagesIntro: 'Envie de progresser pendant ton séjour ? Découvre les stages organisés dans les Hautes-Alpes ou près de leurs frontières, puis choisis tes dates et ton objectif sur le rocher.',
    areasTitle: 'De Briançon à Orpierre, choisis ton terrain de grimpe',
    areasIntro: 'Les Hautes-Alpes ne se résument pas à une seule falaise. Ton lieu de séjour et le style d’escalade que tu recherches sont de bons points de départ pour préparer une journée avec ton moniteur.',
    areas: [
      { eyebrow: 'Briançon et Serre Chevalier', title: 'Escalade autour de Briançon : partir de ton séjour', description: 'Le Briançonnais propose de nombreux sites naturels dans les vallées autour de la ville. Si tu loges à Briançon, Saint-Chaffrey ou au Monêtier-les-Bains, indique ton point de départ pour organiser une séance ou une journée accompagnée.', tip: 'Commence par les dates de ton séjour et ton expérience en falaise.' },
      { eyebrow: 'Vallouise-Pelvoux et Ailefroide', title: 'Ailefroide : le granite au pied des Écrins', description: 'À Ailefroide, le bloc et les itinéraires de plusieurs longueurs côtoient le paysage de haute montagne. Une sortie se choisit selon ton aisance sur le rocher, tes habitudes en cordée et le temps disponible.', tip: 'Précise si tu souhaites découvrir une grande voie ou travailler une technique.' },
      { eyebrow: 'Gap, Céüse et Orpierre', title: 'Le calcaire des Alpes du Sud, avec des projets différents', description: 'La falaise de Céüse et le village d’Orpierre sont deux repères du département pour l’escalade. Ils appellent des journées différentes : échange sur le niveau recherché, la marche d’approche et le secteur avant de réserver.', tip: 'Une envie de destination se transforme en sortie adaptée après un premier échange.' },
    ],
    faqTitle: 'Préparer ta journée de grimpe dans les Hautes-Alpes',
    faqs: [
      { question: 'Peut-on débuter l’escalade pendant des vacances à Briançon ?', answer: 'Oui. Décris ton groupe, les âges des participants et le temps dont vous disposez. Le moniteur pourra discuter avec toi d’une séance en falaise et préciser le matériel fourni ainsi que les modalités du rendez-vous.' },
      { question: 'Faut-il déjà être autonome pour découvrir une grande voie à Ailefroide ?', answer: 'Parle de ton expérience actuelle, même si elle se limite à la salle ou à la moulinette. Le moniteur définit avec toi les prérequis et un objectif adapté. Une découverte accompagnée et un stage vers l’autonomie répondent à des envies différentes.' },
      { question: 'Comment choisir entre une sortie dans le Briançonnais et à Orpierre ?', answer: 'Prends en compte ton lieu de séjour, ton niveau et le temps consacré aux déplacements. Le choix du secteur se précise avec le moniteur selon les conditions et le projet ; tu peux commencer par lui partager une envie plutôt qu’un itinéraire déjà fixé.' },
    ],
    contactTitle: 'Ton projet dans les Hautes-Alpes commence par un échange.',
    contactIntro: 'Une envie de rocher, tes dates à Briançon ou en vallée, et ton expérience : partage-les avec un moniteur.',
    relatedCodes: ['38', '04', '26', '73'],
  },
  {
    code: '38',
    seoTitle: 'Escalade en Isère : Grenoble, Vercors, stages & moniteurs',
    seoDescription: 'Sors grimper autour de Grenoble avec les moniteurs d’Isère : initiation en falaise, progression et grande voie dans le Vercors ou vers l’Oisans.',
    hero: {
      eyebrow: 'Grenoble, Vercors et Oisans',
      title: 'Escalade en Isère',
      intro: 'Tu grimpes en salle à Grenoble et tu as envie de passer au rocher ? Une séance en falaise, une journée dans le Vercors ou un objectif en grande voie : rencontre les moniteurs qui peuvent t’accompagner dehors.',
      image: '/images/falaise-Presles.jpg',
    },
    order: ['projects', 'guides', 'stages', 'map', 'areas'],
    guideTitle: 'Depuis Grenoble, trouve le moniteur qui correspond à ton projet',
    guideIntro: 'Après le travail, le week-end ou pendant un séjour en Isère, tu n’as pas forcément les mêmes envies ni le même temps disponible. Échange avec un moniteur pour construire une sortie adaptée à ton rythme et à ta pratique.',
    projectsTitle: 'De la salle au rocher, puis d’une longueur à plusieurs',
    projects: [
      { eyebrow: 'Ton premier passage dehors', title: 'Prendre tes marques en falaise', description: 'Les prises, les placements et l’environnement changent tes habitudes de salle. Prépare une séance pour apprivoiser le rocher et identifier ce que tu veux travailler.', cta: 'Organiser ta séance' },
      { eyebrow: 'Un objectif précis', title: 'Progresser en tête', description: 'Mieux lire une voie, gagner en confiance ou améliorer ton efficacité : un accompagnement personnalisé part de tes difficultés et de tes envies de progression.', cta: 'Échanger sur ton cap' },
      { eyebrow: 'Un week-end vertical', title: 'Construire une grande voie', description: 'Les parois du Vercors te donnent envie de grimper plus longtemps ? Décris ton expérience en cordée pour choisir une découverte ou un programme vers l’autonomie.', cta: 'Imaginer ta cordée' },
    ],
    stagesTitle: 'Progresser en groupe, en Isère et à proximité',
    stagesIntro: 'Tu préfères un programme défini et un objectif commun ? Retrouve les prochaines dates des stages qui se déroulent en Isère ou près de sa frontière, et prépare ta prochaine journée dehors.',
    areasTitle: 'Où grimper depuis Grenoble ?',
    areasIntro: 'Une sortie près de l’agglomération et une journée sur une paroi du Vercors demandent une organisation différente. Le temps disponible compte autant que l’envie de prendre de la hauteur.',
    areas: [
      { eyebrow: 'Grenoble et Saint-Égrève', title: 'Les falaises de Saint-Égrève, proches de Grenoble', description: 'Rochepleine et les jardins du Rif Tronchard font partie des sites d’escalade de Saint-Égrève. Plusieurs secteurs permettent de préparer une séance depuis l’agglomération, avec un choix de voies à discuter selon ton niveau.', tip: 'Indique tes horaires et tes possibilités de déplacement au premier échange.' },
      { eyebrow: 'Vercors et Presles', title: 'Une autre dimension sur les parois du Vercors', description: 'Les falaises de Presles sont un repère pour les voies de plusieurs longueurs. Si tu séjournes vers Villard-de-Lans ou Lans-en-Vercors, partage ton point de départ et ton expérience pour construire le projet avec ton moniteur.', tip: 'Pour une grande voie, parle de l’approche et de ton expérience au relais.' },
      { eyebrow: 'Le Bourg-d’Oisans et les vallées', title: 'Vers l’Oisans, prévoir une vraie journée dehors', description: 'Depuis Le Bourg-d’Oisans, un séjour dans les vallées peut aussi devenir l’occasion d’un projet d’escalade. Définis avec le moniteur un secteur d’intervention et une sortie qui tiennent compte des déplacements et des conditions en montagne.', tip: 'Précise où tu loges et la part de marche que tu souhaites dans ta journée.' },
    ],
    faqTitle: 'Passer de l’envie à une sortie autour de Grenoble',
    faqs: [
      { question: 'Je grimpe en salle à Grenoble : par quoi commencer dehors ?', answer: 'Explique ce que tu pratiques déjà, en bloc, en moulinette ou en tête. Une séance en falaise peut servir à travailler la lecture du rocher, les placements et les manips nécessaires à ton objectif. Le programme se construit avec le moniteur.' },
      { question: 'Peut-on préparer une séance sans consacrer tout le week-end à l’escalade ?', answer: 'Partage tes créneaux et ton point de départ. Le moniteur pourra discuter d’un format compatible avec ton temps disponible. Les possibilités dépendent du secteur choisi, de ses disponibilités et des conditions du jour.' },
      { question: 'Quel niveau faut-il pour une première grande voie à Presles ?', answer: 'Il n’y a pas un seul niveau pour toutes les voies. Décris ton expérience en escalade et en cordée, puis échange sur un itinéraire et des prérequis précis. Le temps de marche, la durée de la voie et l’objectif de la sortie entrent aussi dans le choix.' },
    ],
    contactTitle: 'Ta prochaine sortie dehors se prépare ici.',
    contactIntro: 'Parle de tes envies de falaise ou de grande voie avec un moniteur autour de Grenoble.',
    relatedCodes: ['26', '05', '73', '74'],
  },
  {
    code: '30',
    seoTitle: 'Escalade dans le Gard : Alès, Cévennes & moniteurs locaux',
    seoDescription: 'Découvre l’escalade dans le Gard avec les moniteurs locaux : sorties privées depuis Alès, Anduze ou Nîmes, falaises de Seynes et gorges du Gardon.',
    hero: {
      eyebrow: 'Alès, Anduze et gorges du Gardon',
      title: 'Escalade dans le Gard',
      intro: 'Une activité à partager pendant tes vacances dans les Cévennes ou une nouvelle envie de falaise près de chez toi ? Depuis Alès, Anduze ou Nîmes, prépare une sortie avec un moniteur qui connaît le rocher gardois.',
    },
    order: ['projects', 'guides', 'stages', 'map', 'areas'],
    guideTitle: 'Un moniteur pour ta journée entre Cévennes et garrigue',
    guideIntro: 'Une initiation en famille, une sortie entre amis ou une séance pour progresser : pars de ce qui vous donne envie. Le moniteur t’aide à choisir un lieu et un format cohérents avec ton groupe.',
    projectsTitle: 'Une sortie qui trouve sa place dans ton séjour',
    projects: [
      { eyebrow: 'Un premier souvenir de rocher', title: 'Grimper en famille', description: 'Tu séjournes autour d’Anduze ou de Saint-Jean-du-Gard ? Indique les âges et les envies de chacun pour préparer une découverte de la falaise à votre rythme.', cta: 'Préparer votre initiation' },
      { eyebrow: 'Une journée entre amis', title: 'Changer d’air ensemble', description: 'Une sortie privée permet de construire un moment commun autour de l’escalade, même lorsque les expériences sont différentes. Partage la composition de ton groupe au moniteur.', cta: 'Imaginer votre journée' },
      { eyebrow: 'Ton prochain cap', title: 'Travailler sur le calcaire', description: 'Tu souhaites mieux lire les voies ou progresser en tête ? Décris tes habitudes de grimpe et ton objectif pour préparer une séance ciblée dans le Gard.', cta: 'Parler de ta progression' },
    ],
    stagesTitle: 'Les stages à venir dans le Gard et à proximité',
    stagesIntro: 'Un rendez-vous sur le rocher pendant tes vacances ou pour faire progresser ta pratique ? Consulte les stages organisés dans le Gard et près de ses frontières pour trouver le programme qui te correspond.',
    areasTitle: 'Du pied des Cévennes aux falaises du Gardon',
    areasIntro: 'Alès, Anduze et Nîmes sont des points de départ différents pour aller grimper. Précise où tu séjournes, puis laisse le choix du secteur se construire avec ton moniteur.',
    areas: [
      { eyebrow: 'Alès et Seynes', title: 'Seynes : un repère de falaise près d’Alès', description: 'Les falaises de Seynes, au pied du mont Bouquet, font partie des destinations de grimpe du Gard. Une séance s’y prépare selon le style de voies recherché, ton expérience et les conditions au moment de la sortie.', tip: 'Partage les types de voies que tu pratiques déjà et ce que tu veux améliorer.' },
      { eyebrow: 'Nîmes, Uzès et Collias', title: 'Les gorges du Gardon, au-delà de la promenade', description: 'Entre les environs de Nîmes et d’Uzès, les falaises des gorges du Gardon ouvrent d’autres possibilités de sortie. Collias est l’un des points de repère du secteur pour les activités de grimpe accompagnées.', tip: 'Indique ton lieu de séjour et le temps que tu veux consacrer à l’activité.' },
      { eyebrow: 'Anduze et Saint-Jean-du-Gard', title: 'Un séjour dans les Cévennes, une envie de découvrir le rocher', description: 'Depuis Anduze ou Saint-Jean-du-Gard, l’escalade peut prendre sa place parmi les activités de tes vacances. Décris ton groupe et ta mobilité pour trouver avec le moniteur une falaise et un rendez-vous adaptés.', tip: 'Le point de départ aide à construire la journée ; le secteur se confirme ensemble.' },
    ],
    faqTitle: 'Organiser une sortie d’escalade dans le Gard',
    faqs: [
      { question: 'Peut-on découvrir l’escalade en famille près d’Anduze ?', answer: 'Une séance découverte se prépare avec les âges des participants, leurs envies et leur expérience. Échange avec le moniteur sur la marche d’approche, le matériel fourni et les conditions d’accueil des enfants avant de choisir le format.' },
      { question: 'Comment choisir une falaise entre Alès et les gorges du Gardon ?', answer: 'Commence par ton lieu de séjour, ton niveau et la durée de sortie souhaitée. Le moniteur peut ensuite discuter des secteurs qui correspondent au projet et aux conditions. Tu n’as pas besoin d’avoir déjà choisi une voie pour le contacter.' },
      { question: 'Que prévoir pour une journée de grimpe pendant un séjour dans les Cévennes ?', answer: 'Demande au moniteur la liste du matériel personnel, les modalités du rendez-vous et l’organisation de la journée. Indique aussi les contraintes de ton groupe : horaires, mobilité ou expérience différente entre les participants.' },
    ],
    contactTitle: 'Une envie de grimper dans le Gard ? Donnons-lui une date.',
    contactIntro: 'Contacte un moniteur avec ton point de départ, les envies de ton groupe et quelques disponibilités.',
    relatedCodes: ['34', '48', '07'],
  },
  {
    code: '34',
    seoTitle: 'Escalade dans l’Hérault : Montpellier, Caroux & moniteurs',
    seoDescription: 'Trouve un moniteur pour grimper dans l’Hérault : sorties autour de Montpellier, découverte du Thaurac et projets d’escalade traditionnelle dans le Caroux.',
    hero: {
      eyebrow: 'Montpellier, Thaurac et Caroux',
      title: 'Escalade dans l’Hérault',
      intro: 'Du calcaire du Thaurac aux reliefs du Caroux, l’Hérault donne envie de changer de terrain. Prépare une sortie depuis Montpellier, une journée de falaise pendant tes vacances ou un projet en escalade traditionnelle avec un moniteur.',
    },
    order: ['guides', 'projects', 'stages', 'map', 'areas'],
    guideTitle: 'Ton projet de grimpe, de Montpellier au Haut-Languedoc',
    guideIntro: 'Une première expérience dehors ou un objectif plus technique ? Rencontre les moniteurs qui encadrent dans l’Hérault et partage ton envie de rocher, ton expérience et tes dates.',
    projectsTitle: 'Plusieurs terrains, plusieurs façons d’apprendre',
    projects: [
      { eyebrow: 'Depuis Montpellier', title: 'S’offrir une séance dehors', description: 'Une sortie en falaise peut devenir une parenthèse pendant le week-end ou les vacances. Précise ton point de départ et ton niveau pour trouver le format adapté.', cta: 'Organiser ta parenthèse' },
      { eyebrow: 'Sur le calcaire', title: 'Gagner en aisance en falaise', description: 'Au Thaurac ou sur un autre secteur choisi avec ton moniteur, travaille la lecture des prises, les placements et la progression en tête selon ton objectif.', cta: 'Construire ta séance' },
      { eyebrow: 'Un autre rapport au rocher', title: 'Découvrir l’escalade traditionnelle', description: 'Le Caroux te donne envie de découvrir le terrain d’aventure ? Échange sur tes habitudes en cordée et sur les techniques que tu souhaites apprendre, puis définis un projet accompagné.', cta: 'Parler de ton projet dans le Caroux' },
    ],
    stagesTitle: 'Du temps pour apprendre dans l’Hérault et à proximité',
    stagesIntro: 'Du Caroux aux falaises du département, découvre les stages qui se déroulent dans l’Hérault ou près de ses frontières. Compare les objectifs, les prérequis et les dates pour choisir ton aventure.',
    areasTitle: 'Montpellier, gorges de l’Hérault ou Caroux : où partir ?',
    areasIntro: 'Une journée de calcaire et un projet sur les reliefs du Haut-Languedoc ne se préparent pas de la même façon. Le lieu, la marche et le style d’escalade font partie du premier échange.',
    areas: [
      { eyebrow: 'Montpellier et nord du département', title: 'Escalade autour de Montpellier : passer de l’envie à la falaise', description: 'Depuis Montpellier, les reliefs au nord de la ville ouvrent la porte à une journée de grimpe. Ton moniteur peut discuter avec toi d’un secteur et d’un rendez-vous selon ta mobilité, ton niveau et le temps disponible.', tip: 'Donne ton point de départ plutôt qu’une estimation du temps de route.' },
      { eyebrow: 'Ganges et Saint-Bauzille-de-Putois', title: 'Le Thaurac, aux portes des Cévennes', description: 'Le plateau du Thaurac est un repère d’escalade dans la vallée de l’Hérault, autour de Ganges et de Saint-Bauzille-de-Putois. Le choix du secteur se précise selon l’expérience du groupe et les conditions du jour.', tip: 'Une séance de découverte et une journée de progression peuvent avoir des objectifs très différents.' },
      { eyebrow: 'Mons-la-Trivalle et Haut-Languedoc', title: 'Le Caroux : construire une aventure en cordée', description: 'Autour du Caroux et des gorges d’Héric, l’escalade prend plusieurs formes, des sites école aux itinéraires de terrain d’aventure. Pour un projet sur plusieurs longueurs, parle aussi de ta marche d’approche et de ton expérience avec les protections.', tip: 'Précise si tu souhaites découvrir ce terrain ou travailler les techniques de l’escalade traditionnelle.' },
    ],
    faqTitle: 'Choisir ta prochaine expérience dans l’Hérault',
    faqs: [
      { question: 'Comment organiser une sortie d’escalade au départ de Montpellier ?', answer: 'Partage ton quartier ou ton lieu de séjour, tes possibilités de déplacement et tes disponibilités. Le moniteur pourra discuter d’un secteur et d’un rendez-vous compatibles avec ton projet. Les modalités de transport se confirment avant la sortie.' },
      { question: 'Le Thaurac convient-il pour découvrir la falaise ?', answer: 'Une séance découverte se construit avec le choix d’un secteur et de voies adaptés. Indique l’expérience et les âges des participants ; le moniteur précisera les possibilités, l’approche et le matériel nécessaire à votre sortie.' },
      { question: 'Que faut-il savoir avant un stage d’escalade traditionnelle dans le Caroux ?', answer: 'Consulte les prérequis du programme, puis décris ton expérience en tête et sur plusieurs longueurs. Le moniteur peut préciser ce qui sera travaillé sur les protections, l’itinéraire et l’organisation de la cordée. Une envie de découverte se discute aussi avant de réserver.' },
    ],
    contactTitle: 'Calcaire ou terrain d’aventure : préparons ta sortie.',
    contactIntro: 'Raconte ton envie de grimpe à un moniteur de l’Hérault et choisissez ensemble la prochaine étape.',
    relatedCodes: ['30', '48'],
  },
  {
    code: '48',
    seoTitle: 'Escalade en Lozère : Cévennes, Tarn & moniteurs locaux',
    seoDescription: 'Prépare ton escalade en Lozère avec les moniteurs locaux : sorties depuis Florac, falaises des gorges du Tarn, grande voie dans la Jonte et séjour en Cévennes.',
    hero: {
      eyebrow: 'Florac, gorges du Tarn et de la Jonte',
      title: 'Escalade en Lozère',
      intro: 'Une falaise au-dessus du Tarn, une cordée dans les gorges de la Jonte ou une première découverte pendant ton séjour en Cévennes ? Prends le temps de grimper en Lozère avec un moniteur et un projet qui te ressemble.',
    },
    order: ['guides', 'areas', 'stages', 'map', 'projects'],
    guideTitle: 'Un moniteur pour explorer le rocher lozérien',
    guideIntro: 'Tu séjournes à Florac, près de Sainte-Enimie ou autour de Meyrueis ? Partage ton lieu de séjour et tes envies de grimpe. Le moniteur t’aide à construire une journée qui s’accorde avec ton niveau et tes vacances.',
    projectsTitle: 'Découvrir les gorges, progresser sur le rocher',
    projects: [
      { eyebrow: 'Une première sortie', title: 'Goûter à la falaise en vacances', description: 'Une séance accompagnée peut prendre sa place au milieu des randonnées et des journées au bord de l’eau. Décris ton groupe pour préparer une découverte à son rythme.', cta: 'Préparer ta découverte' },
      { eyebrow: 'Ton projet de progression', title: 'Se donner du temps dans le Tarn', description: 'Tu souhaites mieux lire le calcaire ou travailler ton aisance en tête ? Une journée ciblée commence par ton expérience récente et un objectif précis.', cta: 'Échanger sur ton objectif' },
      { eyebrow: 'Une journée en cordée', title: 'Imaginer plusieurs longueurs dans la Jonte', description: 'Les parois de la Jonte te donnent envie de prendre de la hauteur ? Parle de ton expérience en grande voie et de la place que tu veux donner à l’approche dans l’aventure.', cta: 'Construire ta cordée' },
    ],
    stagesTitle: 'Les prochaines dates pour grimper en Lozère et à proximité',
    stagesIntro: 'Envie d’apprendre et de progresser en groupe dans les Cévennes ou les gorges ? Retrouve les stages organisés en Lozère et près de ses frontières pour construire ton séjour autour d’un projet de grimpe.',
    areasTitle: 'Les gorges et les villes qui donnent le départ',
    areasIntro: 'La Lozère offre plusieurs paysages de grimpe. Florac, Sainte-Enimie, Meyrueis et Villefort sont des points de repère pour parler de ton séjour ; le secteur se choisit ensuite avec le moniteur.',
    areas: [
      { eyebrow: 'Sainte-Enimie, La Malène et Les Vignes', title: 'Les gorges du Tarn : un projet de falaise dans un grand paysage', description: 'Les falaises calcaires des gorges du Tarn font partie des destinations de grimpe de Lozère. Depuis Sainte-Enimie, La Malène ou Les Vignes, prépare une séance ou une journée selon ton expérience et le style de voies que tu recherches.', tip: 'Décris les voies que tu pratiques aujourd’hui et ce que tu aimerais découvrir.' },
      { eyebrow: 'Le Rozier et Meyrueis', title: 'Les gorges de la Jonte : donner une dimension verticale au séjour', description: 'Les tours calcaires de la Jonte sont un repère pour les itinéraires de plusieurs longueurs. Pour une journée en cordée depuis Le Rozier ou Meyrueis, l’approche, la durée et les techniques à travailler se discutent ensemble.', tip: 'Indique ton expérience au relais et ton envie de découverte ou d’apprentissage.' },
      { eyebrow: 'Florac et Cévennes', title: 'Depuis Florac, choisir une sortie qui trouve sa place dans tes vacances', description: 'Un séjour autour de Florac permet de construire un projet entre Cévennes et grands paysages de gorges. Explique où tu loges et ce que tu souhaites vivre ; le moniteur précisera les secteurs où il peut t’accompagner.', tip: 'Ton lieu de séjour et ta mobilité aident à organiser une journée réaliste.' },
      { eyebrow: 'Villefort et La Garde-Guérin', title: 'Le haut Chassezac : une autre roche, un autre cadre', description: 'Près de Villefort et de La Garde-Guérin, les gorges du haut Chassezac offrent un paysage de falaises granitiques. L’approche et le caractère du terrain entrent dans le choix d’une sortie, autant que ton expérience en escalade.', tip: 'Parle de tes habitudes de marche en plus de ton niveau de grimpe.' },
    ],
    faqTitle: 'Préparer une aventure dans les gorges de Lozère',
    faqs: [
      { question: 'Comment choisir entre une sortie dans le Tarn et dans la Jonte ?', answer: 'Commence par ton expérience et par l’envie d’une séance en falaise ou d’une journée sur plusieurs longueurs. Ton lieu de séjour et le temps disponible aideront le moniteur à discuter d’un secteur et d’un format adaptés.' },
      { question: 'Peut-on découvrir l’escalade pendant un séjour à Florac ?', answer: 'Oui, un projet découverte peut se préparer avec un moniteur qui intervient dans le secteur. Indique les âges, l’expérience du groupe et ta mobilité. Le lieu, le rendez-vous et les disponibilités se précisent lors du premier échange.' },
      { question: 'Faut-il avoir déjà fait de la grande voie pour partir dans la Jonte ?', answer: 'Décris ta pratique actuelle et tes premières expériences en cordée, même si elles sont limitées. Le moniteur définira avec toi les prérequis et un itinéraire cohérent. L’approche et la durée de la journée doivent aussi correspondre à tes attentes.' },
    ],
    contactTitle: 'Le paysage donne envie. Le moniteur t’aide à construire la journée.',
    contactIntro: 'Partage tes dates en Lozère, ton point de départ et le projet que tu aimerais vivre sur le rocher.',
    relatedCodes: ['30', '07', '34'],
  },
  {
    code: '07',
    seoTitle: 'Escalade en Ardèche : Vallon, Les Vans & moniteurs locaux',
    seoDescription: 'Organise une sortie d’escalade en Ardèche avec les moniteurs locaux : découverte près de Vallon-Pont-d’Arc, falaises du Chassezac et projets depuis Les Vans.',
    hero: {
      eyebrow: 'Vallon-Pont-d’Arc, Les Vans et Chassezac',
      title: 'Escalade en Ardèche',
      intro: 'Tu connais l’Ardèche depuis la rivière ? Découvre-la aussi depuis le rocher. Une sortie près de Vallon-Pont-d’Arc, une journée dans le Chassezac ou une séance de progression : prépare ton aventure avec un moniteur.',
      image: '/images/falaise-Ardèche.jpg',
    },
    order: ['projects', 'guides', 'areas', 'stages', 'map'],
    guideTitle: 'Ton moniteur, entre gorges de l’Ardèche et Cévennes ardéchoises',
    guideIntro: 'Un moment en famille, une journée sportive ou un premier pas en falaise : échange sur ce que tu souhaites vivre. Les moniteurs qui interviennent en Ardèche t’aident à choisir le format et le terrain.',
    projectsTitle: 'Prendre de la hauteur pendant ton séjour',
    projects: [
      { eyebrow: 'Une activité à partager', title: 'Découvrir le rocher en famille', description: 'Pendant tes vacances autour de Vallon-Pont-d’Arc ou des Vans, imagine une séance adaptée aux âges et aux envies de ton groupe.', cta: 'Préparer votre découverte' },
      { eyebrow: 'Une pause dans les vacances', title: 'S’offrir une journée de grimpe', description: 'Depuis ton lieu de séjour, prépare une sortie privée avec un rythme et un objectif choisis ensemble. Le secteur se définit avec le moniteur.', cta: 'Organiser ta journée' },
      { eyebrow: 'Le plaisir de progresser', title: 'Travailler ta pratique en falaise', description: 'Lecture des prises, placements ou confiance en tête : précise tes besoins pour construire une séance qui apporte quelque chose à ta grimpe.', cta: 'Partager ton objectif' },
    ],
    stagesTitle: 'Les prochains stages en Ardèche et à proximité',
    stagesIntro: 'Donne une place à la grimpe dans ton séjour : découvre les stages qui se déroulent en Ardèche ou près de sa frontière. Choisis un programme selon ton expérience, tes envies et les dates de tes vacances.',
    areasTitle: 'Les Vans, Vallon ou Aubenas : prépare ton point de départ',
    areasIntro: 'Les vallées du sud de l’Ardèche offrent plusieurs cadres pour grimper. Une sortie réussie se construit avec ton lieu de séjour, ton expérience et le temps que tu souhaites passer dehors.',
    areas: [
      { eyebrow: 'Vallon-Pont-d’Arc et gorges de l’Ardèche', title: 'Une sortie d’escalade autour de Vallon-Pont-d’Arc', description: 'Depuis Vallon-Pont-d’Arc, les paysages de gorges invitent à découvrir une autre facette de tes vacances. Indique ton expérience et les envies de ton groupe pour discuter d’une falaise et d’un rendez-vous avec le moniteur.', tip: 'Partage tes autres activités de la journée pour choisir un créneau adapté.' },
      { eyebrow: 'Les Vans et Berrias-et-Casteljau', title: 'Le Chassezac : grimper dans les Cévennes ardéchoises', description: 'Les gorges du Chassezac, autour de Berrias-et-Casteljau, sont un repère d’escalade près des Vans. Le cadre de falaises et de rivière se découvre avec des secteurs choisis selon le niveau du groupe et les conditions.', tip: 'La marche d’approche et la durée de séance se précisent avant de réserver.' },
      { eyebrow: 'Aubenas, Ruoms et vallée de l’Ardèche', title: 'Depuis ton hébergement, construire une vraie journée dehors', description: 'Tu séjournes vers Aubenas ou Ruoms ? Donne ton point de départ au moniteur pour préparer les déplacements et choisir une sortie qui correspond à ton temps disponible. Le lieu de rendez-vous se confirme lors de l’échange.', tip: 'Une ville de départ ne fixe pas la falaise : construisez le secteur ensemble.' },
    ],
    faqTitle: 'Organiser ta journée de grimpe en Ardèche',
    faqs: [
      { question: 'Peut-on essayer l’escalade près de Vallon-Pont-d’Arc sans expérience ?', answer: 'Décris ton groupe et ton envie de découverte à un moniteur. Il pourra préciser les formats envisageables, le matériel fourni et les modalités de rendez-vous. Une première séance se prépare selon les âges, le rythme du groupe et le secteur choisi.' },
      { question: 'Comment préparer une sortie dans le Chassezac depuis Les Vans ?', answer: 'Indique ton lieu de séjour, tes disponibilités et ta pratique actuelle. Le moniteur pourra discuter du secteur, de l’approche et de la durée de sortie. Le rendez-vous et les modalités de déplacement se confirment avant de partir.' },
      { question: 'Une sortie privée peut-elle accueillir des niveaux différents ?', answer: 'Parle de l’expérience de chaque participant dès le premier échange. Le moniteur peut discuter d’un objectif commun et de la façon d’adapter la séance au groupe. Les possibilités dépendent des participants, du terrain et du format choisi.' },
    ],
    contactTitle: 'Une journée sur le rocher, une autre façon de vivre l’Ardèche.',
    contactIntro: 'Échange avec un moniteur pour préparer une sortie depuis ton lieu de séjour et selon tes envies.',
    relatedCodes: ['26', '48', '30'],
  },
  ...additionalDepartmentLandings,
]

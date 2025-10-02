export type Event = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string[];
  date: string;
  formattedDate: string;
  image: string;
  location: string;
  tags: string[];
};

export const events: Event[] = [
  {
    slug: 'taller-derechos-humanos-migrantes',
    title: 'Taller de derechos humanos para mujeres en movilidad',
    shortDescription: 'Sesión práctica para fortalecer el liderazgo y la defensa de los derechos de mujeres migrantes.',
    description: [
      'Exploraremos herramientas legales y comunitarias que permiten acompañar a mujeres en movilidad humana.',
      'El taller incluye espacios de diálogo seguro, estudio de casos y la construcción de rutas de derivación con organizaciones aliadas.',
      'Al finalizar, las participantes recibirán una guía descargable con materiales pedagógicos y contactos clave.'
    ],
    date: '2025-05-18',
    formattedDate: '18 de mayo de 2025',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/13.jpg',
    location: 'Casa de la Cultura Ecuatoriana, Quito',
    tags: ['formación', 'derechos humanos']
  },
  {
    slug: 'foro-investigacion-social-andina',
    title: 'Foro de investigación social andina',
    shortDescription: 'Un encuentro con especialistas para debatir desafíos y oportunidades de las comunidades afroandinas.',
    description: [
      'Presentaremos hallazgos de investigaciones recientes sobre movilidad humana, justicia económica y memoria afro.',
      'La jornada combina paneles académicos con laboratorios de co-creación para diseñar recomendaciones de políticas públicas.',
      'El foro culmina con un compromiso colectivo para impulsar proyectos colaborativos de investigación-acción.'
    ],
    date: '2025-10-02',
    formattedDate: '2 de octubre de 2025',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/14.jpg',
    location: 'Universidad Andina Simón Bolívar, Quito',
    tags: ['investigación', 'política pública']
  },
  {
    slug: 'festival-cultural-afrodescendiente',
    title: 'Festival cultural afrodescendiente',
    shortDescription: 'Celebramos la herencia afroecuatoriana a través de música, gastronomía y emprendimientos comunitarios.',
    description: [
      'Durante tres días, artistas y sabedoras comparten tradiciones orales, danza y saberes culinarios de distintas provincias.',
      'Habrá una feria de emprendimientos que impulsa economías locales lideradas por mujeres afro.',
      'El festival es un espacio para fortalecer el orgullo y la memoria colectiva desde una mirada intergeneracional.'
    ],
    date: '2025-12-12',
    formattedDate: '12 de diciembre de 2025',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/15.jpeg',
    location: 'Malecón 2000, Guayaquil',
    tags: ['cultura', 'comunidad']
  },
  {
    slug: 'conferencia-identidad-cultural',
    title: 'Conferencia sobre identidad cultural afroecuatoriana',
    shortDescription: 'Diálogos intergeneracionales acerca de identidad, memoria y territorio afrodescendiente.',
    description: [
      'Líderes comunitarios, académicas y artistas comparten aprendizajes para fortalecer la identidad afrodescendiente en la región.',
      'Incluye un círculo de palabra y la presentación de la cartografía colaborativa “Territorios en movimiento”.',
      'Se generará un manifiesto con compromisos para integrar la perspectiva afro en agendas locales.'
    ],
    date: '2026-01-20',
    formattedDate: '20 de enero de 2026',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/16.jpg',
    location: 'Centro Cultural Metropolitano, Quito',
    tags: ['identidad', 'memoria']
  },
  {
    slug: 'curso-liderazgo-comunitario',
    title: 'Curso intensivo de liderazgo comunitario',
    shortDescription: 'Formación para jóvenes que desean impulsar redes de cuidado y proyectos de incidencia.',
    description: [
      'El programa combina módulos de gestión comunitaria, comunicación estratégica y cuidado colectivo.',
      'Las y los participantes diseñarán un plan de acción acompañado por mentoras de Funteco.',
      'Incluye seguimiento virtual y acceso a la red de voluntariado para implementar iniciativas territoriales.'
    ],
    date: '2026-03-15',
    formattedDate: '15 de marzo de 2026',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/courses-1.jpg',
    location: 'Centro de Innovación Social, Esmeraldas',
    tags: ['liderazgo', 'juventudes']
  },
  {
    slug: 'seminario-derechos-mujeres',
    title: 'Seminario de derechos de las mujeres afrodescendientes',
    shortDescription: 'Sesiones educativas sobre marcos legales, prevención de violencia y cuidado colectivo.',
    description: [
      'Especialistas en género y justicia racial analizan rutas de atención y políticas de protección.',
      'Se desarrollarán clínicas jurídicas y espacios de sanación liderados por terapeutas comunitarias.',
      'Las conclusiones serán compartidas en un informe abierto para fortalecer la incidencia en territorio.'
    ],
    date: '2026-05-08',
    formattedDate: '8 de mayo de 2026',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/12.jpg',
    location: 'Centro Cultural de Ibarra, Ibarra',
    tags: ['género', 'justicia racial']
  },
  {
    slug: 'feria-emprendimientos-afro',
    title: 'Feria de emprendimientos afro',
    shortDescription: 'Exhibición de productos y servicios creados por mujeres afrodescendientes.',
    description: [
      'La feria conecta emprendimientos con redes de comercialización éticas y responsables.',
      'Incluye rondas de negocios, mentorías colectivas y espacios de networking con empresas aliadas.',
      'Finalizaremos con un desfile de moda ancestral y una presentación gastronómica colaborativa.'
    ],
    date: '2026-07-24',
    formattedDate: '24 de julio de 2026',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/14.jpg',
    location: 'Parque La Carolina, Quito',
    tags: ['emprendimiento', 'economía solidaria']
  },
  {
    slug: 'festival-musica-afro',
    title: 'Festival de música afro contemporánea',
    shortDescription: 'Escenario para artistas que fusionan ritmos afrolatinos, electrónicos y spoken word.',
    description: [
      'El festival se enfoca en artistas emergentes que narran historias de migración y resistencia.',
      'Habrá laboratorios sonoros para niñas, niños y adolescentes, además de conversatorios con productoras independientes.',
      'Cerramos con un concierto colectivo que celebra la creatividad afro en movimiento.'
    ],
    date: '2026-11-19',
    formattedDate: '19 de noviembre de 2026',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/15.jpeg',
    location: 'Teatro Sánchez Aguilar, Samborondón',
    tags: ['música', 'juventudes']
  }
];

export const getEventBySlug = (slug: string) => events.find((event) => event.slug === slug);

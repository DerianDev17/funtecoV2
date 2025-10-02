export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  focus: string;
  image: string;
  layout: string;
};

export const teamMembers: TeamMember[] = [
  {
    name: 'María Fernanda Simbaña',
    role: 'Directora ejecutiva',
    bio: 'Socióloga afroecuatoriana con 12 años impulsando políticas públicas y laboratorios de innovación social en territorios rurales y urbanos.',
    focus: 'Diseña estrategias de incidencia y alianzas feministas que sostienen la red Funteco.',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/16.jpg',
    layout: 'md:col-span-3 md:row-span-2'
  },
  {
    name: 'Gabriela Hurtado',
    role: 'Coordinadora de investigación comunitaria',
    bio: 'Periodista y maestra en derechos humanos. Lidera procesos participativos para mapear memorias afro y narrativas de movilidad.',
    focus: 'Guía metodologías colaborativas y cuida el archivo vivo de las comunidades aliadas.',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/13.jpg',
    layout: 'md:col-span-3'
  },
  {
    name: 'Yessenia Flores',
    role: 'Mentora de liderazgo juvenil',
    bio: 'Facilitadora intercultural que acompaña a jóvenes afrodescendientes en procesos de liderazgo, economía solidaria y autocuidado.',
    focus: 'Coordina círculos de escucha, residencias creativas y acompañamiento psicosocial.',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/15.jpeg',
    layout: 'md:col-span-3 md:row-span-2'
  },
  {
    name: 'Red de voluntarias tejedoras',
    role: 'Equipos territoriales',
    bio: 'Más de 40 mujeres sostienen talleres, campañas de sensibilización y ferias comunitarias desde Esmeraldas hasta Loja.',
    focus: 'Fortalecen la economía del cuidado y activan respuestas rápidas ante emergencias.',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/14.jpg',
    layout: 'md:col-span-3'
  }
];

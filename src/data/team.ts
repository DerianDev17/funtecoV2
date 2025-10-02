export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'web';

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  url: string;
};

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  shortBio: string;
  bio: string;
  focus: string;
  socials: SocialLink[];
};

export const teamMembers: TeamMember[] = [
  {
    name: 'Nieves Méndez Olaya',
    role: 'Socia fundadora',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/funtecoNieves.png',
    shortBio:
      'Trabajadora social con dos décadas de acompañamiento a familias afrocolombianas y ecuatorianas en procesos de cuidado comunitario.',
    bio: 'Nieves lidera procesos de acompañamiento psicosocial y formación en derechos para mujeres migrantes afro. Ha facilitado redes de apoyo comunitario en Esmeraldas, Quito y la frontera norte, sosteniendo espacios de escucha y sanación colectiva.',
    focus: 'Teje metodologías de cuidado y sanación colectiva.',
    socials: [
      {
        platform: 'facebook',
        label: 'Facebook de Nieves Méndez Olaya',
        url: 'https://www.facebook.com/'
      },
      {
        platform: 'instagram',
        label: 'Instagram de Nieves Méndez Olaya',
        url: 'https://www.instagram.com/'
      }
    ]
  },
  {
    name: 'Diana Angulo Balanta',
    role: 'Socia fundadora',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/funtecoDiana.png',
    shortBio:
      'Comunicadora y gestora cultural afrocolombiana. Impulsa procesos de memoria y narrativas audiovisuales con juventudes afro.',
    bio: 'Diana dinamiza talleres de comunicación popular y proyectos audiovisuales que rescatan historias afro en Ecuador y Colombia. Coordina alianzas con festivales comunitarios y acompaña a liderazgos juveniles en el uso estratégico de medios digitales.',
    focus: 'Potencia la comunicación comunitaria y la memoria audiovisual afro.',
    socials: [
      {
        platform: 'instagram',
        label: 'Instagram de Diana Angulo Balanta',
        url: 'https://www.instagram.com/'
      },
      {
        platform: 'linkedin',
        label: 'LinkedIn de Diana Angulo Balanta',
        url: 'https://www.linkedin.com/'
      }
    ]
  },
  {
    name: 'Elizabeth Méndez Grueso',
    role: 'Socia fundadora',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/funtecoElizabeth.png',
    shortBio:
      'Economista popular que acompaña emprendimientos liderados por mujeres afro en Quito y Esmeraldas con enfoque solidario.',
    bio: 'Elizabeth articula procesos de economía feminista afro, fortaleciendo cooperativas, fondos solidarios y redes de comercialización justa. Diseña herramientas financieras accesibles y procesos de capacitación que priorizan el bienestar colectivo.',
    focus: 'Fortalece economías del cuidado y emprendimientos afro.',
    socials: [
      {
        platform: 'instagram',
        label: 'Instagram de Elizabeth Méndez Grueso',
        url: 'https://www.instagram.com/'
      },
      {
        platform: 'facebook',
        label: 'Facebook de Elizabeth Méndez Grueso',
        url: 'https://www.facebook.com/'
      }
    ]
  },
  {
    name: 'Francia Jenny Moreno',
    role: 'Coordinadora de proyectos',
    image: 'https://raw.githubusercontent.com/DerianDev17/Funteco/main/img/funtecoFrancia.png',
    shortBio:
      'Ingeniera en desarrollo local con experiencia en gestión de fondos y programas con enfoque interseccional en Ecuador.',
    bio: 'Francia coordina proyectos de justicia racial y movilidad humana, liderando equipos territoriales y procesos de evaluación participativa. Gestiona alianzas institucionales y garantiza que cada iniciativa centre el cuidado y la sostenibilidad.',
    focus: 'Gestiona proyectos con enfoque interseccional y territorial.',
    socials: [
      {
        platform: 'linkedin',
        label: 'LinkedIn de Francia Jenny Moreno',
        url: 'https://www.linkedin.com/'
      },
      {
        platform: 'web',
        label: 'Portafolio de Francia Jenny Moreno',
        url: 'https://example.com/'
      }
    ]
  }
];

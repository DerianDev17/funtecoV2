# Funteco – MVP con Astro

Este repositorio contiene una propuesta de **MVP (Minimum Viable Product)** para el sitio de la Fundación Tejiendo Conocimientos (**Funteco**), construido con [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/) y JavaScript. La versión actual prioriza la **etnoeducación como eje principal** del mensaje institucional y profundiza en los contenidos pedagógicos sin modificar la base visual del diseño.

## Características

- **Astro** como generador estático para obtener un sitio rápido y optimizado.
- **Tailwind CSS** integrado mediante el paquete `@astrojs/tailwind` para estilos utilitarios y responsive.
- **Diseño responsivo** preparado para dispositivos móviles y de escritorio.
- **SEO básico**: cada página define etiquetas `<title>` y `<meta name="description">` para mejorar la indexación.
- **HTML semántico** y accesible, con navegación clara y textos alternativos descriptivos para imágenes.
- **Etnoeducación como eje narrativo** de la página de inicio y el apartado “¿Qué hacemos?”, con secciones interactivas que explican la ruta pedagógica.
- **Pruebas básicas de diseño** escritas con [Vitest](https://vitest.dev/) y `jsdom` para verificar la existencia de componentes clave.

## Estructura del proyecto

```
funteco_astro/
├── astro.config.mjs        # Configuración de Astro y Tailwind
├── tailwind.config.cjs     # Personalización de Tailwind
├── postcss.config.cjs      # Configuración de PostCSS
├── package.json            # Dependencias y scripts
├── public/
│   └── images/              # Ilustraciones SVG locales usadas en todo el sitio
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro  # Plantilla base con título y metadatos
│   ├── components/
│   │   ├── Header.astro      # Menú de navegación responsivo
│   │   └── Footer.astro      # Pie de página con redes sociales
│   ├── pages/
│   │   ├── index.astro       # Página de inicio (etnoeducación, ruta interactiva, ejes, eventos, CTA)
│   │   ├── about.astro       # Misión y visión
│   │   ├── que-hacemos.astro # Programas, etnoeducación y líneas de acción
│   │   ├── eventos.astro     # Listado de eventos
│   │   └── contacto.astro    # Información de contacto y formulario
│   ├── data/
│   │   ├── eventsFallback.ts # Datos base para eventos
│   │   ├── team.json         # Perfiles del equipo
│   │   ├── team.ts           # Tipos y utilidades para el equipo
│   │   ├── whatWeDo.json     # Contenido editable para "¿Qué hacemos?"
│   │   └── whatWeDo.ts       # Tipos y fallback del contenido "¿Qué hacemos?"
│   └── tests/
│       ├── content.test.ts   # Pruebas del helper de contenido y copias seguras
│       └── design.test.js    # Pruebas básicas de diseño
└── README.md
```

## Requisitos

Para ejecutar este proyecto necesitas tener instalado **Node.js** (versión 18 o superior) y **pnpm**. Si planeas realizar pruebas, también se recomienda instalar `vitest` globalmente o ejecutarlo mediante los scripts.

## Instalación

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```bash
   git clone https://tu-repositorio.git
   cd funteco_astro
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

   > **Nota:** Si no tienes acceso a internet en este entorno, revisa la sección de dependencias del `package.json` para asegurarte de que las versiones sean correctas. Puedes instalar paquetes locales o usar un registro privado.

## Scripts disponibles

Una vez instaladas las dependencias, puedes ejecutar los siguientes comandos:

- `pnpm dev` – Inicia el servidor de desarrollo en `http://localhost:3000` con recarga en caliente.
- `pnpm build` – Genera una versión estática optimizada en la carpeta `dist/` lista para desplegar en Vercel, Netlify u otro hosting estático.
- `pnpm preview` – Previsualiza el sitio de producción generado en `dist/`.
- `pnpm test` – Ejecuta la suite de Vitest para validar componentes de contenido y diseño clave.

## Despliegue estático en Netlify

El proyecto se construye ahora como un sitio estático puro, sin rutas protegidas ni funciones de servidor. Puedes publicar el contenido en Netlify generando la carpeta `dist/` con `pnpm build` y apuntando la carpeta publicada de tu sitio a ese directorio.

Si prefieres usar la CLI de Netlify, mantén la sesión iniciada con `pnpm netlify login` y luego ejecuta `pnpm deploy` (o `pnpm deploy:prod` para producción) después de compilar.

## Gestión de contenido

Los eventos, los perfiles del equipo y el contenido de la página **¿Qué hacemos?** se almacenan en archivos locales dentro de `src/data`. Las utilidades de `src/utils/content.ts` exponen funciones asíncronas para recuperar la información ya normalizada y lista para usarse en las páginas de Astro. Esta aproximación elimina la dependencia de un CMS y facilita desplegar el sitio en entornos estáticos sin variables de entorno especiales.

El archivo `src/data/whatWeDo.json` concentra el relato etnoeducativo y ahora detalla cómo se articulan la investigación, la tecnología comunitaria y las redes de cuidado.

### Imágenes y recursos estáticos

Todas las ilustraciones SVG y recursos compartidos se encuentran en `public/images`. La plantilla base (`src/layouts/BaseLayout.astro`) toma la imagen de OpenGraph desde esta carpeta para evitar dependencias remotas y mejorar la seguridad del despliegue.

Si necesitas actualizar la agenda, los perfiles o describir nuevos programas, edita los archivos `eventsFallback.ts`, `team.json` y `whatWeDo.json`. Cada función devuelve copias independientes de los datos para evitar mutaciones accidentales en tiempo de ejecución.

## Buenas prácticas y próximos pasos

1. **SEO avanzado**: incorpora un sitemap, etiquetas `og:` para redes sociales y datos estructurados `json‑ld` según corresponda.
2. **Accesibilidad**: verifica el contraste de colores, añade `aria-labels` en elementos interactivos y prueba con herramientas como Lighthouse.
3. **Contenido dinámico**: integra un CMS headless (por ejemplo, Contentful o Sanity) para administrar eventos y publicaciones sin necesidad de editar el código.
4. **Analítica y formularios**: agrega soluciones como Google Analytics o Matomo y usa servicios de formularios (Netlify Forms, Formspree) si no cuentas con un backend propio.
5. **Pruebas de UI**: amplía la suite de pruebas utilizando Testing Library para asegurar que los componentes respondan correctamente a interacciones del usuario.

## Contribuciones

Si deseas aportar al proyecto, abre una incidencia o envía una solicitud de cambios. Toda mejora en usabilidad, accesibilidad o rendimiento es bienvenida.

## Licencia

Este proyecto está licenciado bajo la **MIT**. Eres libre de usar, modificar y distribuir el código respetando los términos de la licencia.
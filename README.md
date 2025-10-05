# Funteco – MVP con Astro

Este repositorio contiene una propuesta de **MVP (Minimum Viable Product)** para el sitio de la Fundación Tejiendo Conocimientos (**Funteco**), construido con [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/) y JavaScript. El diseño se inspiró en sitios de organizaciones sociales como Women Voice Network y CEPAM, priorizando la accesibilidad, la claridad del mensaje y una estética limpia.

## Características

- **Astro** como generador estático para obtener un sitio rápido y optimizado.
- **Tailwind CSS** integrado mediante el paquete `@astrojs/tailwind` para estilos utilitarios y responsive.
- **Diseño responsivo** preparado para dispositivos móviles y de escritorio.
- **SEO básico**: cada página define etiquetas `<title>` y `<meta name="description">` para mejorar la indexación.
- **HTML semántico** y accesible, con navegación clara y textos alternativos descriptivos para imágenes.
- **Pruebas básicas de diseño** escritas con [Vitest](https://vitest.dev/) y `jsdom` para verificar la existencia de componentes clave.

## Estructura del proyecto

```
funteco_astro/
├── astro.config.mjs        # Configuración de Astro y Tailwind
├── tailwind.config.cjs     # Personalización de Tailwind
├── postcss.config.cjs      # Configuración de PostCSS
├── package.json            # Dependencias y scripts
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro  # Plantilla base con título y metadatos
│   ├── components/
│   │   ├── Header.astro      # Menú de navegación responsivo
│   │   └── Footer.astro      # Pie de página con redes sociales
│   ├── pages/
│   │   ├── index.astro       # Página de inicio (hero, ejes, eventos, CTA)
│   │   ├── about.astro       # Misión y visión
│   │   ├── eventos.astro     # Listado de eventos
│   │   └── contacto.astro    # Información de contacto y formulario
│   └── tests/
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
- `pnpm test` – Ejecuta la suite de Vitest, incluyendo las pruebas del módulo administrativo.

## Gestión de contenido

Los eventos y perfiles del equipo se almacenan en archivos locales dentro de `src/data`. Las utilidades de `src/utils/content.ts` exponen funciones asíncronas para recuperar la información ya normalizada y lista para usarse en las páginas de Astro. Esta aproximación elimina la dependencia de un CMS y facilita desplegar el sitio en entornos estáticos sin variables de entorno especiales.

Si necesitas actualizar la agenda o los perfiles, edita los archivos `eventsFallback.ts` y `team.json`. Cada función devuelve copias independientes de los datos para evitar mutaciones accidentales en tiempo de ejecución.

El acceso administrativo ahora se concentra en la página `/admin/login`, que ofrece un formulario preparado para conectar con el sistema de autenticación que utilice tu organización. Puedes adaptar la acción del formulario o integrar un servicio de identidad sin modificar el resto del sitio.

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
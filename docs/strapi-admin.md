# Integración con el panel oficial de Strapi

El panel personalizado fue reemplazado por la consola oficial de [Strapi](https://docs.strapi.io). Ahora el sitio de Funteco consume la información directamente del CMS siguiendo los pasos del [Quick Start](https://docs.strapi.io/cms/quick-start). Esta guía resume el flujo de instalación y la configuración necesaria para que el frontend funcione con datos en tiempo real.

## 1. Crear el proyecto de Strapi

1. Instala las dependencias con el asistente oficial:

   ```bash
   npx create-strapi-app@latest strapi-backend --quickstart
   ```

   El modo _quickstart_ utiliza SQLite y levanta el panel en `http://localhost:1337/admin`.

2. Durante el primer arranque el asistente solicitará crear la cuenta administradora. Guarda las credenciales para compartirlas con el equipo.

## 2. Definir los tipos de contenido

En el panel de Strapi crea dos colecciones para replicar la estructura utilizada en el frontend:

### Colección `events`

Campos sugeridos:

| Campo              | Tipo          | Opciones                                                  |
| ------------------ | ------------- | --------------------------------------------------------- |
| `title`            | Text          | Required                                                  |
| `slug`             | UID           | Basado en `title`                                         |
| `shortDescription` | Text          | Required                                                  |
| `description`      | Rich Text     | Required                                                  |
| `date`             | Date          | Required                                                  |
| `location`         | Text          | Required                                                  |
| `tags`             | JSON          | Guarda un arreglo de etiquetas (por ejemplo `["cultura"]`) |
| `image`            | Media (Single)| Requerido                                                 |

Publica algunos eventos de prueba para verificar la integración.

### Colección `team-members`

Campos sugeridos:

| Campo          | Tipo          | Opciones                                                               |
| -------------- | ------------- | ---------------------------------------------------------------------- |
| `name`         | Text          | Required                                                               |
| `slug`         | UID           | Basado en `name`                                                       |
| `role`         | Text          | Required                                                               |
| `shortBio`     | Text          | Required                                                               |
| `bio`          | Rich Text     | Required                                                               |
| `focus`        | Text          | Required                                                               |
| `expertise`    | JSON          | Arreglo de áreas de especialización                                   |
| `highlights`   | JSON          | Arreglo de logros o aportes destacados                                 |
| `socials`      | JSON          | Arreglo con objetos `{ "platform": "instagram", "label": "…", "url": "…" }` |
| `image`        | Media (Single)| Requerido                                                              |

Publica cada perfil para que sea visible desde la API pública.

## 3. Crear un token de API

1. Ve a **Settings → API Tokens** y genera un token de tipo _Read-only_.
2. Copia el valor y guárdalo como una variable de entorno:

   ```bash
   export STRAPI_API_TOKEN="tu_token"
   export PUBLIC_STRAPI_URL="http://localhost:1337"
   ```

3. El frontend utiliza estas variables para conectarse durante el build y en tiempo de ejecución.

## 4. ¿Cómo usa el frontend la API?

- Las páginas de Astro llaman a los helpers de `src/utils/strapiContent.ts`.
- Cada helper consulta la colección correspondiente (`/api/events`, `/api/team-members`) y transforma la respuesta al formato que esperan los componentes.
- Si la API no está disponible, se recurre a los datos de respaldo definidos en `src/data/eventsFallback.ts` y `src/data/team.json`.

## 5. Pruebas automatizadas

Ejecuta `pnpm test` para validar que los helpers de Strapi sigan funcionando. Las pruebas simulan respuestas de la API y verifican la conversión de datos y los mecanismos de respaldo.

## 6. Próximos pasos

- Habilita roles y permisos según las necesidades del equipo desde **Settings → Users & Permissions**.
- Configura el despliegue del backend en el servicio de tu preferencia (Railway, Render, Heroku, etc.).
- Automatiza la sincronización de datos ejecutando `npm run develop` en `strapi-backend` durante el desarrollo local.

Con esta configuración el sitio de Funteco se alimenta 100 % del CMS oficial, manteniendo la flexibilidad de Strapi y eliminando la capa de administración simulada.

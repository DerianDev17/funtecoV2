# Panel administrativo inspirado en Strapi

Este proyecto incorpora un panel de administración basado en la filosofía de módulos de [Strapi](https://docs.strapi.io). El objetivo es ofrecer una experiencia similar a la consola oficial —con constructor de tipos de contenido, gestor de entradas, biblioteca de medios y control de usuarios— pero adaptada a las necesidades del MVP.

## Módulos disponibles

### Content-type Builder
- Crea colecciones personalizadas indicando nombre visible, descripción, categoría e icono.
- Añade o elimina campos compatibles con Strapi (`string`, `text`, `richtext`, `uid`, `media`, `enumeration`, `json`, `date`, `datetime`, `boolean`, `number`, `relation`).
- Bloquea la eliminación de los tipos base (secciones, integrantes y eventos) para preservar la configuración esencial del sitio.

### Content Manager
- Gestiona las colecciones base y las personalizadas con estados `draft` y `published`.
- Respeta las reglas de publicación por rol (por ejemplo, las personas colaboradoras solo pueden crear borradores).
- Admite edición en línea, vista previa de estados y acciones de eliminación.

### Media Library
- Registra imágenes, documentos y otros recursos (se asume una URL pública).
- Permite editar el texto alternativo y eliminar activos. Los recursos asociados a entradas se agregan automáticamente.

### Users, Roles & Permissions
- Administra cuentas internas, asigna los roles definidos y muestra sus capacidades según la matriz oficial de Strapi.
- Restringe el acceso al módulo si la persona autenticada no posee permisos de gestión.

## Flujo de autenticación
1. Ingresar con las credenciales existentes (`admin`/`admin123`, `moderador`/`mod123`, etc.).
2. Al iniciar sesión, el panel recuerda el usuario en `localStorage` para mantener la sesión.
3. Cerrar sesión revierte la aplicación al modo de acceso protegido.

## Personalización
- Los nuevos tipos de contenido se almacenan en `localStorage` bajo la clave `funteco-strapi-modules` para facilitar prototipos sin backend.
- Puedes extender los campos permitidos en `src/utils/strapiAdmin.ts` si necesitas componentes adicionales.
- Las entradas de colecciones personalizadas admiten cualquier estructura basada en los campos configurados.

## Pruebas unitarias
Las pruebas de Vitest (`pnpm test`) validan:
- Autenticación y permisos por rol.
- Creación, actualización y eliminación de tipos de contenido y campos.
- Gestión de entradas para colecciones base y personalizadas.
- Operaciones de la biblioteca multimedia y persistencia en almacenamiento local.

Para añadir nuevas validaciones, utiliza `createStrapiAdmin` y los módulos expuestos en `src/utils/strapiAdmin.ts` como harías con el SDK oficial de Strapi.

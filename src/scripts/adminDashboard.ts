import {
  createStrapiAdmin,
  type ContentEntry,
  type ContentTypeDefinition,
  type MediaAsset,
} from "../utils/strapiAdmin";
import { ROLES, type SectionStatus } from "../utils/adminStore";
import type { SocialLink } from "../data/team";

const root = document.querySelector<HTMLElement>("#admin-app");
if (!root) {
  console.warn("Vista de administración no encontrada");
} else {
  const store = createStrapiAdmin(window.localStorage);
  const { contentTypeBuilder, contentManager, mediaLibrary, usersRolesPermissions } =
    store.modules;

  const loginView = document.querySelector<HTMLElement>("#login-view");
  const dashboard = document.querySelector<HTMLElement>("#dashboard");
  const loginForm = document.querySelector<HTMLFormElement>("#login-form");
  const loginError = document.querySelector<HTMLElement>("#login-error");
  const currentUserLabel = document.querySelector<HTMLElement>("#current-user");
  const logoutBtn = document.querySelector<HTMLButtonElement>("#logout-btn");

  const contentTypeForm = document.querySelector<HTMLFormElement>("#content-type-form");
  const contentTypeFeedback = document.querySelector<HTMLElement>("#content-type-feedback");
  const contentFieldForm = document.querySelector<HTMLFormElement>("#content-field-form");
  const contentFieldFeedback = document.querySelector<HTMLElement>("#content-field-feedback");
  const contentTypeList = document.querySelector<HTMLElement>("#content-type-list");

  const sectionForm = document.querySelector<HTMLFormElement>("#section-form");
  const sectionList = document.querySelector<HTMLElement>("#section-list");
  const sectionFeedback = document.querySelector<HTMLElement>("#section-feedback");
  const cancelEditSectionBtn = document.querySelector<HTMLButtonElement>("#cancel-edit");

  const teamForm = document.querySelector<HTMLFormElement>("#team-form");
  const teamList = document.querySelector<HTMLElement>("#team-list");
  const teamFeedback = document.querySelector<HTMLElement>("#team-feedback");
  const cancelTeamEditBtn = document.querySelector<HTMLButtonElement>("#cancel-team-edit");
  const teamPreviewDraft = document.querySelector<HTMLElement>("#team-preview-draft");
  const teamPreviewPublished = document.querySelector<HTMLElement>("#team-preview-published");

  const eventForm = document.querySelector<HTMLFormElement>("#event-form");
  const eventList = document.querySelector<HTMLElement>("#event-list");
  const eventFeedback = document.querySelector<HTMLElement>("#event-feedback");
  const cancelEventEditBtn = document.querySelector<HTMLButtonElement>("#cancel-event-edit");
  const eventPreviewDraft = document.querySelector<HTMLElement>("#event-preview-draft");
  const eventPreviewPublished = document.querySelector<HTMLElement>("#event-preview-published");

  const mediaUploadForm = document.querySelector<HTMLFormElement>("#media-upload-form");
  const mediaFeedback = document.querySelector<HTMLElement>("#media-feedback");
  const mediaLibraryList = document.querySelector<HTMLElement>("#media-library-list");

  const userManagement = document.querySelector<HTMLElement>("#user-management");
  const userForm = document.querySelector<HTMLFormElement>("#user-form");
  const userList = document.querySelector<HTMLElement>("#user-list");
  const userFeedback = document.querySelector<HTMLElement>("#user-feedback");
  const userNavBtn = document.querySelector<HTMLButtonElement>("#user-nav-btn");

  const viewButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-view]")
  );
  const viewPanels = Array.from(
    document.querySelectorAll<HTMLElement>("[data-view-panel]")
  );

  type ViewKey = "content-types" | "content-manager" | "media-library" | "users";
  let activeView: ViewKey = "content-types";

  const setHidden = (element: Element | null, hidden: boolean) => {
    if (!element) return;
    element.classList.toggle("hidden", hidden);
  };

  const setMessage = (
    element: HTMLElement | null,
    message: string,
    type: "info" | "error" | "success" = "info"
  ) => {
    if (!element) return;
    if (!message) {
      element.classList.add("hidden");
      element.textContent = "";
      return;
    }
    element.textContent = message;
    element.classList.remove("hidden");
    element.classList.toggle("border-rose-500/40", type === "error");
    element.classList.toggle("text-rose-200", type === "error");
    element.classList.toggle("border-teal-500/40", type === "success");
    element.classList.toggle("text-teal-200", type === "success");
    if (type === "info") {
      element.classList.remove("border-rose-500/40", "border-teal-500/40");
      element.classList.remove("text-rose-200", "text-teal-200");
    }
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const truncate = (value: string, length = 160) =>
    value.length > length ? `${value.slice(0, length)}…` : value;

  const toDateTime = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return value;
    }
  };

  const parseCommaSeparated = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const parseParagraphs = (value: string) =>
    value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

  const parseSocials = (value: string, name: string): SocialLink[] => {
    if (!value.trim()) return [];
    try {
      const parsed = JSON.parse(value) as SocialLink[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && typeof item.url === "string")
        .map((item) => ({
          ...item,
          label: item.label || `${item.platform} de ${name}`,
        }));
    } catch (error) {
      console.warn("No se pudo interpretar la lista de redes sociales", error);
      return [];
    }
  };

  const updateStatusControl = (
    select: HTMLSelectElement | null,
    canPublish: boolean
  ) => {
    if (!select) return;
    const publishOption = Array.from(select.options).find(
      (option) => option.value === "published"
    );
    if (publishOption) {
      publishOption.disabled = !canPublish && !publishOption.selected;
    }
    if (!canPublish && select.value === "published" && !publishOption?.selected) {
      select.value = "draft";
    }
    select.dataset.canPublish = String(canPublish);
  };

  const setView = (view: ViewKey) => {
    activeView = view;
    viewButtons.forEach((button) => {
      const buttonView = button.dataset.view as ViewKey | undefined;
      if (!buttonView) return;
      const isActive = buttonView === view;
      button.setAttribute("aria-pressed", String(isActive));
      button.classList.toggle("border-teal-500/60", isActive);
      button.classList.toggle("bg-teal-500/10", isActive);
      button.classList.toggle("text-teal-200", isActive);
      button.classList.toggle("hover:bg-teal-500/20", isActive);
      button.classList.toggle("border-slate-700", !isActive);
      button.classList.toggle("bg-slate-900", !isActive);
      button.classList.toggle("text-slate-300", !isActive);
      button.classList.toggle("hover:border-teal-400", !isActive);
      button.classList.toggle("hover:text-teal-200", !isActive);
    });
    viewPanels.forEach((panel) => {
      const panelView = panel.dataset.viewPanel as ViewKey | undefined;
      panel.classList.toggle("hidden", panelView !== view);
    });
  };

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view as ViewKey | undefined;
      if (!view) return;
      if (view === "users" && userNavBtn?.classList.contains("hidden")) {
        return;
      }
      setView(view);
    });
  });

  const renderContentTypes = () => {
    const types = contentTypeBuilder.list();
    if (!contentTypeList) return;
    if (!types.length) {
      contentTypeList.innerHTML =
        '<p class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-400">Configura tu primer tipo de contenido para habilitar colecciones personalizadas.</p>';
      return;
    }
    contentTypeList.innerHTML = types
      .map((type) => {
        const fields = type.fields
          .map(
            (field) => `
              <li class="flex items-start justify-between gap-3 rounded border border-slate-800 bg-slate-900/60 px-3 py-2">
                <div>
                  <p class="font-medium text-slate-200">${escapeHtml(field.name)}</p>
                  <p class="text-xs text-slate-400">Tipo: ${escapeHtml(field.type)}${
                    field.required ? " · obligatorio" : ""
                  }</p>
                </div>
                ${
                  type.configurable && field.configurable
                    ? `<button type="button" class="rounded border border-slate-700 px-2 py-1 text-xs text-rose-200 transition hover:border-rose-500/60 hover:text-rose-100" data-action="remove-field" data-content-type="${escapeHtml(
                        type.uid
                      )}" data-field="${escapeHtml(field.id)}">Eliminar</button>`
                    : ""
                }
              </li>
            `
          )
          .join("");
        const canDelete = type.configurable;
        return `
          <article class="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <header class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 class="text-base font-semibold text-slate-200">${escapeHtml(
                  type.displayName
                )}</h4>
                <p class="text-xs text-slate-400">${escapeHtml(type.description)}</p>
                <p class="text-[11px] uppercase tracking-wide text-slate-500">
                  UID: ${escapeHtml(type.uid)} · Categoría: ${escapeHtml(type.category)}
                </p>
              </div>
              ${
                canDelete
                  ? `<button type="button" class="rounded border border-rose-500/60 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400 hover:text-rose-100" data-action="delete-type" data-content-type="${escapeHtml(
                      type.uid
                    )}">Eliminar</button>`
                  : ""
              }
            </header>
            <ul class="space-y-2 text-sm text-slate-200">${fields ||
              '<li class="rounded border border-dashed border-slate-700 px-3 py-2 text-xs text-slate-400">Aún no hay campos configurados.</li>'
            }</ul>
          </article>
        `;
      })
      .join("");
  };

  const populateContentTypeOptions = () => {
    if (!contentFieldForm) return;
    const select = contentFieldForm.elements.namedItem("uid") as HTMLSelectElement | null;
    if (!select) return;
    const types = contentTypeBuilder.list();
    select.innerHTML = types
      .filter((type) => type.configurable)
      .map(
        (type) =>
          `<option value="${escapeHtml(type.uid)}">${escapeHtml(type.displayName)}</option>`
      )
      .join("");
  };

  const renderSections = () => {
    if (!sectionList) return;
    const entries = contentManager.listEntries("sections");
    if (!entries.length) {
      sectionList.innerHTML =
        '<li class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-400">Aún no hay secciones registradas.</li>';
      return;
    }
    sectionList.innerHTML = entries
      .map(
        (entry) => `
          <li class="rounded border border-slate-800 bg-slate-900/60 p-3 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-200">${escapeHtml(
                  String(entry.attributes.title ?? "")
                )}</p>
                <p class="text-xs text-slate-400">${truncate(
                  escapeHtml(String(entry.attributes.content ?? "")),
                  120
                )}</p>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="rounded-full border border-slate-700 px-2 py-1 text-slate-300">${
                  entry.status === "published" ? "Publicado" : "Borrador"
                }</span>
                <span class="text-slate-500">${escapeHtml(toDateTime(entry.updatedAt))}</span>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
              <button type="button" class="rounded border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-teal-500 hover:text-teal-200" data-action="edit-section" data-id="${entry.id}">Editar</button>
              <button type="button" class="rounded border border-rose-500/60 px-3 py-1 text-rose-200 transition hover:border-rose-400 hover:text-rose-100" data-action="delete-section" data-id="${entry.id}">Eliminar</button>
            </div>
          </li>
        `
      )
      .join("");
  };

  const renderTeamPreviewList = (
    container: HTMLElement | null,
    entries: ContentEntry[],
    status: SectionStatus,
    emptyMessage: string
  ) => {
    if (!container) return;
    const filtered = entries.filter((entry) => entry.status === status);
    if (!filtered.length) {
      container.innerHTML = `<p class="text-xs text-slate-500">${escapeHtml(emptyMessage)}</p>`;
      return;
    }
    container.innerHTML = filtered
      .map((entry) =>
        `<p class="rounded border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300">${escapeHtml(
          String(entry.attributes.name ?? entry.attributes.title ?? "")
        )}</p>`
      )
      .join("");
  };

  const renderTeam = () => {
    if (!teamList) return;
    const entries = contentManager.listEntries("team-members");
    if (!entries.length) {
      teamList.innerHTML =
        '<li class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-400">Registra el primer perfil para tu equipo.</li>';
    } else {
      teamList.innerHTML = entries
        .map(
          (entry) => {
            const name = String(entry.attributes.name ?? "");
            const role = String(entry.attributes.role ?? "");
            const image = String(entry.attributes.image ?? "");
            return `
            <li class="rounded border border-slate-800 bg-slate-900/60 p-3 text-sm">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-slate-200">${escapeHtml(name)}</p>
                  <p class="text-xs text-slate-400">${escapeHtml(role)}</p>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="rounded-full border border-slate-700 px-2 py-1 text-slate-300">${
                    entry.status === "published" ? "Publicado" : "Borrador"
                  }</span>
                  <span class="text-slate-500">${escapeHtml(toDateTime(entry.updatedAt))}</span>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <button type="button" class="rounded border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-teal-500 hover:text-teal-200" data-action="edit-member" data-id="${entry.id}">Editar</button>
                <button type="button" class="rounded border border-rose-500/60 px-3 py-1 text-rose-200 transition hover:border-rose-400 hover:text-rose-100" data-action="delete-member" data-id="${entry.id}">Eliminar</button>
                ${
                  image
                    ? `<a href="${escapeHtml(image)}" target="_blank" rel="noopener" class="rounded border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500">Ver imagen</a>`
                    : ""
                }
              </div>
            </li>
          `;
          }
        )
        .join("");
    }
    renderTeamPreviewList(teamPreviewDraft, entries, "draft", "Sin borradores");
    renderTeamPreviewList(teamPreviewPublished, entries, "published", "Sin publicaciones");
  };

  const renderEvents = () => {
    if (!eventList) return;
    const entries = contentManager.listEntries("events");
    if (!entries.length) {
      eventList.innerHTML =
        '<li class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-400">Configura eventos, talleres o hitos relevantes.</li>';
    } else {
      eventList.innerHTML = entries
        .map(
          (entry) => `
          <li class="rounded border border-slate-800 bg-slate-900/60 p-3 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-200">${escapeHtml(
                  String(entry.attributes.title ?? "")
                )}</p>
                <p class="text-xs text-slate-400">${escapeHtml(
                  String(entry.attributes.shortDescription ?? "")
                )}</p>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="rounded-full border border-slate-700 px-2 py-1 text-slate-300">${
                  entry.status === "published" ? "Publicado" : "Borrador"
                }</span>
                <span class="text-slate-500">${escapeHtml(toDateTime(entry.updatedAt))}</span>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
              <button type="button" class="rounded border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-teal-500 hover:text-teal-200" data-action="edit-event" data-id="${entry.id}">Editar</button>
              <button type="button" class="rounded border border-rose-500/60 px-3 py-1 text-rose-200 transition hover:border-rose-400 hover:text-rose-100" data-action="delete-event" data-id="${entry.id}">Eliminar</button>
            </div>
          </li>
        `
        )
        .join("");
    }

    const draft = entries.filter((entry) => entry.status === "draft");
    const published = entries.filter((entry) => entry.status === "published");
    if (eventPreviewDraft) {
      eventPreviewDraft.innerHTML = draft.length
        ? draft
            .map(
              (entry) =>
                `<p class="rounded border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300">${escapeHtml(
                  String(entry.attributes.title ?? "")
                )}</p>`
            )
            .join("")
        : '<p class="text-xs text-slate-500">Sin borradores</p>';
    }
    if (eventPreviewPublished) {
      eventPreviewPublished.innerHTML = published.length
        ? published
            .map(
              (entry) =>
                `<p class="rounded border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300">${escapeHtml(
                  String(entry.attributes.title ?? "")
                )}</p>`
            )
            .join("")
        : '<p class="text-xs text-slate-500">Sin publicaciones</p>';
    }
  };

  const renderMedia = () => {
    if (!mediaLibraryList) return;
    const assets = mediaLibrary.list();
    if (!assets.length) {
      mediaLibraryList.innerHTML =
        '<li class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-400">Sube tus primeras imágenes o documentos para reutilizarlos en el sitio.</li>';
      return;
    }
    mediaLibraryList.innerHTML = assets
      .map(
        (asset) => `
        <li class="rounded border border-slate-800 bg-slate-900/60 p-3 text-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-semibold text-slate-200">${escapeHtml(asset.name)}</p>
              <p class="text-xs text-slate-400">${escapeHtml(asset.type)} · ${escapeHtml(
          asset.createdBy
        )}</p>
              ${asset.altText ? `<p class="text-xs text-slate-500">Alt: ${escapeHtml(asset.altText)}</p>` : ""}
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <span>${escapeHtml(toDateTime(asset.updatedAt))}</span>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <a href="${escapeHtml(asset.url)}" target="_blank" rel="noopener" class="rounded border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-teal-500 hover:text-teal-200">Abrir recurso</a>
            <button type="button" class="rounded border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-teal-500 hover:text-teal-200" data-action="edit-asset" data-id="${asset.id}">Actualizar alt</button>
            <button type="button" class="rounded border border-rose-500/60 px-3 py-1 text-rose-200 transition hover:border-rose-400 hover:text-rose-100" data-action="delete-asset" data-id="${asset.id}">Eliminar</button>
          </div>
        </li>
      `
      )
      .join("");
  };

  const renderUsers = () => {
    if (!userList) return;
    const users = usersRolesPermissions.listUsers();
    if (!users.length) {
      userList.innerHTML =
        '<li class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-400">No hay cuentas registradas.</li>';
      return;
    }
    userList.innerHTML = users
      .map((user) => {
        const capabilities = usersRolesPermissions.getRoleCapabilities(user.role);
        const capabilitiesSummary = [
          capabilities.manageUsers ? "Gestiona usuarios" : null,
          capabilities.publish ? "Publica contenidos" : null,
          capabilities.createSections ? "Crea entradas" : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return `
          <li class="rounded border border-slate-800 bg-slate-900/60 p-3 text-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-200">${escapeHtml(user.username)}</p>
                <p class="text-xs text-slate-400">${escapeHtml(user.role)}</p>
                <p class="text-[11px] text-slate-500">${escapeHtml(capabilitiesSummary)}</p>
              </div>
              <button type="button" class="rounded border border-rose-500/60 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-400 hover:text-rose-100" data-action="delete-user" data-id="${user.id}">Eliminar</button>
            </div>
          </li>
        `;
      })
      .join("");
  };

  const updateUserNavVisibility = () => {
    const canManage = usersRolesPermissions.canCurrentUserManageUsers();
    setHidden(userNavBtn, !canManage);
    if (!canManage && activeView === "users") {
      setView("content-types");
    }
  };

  const renderAll = () => {
    renderContentTypes();
    populateContentTypeOptions();
    renderSections();
    renderTeam();
    renderEvents();
    renderMedia();
    renderUsers();
    updateUserNavVisibility();
    const canPublishNow = store.canPublish();
    updateStatusControl(
      sectionForm?.elements.namedItem("status") as HTMLSelectElement | null,
      canPublishNow
    );
    updateStatusControl(
      teamForm?.elements.namedItem("status") as HTMLSelectElement | null,
      canPublishNow
    );
    updateStatusControl(
      eventForm?.elements.namedItem("status") as HTMLSelectElement | null,
      canPublishNow
    );
  };

  const resetForms = () => {
    contentTypeForm?.reset();
    contentFieldForm?.reset();
    sectionForm?.reset();
    teamForm?.reset();
    eventForm?.reset();
    mediaUploadForm?.reset();
    userForm?.reset();
  };

  const afterLogin = () => {
    setHidden(loginView, true);
    setHidden(dashboard, false);
    const user = usersRolesPermissions.currentUser();
    if (currentUserLabel && user) {
      currentUserLabel.textContent = user.username;
    }
    resetForms();
    renderAll();
    setView("content-types");
  };

  const handleLogout = () => {
    store.logout();
    resetForms();
    setHidden(loginView, false);
    setHidden(dashboard, true);
    setMessage(loginError, "", "info");
    setMessage(sectionFeedback, "", "info");
    setMessage(teamFeedback, "", "info");
    setMessage(eventFeedback, "", "info");
    setMessage(mediaFeedback, "", "info");
    setMessage(contentTypeFeedback, "", "info");
    setMessage(contentFieldFeedback, "", "info");
    setMessage(userFeedback, "", "info");
  };

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    try {
      store.login(username, password);
      afterLogin();
    } catch (error) {
      setMessage(
        loginError,
        error instanceof Error ? error.message : "No se pudo iniciar sesión",
        "error"
      );
    }
  });

  logoutBtn?.addEventListener("click", () => {
    handleLogout();
  });

  contentTypeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contentTypeForm);
    try {
      contentTypeBuilder.create({
        displayName: String(formData.get("displayName") ?? ""),
        description: String(formData.get("description") ?? ""),
        category: String(formData.get("category") ?? ""),
        icon: String(formData.get("icon") ?? ""),
        draftAndPublish: formData.get("draftAndPublish") !== null,
      });
      contentTypeForm.reset();
      setMessage(contentTypeFeedback, "Tipo de contenido creado.", "success");
      renderContentTypes();
      populateContentTypeOptions();
    } catch (error) {
      setMessage(
        contentTypeFeedback,
        error instanceof Error ? error.message : "No fue posible crear el tipo",
        "error"
      );
    }
  });

  contentFieldForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contentFieldForm);
    const uid = String(formData.get("uid") ?? "");
    const name = String(formData.get("name") ?? "");
    const type = String(formData.get("type") ?? "string");
    const required = formData.get("required") !== null;
    try {
      contentTypeBuilder.addField(uid, {
        name,
        type: type as ContentTypeDefinition["fields"][number]["type"],
        required,
        configurable: true,
      });
      setMessage(contentFieldFeedback, "Campo añadido correctamente.", "success");
      contentFieldForm.reset();
      renderContentTypes();
    } catch (error) {
      setMessage(
        contentFieldFeedback,
        error instanceof Error ? error.message : "No fue posible añadir el campo",
        "error"
      );
    }
  });

  contentTypeList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const uid = target.dataset.contentType;
    if (!action || !uid) return;
    if (action === "delete-type") {
      if (!confirm("¿Eliminar este tipo de contenido y sus entradas personalizadas?")) {
        return;
      }
      try {
        contentTypeBuilder.delete(uid);
        renderContentTypes();
        populateContentTypeOptions();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar");
      }
      return;
    }
    if (action === "remove-field") {
      const fieldId = target.dataset.field;
      if (!fieldId) return;
      try {
        contentTypeBuilder.removeField(uid, fieldId);
        renderContentTypes();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar el campo");
      }
    }
  });

  sectionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(sectionForm);
    const id = String(formData.get("sectionId") ?? "");
    const payload = {
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      status: String(formData.get("status") ?? "draft") as SectionStatus,
    };
    try {
      if (id) {
        contentManager.updateEntry("sections", id, payload);
        setMessage(sectionFeedback, "Sección actualizada.", "success");
      } else {
        contentManager.createEntry("sections", payload);
        setMessage(sectionFeedback, "Sección creada.", "success");
      }
      sectionForm.reset();
      renderSections();
    } catch (error) {
      setMessage(
        sectionFeedback,
        error instanceof Error ? error.message : "No fue posible guardar la sección",
        "error"
      );
    }
  });

  cancelEditSectionBtn?.addEventListener("click", () => {
    sectionForm?.reset();
    setMessage(sectionFeedback, "", "info");
    cancelEditSectionBtn.classList.add("hidden");
  });

  sectionList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;
    if (action === "edit-section" && sectionForm) {
      const entry = contentManager.getEntry("sections", id);
      if (!entry) return;
      (sectionForm.elements.namedItem("sectionId") as HTMLInputElement | null)?.setAttribute(
        "value",
        entry.id
      );
      (sectionForm.elements.namedItem("title") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.title ?? "")
      );
      (sectionForm.elements.namedItem("content") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        String(entry.attributes.content ?? "")
      );
      const statusSelect = sectionForm.elements.namedItem("status") as HTMLSelectElement | null;
      if (statusSelect) {
        statusSelect.value = entry.status;
      }
      cancelEditSectionBtn?.classList.remove("hidden");
      setView("content-manager");
      setMessage(sectionFeedback, "Editando sección existente.", "info");
      return;
    }
    if (action === "delete-section") {
      if (!confirm("¿Eliminar esta sección?") || !id) return;
      try {
        contentManager.deleteEntry("sections", id);
        renderSections();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar la sección");
      }
    }
  });

  teamForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(teamForm);
    const id = String(formData.get("memberId") ?? "");
    const payload = {
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      image: String(formData.get("image") ?? ""),
      shortBio: String(formData.get("shortBio") ?? ""),
      bio: parseParagraphs(String(formData.get("bio") ?? "")),
      focus: String(formData.get("focus") ?? ""),
      expertise: parseCommaSeparated(String(formData.get("expertise") ?? "")),
      highlights: parseParagraphs(String(formData.get("highlights") ?? "")),
      socials: parseSocials(String(formData.get("socials") ?? ""), String(formData.get("name") ?? "")),
      status: String(formData.get("status") ?? "draft") as SectionStatus,
    };
    try {
      if (id) {
        contentManager.updateEntry("team-members", id, payload);
        setMessage(teamFeedback, "Integrante actualizado.", "success");
      } else {
        contentManager.createEntry("team-members", payload);
        setMessage(teamFeedback, "Integrante añadido.", "success");
      }
      teamForm.reset();
      cancelTeamEditBtn?.classList.add("hidden");
      renderTeam();
    } catch (error) {
      setMessage(
        teamFeedback,
        error instanceof Error ? error.message : "No fue posible guardar el integrante",
        "error"
      );
    }
  });

  cancelTeamEditBtn?.addEventListener("click", () => {
    teamForm?.reset();
    cancelTeamEditBtn.classList.add("hidden");
    setMessage(teamFeedback, "", "info");
  });

  teamList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;
    if (action === "edit-member" && teamForm) {
      const entry = contentManager.getEntry("team-members", id);
      if (!entry) return;
      (teamForm.elements.namedItem("memberId") as HTMLInputElement | null)?.setAttribute(
        "value",
        entry.id
      );
      (teamForm.elements.namedItem("name") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.name ?? "")
      );
      (teamForm.elements.namedItem("role") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.role ?? "")
      );
      (teamForm.elements.namedItem("image") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.image ?? "")
      );
      (teamForm.elements.namedItem("shortBio") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        String(entry.attributes.shortBio ?? "")
      );
      (teamForm.elements.namedItem("focus") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.focus ?? "")
      );
      (teamForm.elements.namedItem("bio") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        (entry.attributes.bio as string[] | undefined)?.join("\n") ?? ""
      );
      (teamForm.elements.namedItem("expertise") as HTMLInputElement | null)?.setAttribute(
        "value",
        Array.isArray(entry.attributes.expertise)
          ? (entry.attributes.expertise as string[]).join(", ")
          : ""
      );
      (teamForm.elements.namedItem("highlights") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        (entry.attributes.highlights as string[] | undefined)?.join("\n") ?? ""
      );
      (teamForm.elements.namedItem("socials") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        JSON.stringify(entry.attributes.socials ?? [], null, 2)
      );
      const statusSelect = teamForm.elements.namedItem("status") as HTMLSelectElement | null;
      if (statusSelect) {
        statusSelect.value = entry.status;
      }
      cancelTeamEditBtn?.classList.remove("hidden");
      setView("content-manager");
      setMessage(teamFeedback, "Editando integrante.", "info");
      return;
    }
    if (action === "delete-member") {
      if (!confirm("¿Eliminar este integrante?")) return;
      try {
        contentManager.deleteEntry("team-members", id);
        renderTeam();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar el integrante");
      }
    }
  });

  eventForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(eventForm);
    const id = String(formData.get("eventId") ?? "");
    const payload = {
      title: String(formData.get("title") ?? ""),
      shortDescription: String(formData.get("shortDescription") ?? ""),
      description: parseParagraphs(String(formData.get("description") ?? "")),
      date: String(formData.get("date") ?? new Date().toISOString()),
      image: String(formData.get("image") ?? ""),
      location: String(formData.get("location") ?? ""),
      tags: parseCommaSeparated(String(formData.get("tags") ?? "")),
      status: String(formData.get("status") ?? "draft") as SectionStatus,
    };
    try {
      if (id) {
        contentManager.updateEntry("events", id, payload);
        setMessage(eventFeedback, "Evento actualizado.", "success");
      } else {
        contentManager.createEntry("events", payload);
        setMessage(eventFeedback, "Evento creado.", "success");
      }
      eventForm.reset();
      cancelEventEditBtn?.classList.add("hidden");
      renderEvents();
    } catch (error) {
      setMessage(
        eventFeedback,
        error instanceof Error ? error.message : "No fue posible guardar el evento",
        "error"
      );
    }
  });

  cancelEventEditBtn?.addEventListener("click", () => {
    eventForm?.reset();
    cancelEventEditBtn.classList.add("hidden");
    setMessage(eventFeedback, "", "info");
  });

  eventList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;
    if (action === "edit-event" && eventForm) {
      const entry = contentManager.getEntry("events", id);
      if (!entry) return;
      (eventForm.elements.namedItem("eventId") as HTMLInputElement | null)?.setAttribute(
        "value",
        entry.id
      );
      (eventForm.elements.namedItem("title") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.title ?? "")
      );
      (eventForm.elements.namedItem("shortDescription") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        String(entry.attributes.shortDescription ?? "")
      );
      (eventForm.elements.namedItem("description") as HTMLTextAreaElement | null)?.setAttribute(
        "value",
        Array.isArray(entry.attributes.description)
          ? (entry.attributes.description as string[]).join("\n")
          : ""
      );
      (eventForm.elements.namedItem("date") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.date ?? "").slice(0, 10)
      );
      (eventForm.elements.namedItem("image") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.image ?? "")
      );
      (eventForm.elements.namedItem("location") as HTMLInputElement | null)?.setAttribute(
        "value",
        String(entry.attributes.location ?? "")
      );
      (eventForm.elements.namedItem("tags") as HTMLInputElement | null)?.setAttribute(
        "value",
        Array.isArray(entry.attributes.tags)
          ? (entry.attributes.tags as string[]).join(", ")
          : ""
      );
      const statusSelect = eventForm.elements.namedItem("status") as HTMLSelectElement | null;
      if (statusSelect) {
        statusSelect.value = entry.status;
      }
      cancelEventEditBtn?.classList.remove("hidden");
      setView("content-manager");
      setMessage(eventFeedback, "Editando evento.", "info");
      return;
    }
    if (action === "delete-event") {
      if (!confirm("¿Eliminar este evento?")) return;
      try {
        contentManager.deleteEntry("events", id);
        renderEvents();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar el evento");
      }
    }
  });

  mediaUploadForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(mediaUploadForm);
    try {
      mediaLibrary.upload({
        name: String(formData.get("name") ?? ""),
        url: String(formData.get("url") ?? ""),
        type: String(formData.get("type") ?? "image") as MediaAsset["type"],
        altText: String(formData.get("altText") ?? "") || undefined,
      });
      mediaUploadForm.reset();
      setMessage(mediaFeedback, "Archivo registrado correctamente.", "success");
      renderMedia();
    } catch (error) {
      setMessage(
        mediaFeedback,
        error instanceof Error ? error.message : "No fue posible registrar el archivo",
        "error"
      );
    }
  });

  mediaLibraryList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;
    if (action === "delete-asset") {
      if (!confirm("¿Eliminar este archivo de la biblioteca?")) return;
      try {
        mediaLibrary.remove(id);
        renderMedia();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar el recurso");
      }
      return;
    }
    if (action === "edit-asset") {
      const newAlt = prompt("Texto alternativo", "");
      if (newAlt === null) return;
      try {
        mediaLibrary.update(id, { altText: newAlt || undefined });
        renderMedia();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible actualizar el recurso");
      }
    }
  });

  userForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(userForm);
    const payload = {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? ROLES[0] ?? "Editor"),
    };
    try {
      usersRolesPermissions.createUser(payload);
      userForm.reset();
      setMessage(userFeedback, "Usuario creado correctamente.", "success");
      renderUsers();
    } catch (error) {
      setMessage(
        userFeedback,
        error instanceof Error ? error.message : "No fue posible crear el usuario",
        "error"
      );
    }
  });

  userList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;
    if (action === "delete-user") {
      if (!confirm("¿Eliminar esta cuenta de administración?")) return;
      try {
        usersRolesPermissions.deleteUser(id);
        renderUsers();
      } catch (error) {
        alert(error instanceof Error ? error.message : "No fue posible eliminar el usuario");
      }
    }
  });

  const initialState = store.getState();
  if (initialState.currentUserId) {
    afterLogin();
  } else {
    handleLogout();
  }
}

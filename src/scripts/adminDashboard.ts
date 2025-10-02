import {
  createAdminStore,
  ROLES,
  type ManagedEvent,
  type ManagedTeamMember,
  type SectionStatus,
} from "../utils/adminStore";

const root = document.querySelector<HTMLElement>("#admin-app");
if (!root) {
  console.warn("Vista de administración no encontrada");
} else {
  const store = createAdminStore(window.localStorage);
  const loginView = document.querySelector<HTMLElement>("#login-view");
  const dashboard = document.querySelector<HTMLElement>("#dashboard");
  const loginForm = document.querySelector<HTMLFormElement>("#login-form");
  const loginError = document.querySelector<HTMLElement>("#login-error");
  const currentUser = document.querySelector<HTMLElement>("#current-user");
  const logoutBtn = document.querySelector<HTMLButtonElement>("#logout-btn");

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

  type ViewKey = "content" | "team" | "events" | "users";
  let activeView: ViewKey = "content";

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

  const buildSocialLabel = (platform: string, name: string) => {
    const base =
      platform === "web"
        ? "Portafolio"
        : platform === "instagram"
        ? "Instagram"
        : platform === "facebook"
        ? "Facebook"
        : platform === "linkedin"
        ? "LinkedIn"
        : "Perfil";
    return `${base} de ${name}`.trim();
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

  const renderTeamPreviewList = (
    container: HTMLElement | null,
    items: ManagedTeamMember[],
    emptyMessage: string
  ) => {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `<p class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-500">${escapeHtml(
        emptyMessage
      )}</p>`;
      return;
    }
    container.innerHTML = items
      .map(
        (member) => `
          <article class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2">
            <p class="font-semibold text-slate-200">${escapeHtml(member.name)}</p>
            <p class="text-[10px] uppercase tracking-wide text-slate-500">${escapeHtml(
              member.role
            )}</p>
            <p class="mt-2 text-xs text-slate-400">${escapeHtml(
              truncate(member.shortBio || "Sin biografía", 140)
            )}</p>
          </article>
        `
      )
      .join("");
  };

  const renderEventPreviewList = (
    container: HTMLElement | null,
    items: ManagedEvent[],
    emptyMessage: string
  ) => {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = `<p class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-500">${escapeHtml(
        emptyMessage
      )}</p>`;
      return;
    }
    container.innerHTML = items
      .map(
        (event) => `
          <article class="rounded border border-slate-800 bg-slate-900/40 px-3 py-2">
            <p class="font-semibold text-slate-200">${escapeHtml(event.title)}</p>
            <p class="text-[10px] uppercase tracking-wide text-slate-500">${escapeHtml(
              event.formattedDate
            )}</p>
            <p class="mt-2 text-xs text-slate-400">${escapeHtml(
              truncate(event.shortDescription || "Sin descripción", 140)
            )}</p>
          </article>
        `
      )
      .join("");
  };

  const render = () => {
    const state = store.getState();
    const activeUserRecord =
      state.users.find((user) => user.id === state.currentUserId) ?? null;
    const isAuthenticated = Boolean(activeUserRecord);

    setHidden(loginView, isAuthenticated);
    setHidden(dashboard, !isAuthenticated);
    if (!isAuthenticated) {
      loginForm?.reset();
      setMessage(loginError, "", "info");
      setView("content");
      return;
    }

    if (currentUser && activeUserRecord) {
      currentUser.textContent = `${activeUserRecord.username} · ${activeUserRecord.role}`;
    }

    const canManageUsers = store.canManageUsers();
    const canPublish = store.canPublish();
    setHidden(userManagement, !canManageUsers);
    setHidden(userNavBtn, !canManageUsers);
    if (!canManageUsers && activeView === "users") {
      setView("content");
    } else {
      setView(activeView);
    }

    updateStatusControl(
      sectionForm?.querySelector<HTMLSelectElement>("[name=status]"),
      canPublish
    );
    updateStatusControl(
      teamForm?.querySelector<HTMLSelectElement>("[name=status]"),
      canPublish
    );
    updateStatusControl(
      eventForm?.querySelector<HTMLSelectElement>("[name=status]"),
      canPublish
    );

    if (sectionList) {
      sectionList.innerHTML = "";
      state.sections
        .slice()
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .forEach((section) => {
          const item = document.createElement("li");
          item.className =
            "rounded-lg border border-slate-800 bg-slate-950/40 p-4 shadow-inner shadow-slate-950/30";
          item.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div>
                <h4 class="font-semibold text-teal-200">${escapeHtml(section.title)}</h4>
                <p class="mt-1 text-xs uppercase tracking-wide text-slate-500">${
                  section.status === "published" ? "Publicado" : "Borrador"
                }</p>
                <p class="mt-2 text-xs text-slate-500">Última actualización: ${escapeHtml(
                  toDateTime(section.updatedAt)
                )}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  data-action="edit"
                  data-id="${section.id}"
                  class="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  data-action="delete"
                  data-id="${section.id}"
                  class="rounded bg-rose-600/80 px-3 py-1 text-xs font-medium text-rose-100 transition hover:bg-rose-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p class="mt-3 text-sm text-slate-300">${escapeHtml(section.content)}</p>
          `;
          sectionList.appendChild(item);
        });
    }

    if (teamList) {
      teamList.innerHTML = "";
      state.teamMembers
        .slice()
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .forEach((member) => {
          const item = document.createElement("li");
          item.className =
            "rounded-lg border border-slate-800 bg-slate-950/40 p-4 shadow-inner shadow-slate-950/30";
          const expertiseList = member.expertise
            .map((item) => `<li>• ${escapeHtml(item)}</li>`)
            .join("");
          const highlightsList = member.highlights
            .map((item) => `<li>• ${escapeHtml(item)}</li>`)
            .join("");
          const socialsList = member.socials
            .map(
              (social) => `
                <li>
                  <a
                    class="text-teal-300 underline decoration-dotted underline-offset-4 hover:text-teal-200"
                    href="${escapeHtml(social.url)}"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ${escapeHtml(social.label)}
                  </a>
                </li>
              `
            )
            .join("");
          const bioParagraphs = member.bio
            .map((paragraph) => `<p class="mt-2 leading-relaxed">${escapeHtml(paragraph)}</p>`)
            .join("");
          item.innerHTML = `
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 class="font-semibold text-teal-200">${escapeHtml(member.name)}</h4>
                <p class="text-xs uppercase tracking-wide text-slate-500">${escapeHtml(
                  member.role
                )}</p>
                <p class="mt-2 text-xs text-slate-500">Actualizado: ${escapeHtml(
                  toDateTime(member.updatedAt)
                )}</p>
                <p class="mt-2 text-sm text-slate-300">${escapeHtml(member.shortBio)}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  data-action="edit-team"
                  data-id="${member.id}"
                  class="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  data-action="delete-team"
                  data-id="${member.id}"
                  class="rounded bg-rose-600/80 px-3 py-1 text-xs font-medium text-rose-100 transition hover:bg-rose-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <details class="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-400">
                Ver vista previa
              </summary>
              <div class="mt-3 space-y-2 text-sm text-slate-300">
                <div>
                  <p class="font-semibold text-slate-200">Biografía extendida</p>
                  ${bioParagraphs || '<p class="text-xs text-slate-500">Sin biografía detallada</p>'}
                </div>
                <div>
                  <p class="font-semibold text-slate-200">Enfoque</p>
                  <p class="text-sm text-slate-400">${escapeHtml(member.focus || "Sin enfoque definido")}</p>
                </div>
                <div>
                  <p class="font-semibold text-slate-200">Áreas de experiencia</p>
                  <ul class="mt-1 space-y-1 pl-4 text-sm text-slate-400">
                    ${expertiseList || '<li class="text-xs text-slate-500">Sin registros</li>'}
                  </ul>
                </div>
                <div>
                  <p class="font-semibold text-slate-200">Logros destacados</p>
                  <ul class="mt-1 space-y-1 pl-4 text-sm text-slate-400">
                    ${highlightsList || '<li class="text-xs text-slate-500">Sin registros</li>'}
                  </ul>
                </div>
                <div>
                  <p class="font-semibold text-slate-200">Redes</p>
                  <ul class="mt-1 space-y-1 pl-4 text-sm text-teal-300">
                    ${socialsList || '<li class="text-xs text-slate-500">Sin enlaces</li>'}
                  </ul>
                </div>
              </div>
            </details>
          `;
          teamList.appendChild(item);
        });
    }

    if (eventList) {
      eventList.innerHTML = "";
      state.events
        .slice()
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .forEach((event) => {
          const item = document.createElement("li");
          item.className =
            "rounded-lg border border-slate-800 bg-slate-950/40 p-4 shadow-inner shadow-slate-950/30";
          const descriptionBlocks = event.description
            .map((paragraph) => `<p class="mt-2 leading-relaxed">${escapeHtml(paragraph)}</p>`)
            .join("");
          const tagsList = event.tags
            .map((tag) => `<span class="rounded bg-slate-800 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-300">${escapeHtml(tag)}</span>`)
            .join(" ");
          item.innerHTML = `
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 class="font-semibold text-teal-200">${escapeHtml(event.title)}</h4>
                <p class="text-xs uppercase tracking-wide text-slate-500">${escapeHtml(
                  event.formattedDate
                )}</p>
                <p class="mt-2 text-xs text-slate-500">Actualizado: ${escapeHtml(
                  toDateTime(event.updatedAt)
                )}</p>
                <p class="mt-2 text-sm text-slate-300">${escapeHtml(event.shortDescription)}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  data-action="edit-event"
                  data-id="${event.id}"
                  class="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  data-action="delete-event"
                  data-id="${event.id}"
                  class="rounded bg-rose-600/80 px-3 py-1 text-xs font-medium text-rose-100 transition hover:bg-rose-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <details class="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-400">
                Ver vista previa
              </summary>
              <div class="mt-3 space-y-2 text-sm text-slate-300">
                <div>
                  <p class="font-semibold text-slate-200">Descripción completa</p>
                  ${descriptionBlocks || '<p class="text-xs text-slate-500">Sin descripción detallada</p>'}
                </div>
                <div>
                  <p class="font-semibold text-slate-200">Ubicación</p>
                  <p class="text-sm text-slate-400">${escapeHtml(event.location || "Por definir")}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  ${tagsList || '<span class="text-xs text-slate-500">Sin etiquetas</span>'}
                </div>
              </div>
            </details>
          `;
          eventList.appendChild(item);
        });
    }

    renderTeamPreviewList(
      teamPreviewDraft,
      state.teamMembers.filter((member) => member.status === "draft"),
      "No hay integrantes en borrador"
    );
    renderTeamPreviewList(
      teamPreviewPublished,
      state.teamMembers.filter((member) => member.status === "published"),
      "Aún no hay perfiles publicados"
    );

    renderEventPreviewList(
      eventPreviewDraft,
      state.events.filter((event) => event.status === "draft"),
      "Sin eventos en borrador"
    );
    renderEventPreviewList(
      eventPreviewPublished,
      state.events.filter((event) => event.status === "published"),
      "Aún no hay eventos publicados"
    );

    if (userList && canManageUsers) {
      userList.innerHTML = "";
      state.users
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .forEach((user) => {
          const item = document.createElement("li");
          item.className =
            "flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4";
          item.innerHTML = `
            <div>
              <p class="font-semibold text-slate-100">${escapeHtml(user.username)}</p>
              <p class="text-xs uppercase tracking-wide text-slate-500">${escapeHtml(user.role)}</p>
            </div>
            <button
              data-action="remove-user"
              data-id="${user.id}"
              class="rounded bg-rose-600/80 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-600"
            >
              Eliminar
            </button>
          `;
          userList.appendChild(item);
        });
    }
  };

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    try {
      store.login(username, password);
      setMessage(loginError, "", "info");
    } catch (error) {
      setMessage(
        loginError,
        error instanceof Error ? error.message : "No fue posible iniciar sesión",
        "error"
      );
    }
    render();
  });

  logoutBtn?.addEventListener("click", () => {
    store.logout();
    sectionForm?.reset();
    teamForm?.reset();
    eventForm?.reset();
    userForm?.reset();
    cancelEditSectionBtn?.classList.add("hidden");
    cancelTeamEditBtn?.classList.add("hidden");
    cancelEventEditBtn?.classList.add("hidden");
    setMessage(sectionFeedback, "", "info");
    setMessage(teamFeedback, "", "info");
    setMessage(eventFeedback, "", "info");
    setView("content");
    render();
  });

  sectionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(sectionForm);
    const sectionId = String(formData.get("sectionId") ?? "");
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      content: String(formData.get("content") ?? "").trim(),
      status: String(formData.get("status") ?? "draft") as SectionStatus,
    };
    try {
      if (sectionId) {
        store.updateSection(sectionId, payload);
        setMessage(sectionFeedback, "Sección actualizada correctamente", "success");
      } else {
        store.createSection(payload);
        setMessage(sectionFeedback, "Sección creada correctamente", "success");
      }
      sectionForm.reset();
      cancelEditSectionBtn?.classList.add("hidden");
    } catch (error) {
      setMessage(
        sectionFeedback,
        error instanceof Error ? error.message : "No fue posible guardar",
        "error"
      );
    }
    render();
  });

  cancelEditSectionBtn?.addEventListener("click", () => {
    sectionForm?.reset();
    cancelEditSectionBtn.classList.add("hidden");
    setMessage(sectionFeedback, "Edición cancelada", "info");
  });

  sectionList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!id) return;
    if (action === "edit") {
      const state = store.getState();
      const section = state.sections.find((item) => item.id === id);
      if (!section || !sectionForm) return;
      const idField = sectionForm.querySelector<HTMLInputElement>("[name=sectionId]");
      const titleField = sectionForm.querySelector<HTMLInputElement>("[name=title]");
      const contentField =
        sectionForm.querySelector<HTMLTextAreaElement>("[name=content]");
      const statusField = sectionForm.querySelector<HTMLSelectElement>("[name=status]");
      if (idField) idField.value = section.id;
      if (titleField) titleField.value = section.title;
      if (contentField) contentField.value = section.content;
      if (statusField) statusField.value = section.status;
      cancelEditSectionBtn?.classList.remove("hidden");
      setMessage(sectionFeedback, "Editando sección seleccionada", "info");
    }
    if (action === "delete") {
      try {
        store.deleteSection(id);
        setMessage(sectionFeedback, "Sección eliminada", "success");
      } catch (error) {
        setMessage(
          sectionFeedback,
          error instanceof Error ? error.message : "Sin permisos para eliminar",
          "error"
        );
      }
      render();
    }
  });

  teamForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(teamForm);
    const memberId = String(formData.get("memberId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const baseData = {
      name,
      role: String(formData.get("role") ?? "").trim(),
      image: String(formData.get("image") ?? "").trim(),
      shortBio: String(formData.get("shortBio") ?? "").trim(),
      bio: parseParagraphs(String(formData.get("bio") ?? "")),
      focus: String(formData.get("focus") ?? "").trim(),
      expertise: parseCommaSeparated(String(formData.get("expertise") ?? "")),
      highlights: parseCommaSeparated(String(formData.get("highlights") ?? "")),
      socials: [
        { field: "social-instagram", platform: "instagram" },
        { field: "social-facebook", platform: "facebook" },
        { field: "social-linkedin", platform: "linkedin" },
        { field: "social-web", platform: "web" },
      ]
        .map(({ field, platform }) => {
          const url = String(formData.get(field) ?? "").trim();
          if (!url) return null;
          return {
            platform,
            label: buildSocialLabel(platform, name || "Integrante"),
            url,
          };
        })
        .filter(Boolean) as ManagedTeamMember["socials"],
    };
    const status = String(formData.get("status") ?? "draft") as SectionStatus;
    try {
      if (memberId) {
        const updates: Partial<ManagedTeamMember> & { status?: SectionStatus } = {
          ...baseData,
        };
        if (store.canPublish()) {
          updates.status = status;
        }
        store.updateTeamMember(memberId, updates);
        setMessage(teamFeedback, "Perfil actualizado", "success");
      } else {
        const effectiveStatus = store.canPublish() ? status : "draft";
        store.createTeamMember({
          ...baseData,
          status: effectiveStatus,
        });
        setMessage(teamFeedback, "Integrante creado", "success");
      }
      teamForm.reset();
      cancelTeamEditBtn?.classList.add("hidden");
    } catch (error) {
      setMessage(
        teamFeedback,
        error instanceof Error ? error.message : "No fue posible guardar el perfil",
        "error"
      );
    }
    render();
  });

  cancelTeamEditBtn?.addEventListener("click", () => {
    teamForm?.reset();
    cancelTeamEditBtn.classList.add("hidden");
    setMessage(teamFeedback, "Edición cancelada", "info");
  });

  teamList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!id) return;
    if (action === "edit-team") {
      const state = store.getState();
      const member = state.teamMembers.find((item) => item.id === id);
      if (!member || !teamForm) return;
      const idField = teamForm.querySelector<HTMLInputElement>("[name=memberId]");
      const nameField = teamForm.querySelector<HTMLInputElement>("[name=name]");
      const roleField = teamForm.querySelector<HTMLInputElement>("[name=role]");
      const imageField = teamForm.querySelector<HTMLInputElement>("[name=image]");
      const shortBioField = teamForm.querySelector<HTMLTextAreaElement>("[name=shortBio]");
      const bioField = teamForm.querySelector<HTMLTextAreaElement>("[name=bio]");
      const focusField = teamForm.querySelector<HTMLInputElement>("[name=focus]");
      const expertiseField = teamForm.querySelector<HTMLInputElement>("[name=expertise]");
      const highlightsField = teamForm.querySelector<HTMLInputElement>("[name=highlights]");
      const statusField = teamForm.querySelector<HTMLSelectElement>("[name=status]");
      const socialInstagram = teamForm.querySelector<HTMLInputElement>(
        "[name=\"social-instagram\"]"
      );
      const socialFacebook = teamForm.querySelector<HTMLInputElement>(
        "[name=\"social-facebook\"]"
      );
      const socialLinkedin = teamForm.querySelector<HTMLInputElement>(
        "[name=\"social-linkedin\"]"
      );
      const socialWeb = teamForm.querySelector<HTMLInputElement>("[name=\"social-web\"]");
      if (idField) idField.value = member.id;
      if (nameField) nameField.value = member.name;
      if (roleField) roleField.value = member.role;
      if (imageField) imageField.value = member.image;
      if (shortBioField) shortBioField.value = member.shortBio;
      if (bioField) bioField.value = member.bio.join("\n");
      if (focusField) focusField.value = member.focus;
      if (expertiseField) expertiseField.value = member.expertise.join(", ");
      if (highlightsField) highlightsField.value = member.highlights.join(", ");
      if (statusField) statusField.value = member.status;
      const findSocial = (platform: string) =>
        member.socials.find((item) => item.platform === platform)?.url ?? "";
      if (socialInstagram) socialInstagram.value = findSocial("instagram");
      if (socialFacebook) socialFacebook.value = findSocial("facebook");
      if (socialLinkedin) socialLinkedin.value = findSocial("linkedin");
      if (socialWeb) socialWeb.value = findSocial("web");
      cancelTeamEditBtn?.classList.remove("hidden");
      setMessage(teamFeedback, "Editando integrante seleccionado", "info");
    }
    if (action === "delete-team") {
      try {
        store.deleteTeamMember(id);
        setMessage(teamFeedback, "Integrante eliminado", "success");
      } catch (error) {
        setMessage(
          teamFeedback,
          error instanceof Error ? error.message : "No fue posible eliminar",
          "error"
        );
      }
      render();
    }
  });

  eventForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(eventForm);
    const eventId = String(formData.get("eventId") ?? "");
    const baseData = {
      title: String(formData.get("title") ?? "").trim(),
      shortDescription: String(formData.get("shortDescription") ?? "").trim(),
      description: parseParagraphs(String(formData.get("description") ?? "")),
      date: String(formData.get("date") ?? "").trim(),
      image: String(formData.get("image") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      tags: parseCommaSeparated(String(formData.get("tags") ?? "")),
    };
    const status = String(formData.get("status") ?? "draft") as SectionStatus;
    try {
      if (eventId) {
        const updates: Partial<ManagedEvent> & { status?: SectionStatus } = {
          ...baseData,
        };
        if (store.canPublish()) {
          updates.status = status;
        }
        store.updateEvent(eventId, updates);
        setMessage(eventFeedback, "Evento actualizado", "success");
      } else {
        const effectiveStatus = store.canPublish() ? status : "draft";
        store.createEvent({
          ...baseData,
          status: effectiveStatus,
        });
        setMessage(eventFeedback, "Evento creado", "success");
      }
      eventForm.reset();
      cancelEventEditBtn?.classList.add("hidden");
    } catch (error) {
      setMessage(
        eventFeedback,
        error instanceof Error ? error.message : "No fue posible guardar el evento",
        "error"
      );
    }
    render();
  });

  cancelEventEditBtn?.addEventListener("click", () => {
    eventForm?.reset();
    cancelEventEditBtn.classList.add("hidden");
    setMessage(eventFeedback, "Edición cancelada", "info");
  });

  eventList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!id) return;
    if (action === "edit-event") {
      const state = store.getState();
      const record = state.events.find((item) => item.id === id);
      if (!record || !eventForm) return;
      const idField = eventForm.querySelector<HTMLInputElement>("[name=eventId]");
      const titleField = eventForm.querySelector<HTMLInputElement>("[name=title]");
      const shortDescField = eventForm.querySelector<HTMLTextAreaElement>(
        "[name=shortDescription]"
      );
      const descField = eventForm.querySelector<HTMLTextAreaElement>("[name=description]");
      const dateField = eventForm.querySelector<HTMLInputElement>("[name=date]");
      const imageField = eventForm.querySelector<HTMLInputElement>("[name=image]");
      const locationField = eventForm.querySelector<HTMLInputElement>("[name=location]");
      const tagsField = eventForm.querySelector<HTMLInputElement>("[name=tags]");
      const statusField = eventForm.querySelector<HTMLSelectElement>("[name=status]");
      if (idField) idField.value = record.id;
      if (titleField) titleField.value = record.title;
      if (shortDescField) shortDescField.value = record.shortDescription;
      if (descField) descField.value = record.description.join("\n");
      if (dateField) dateField.value = record.date.slice(0, 10);
      if (imageField) imageField.value = record.image;
      if (locationField) locationField.value = record.location;
      if (tagsField) tagsField.value = record.tags.join(", ");
      if (statusField) statusField.value = record.status;
      cancelEventEditBtn?.classList.remove("hidden");
      setMessage(eventFeedback, "Editando evento seleccionado", "info");
    }
    if (action === "delete-event") {
      try {
        store.deleteEvent(id);
        setMessage(eventFeedback, "Evento eliminado", "success");
      } catch (error) {
        setMessage(
          eventFeedback,
          error instanceof Error ? error.message : "No fue posible eliminar",
          "error"
        );
      }
      render();
    }
  });

  userForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(userForm);
    const payload = {
      username: String(formData.get("username") ?? "").trim(),
      password: String(formData.get("password") ?? "").trim(),
      role: String(formData.get("role") ?? ROLES[0]),
    };
    try {
      store.createUser(payload);
      userForm.reset();
      setMessage(userFeedback, "Usuario creado", "success");
    } catch (error) {
      setMessage(
        userFeedback,
        error instanceof Error ? error.message : "No fue posible crear el usuario",
        "error"
      );
    }
    render();
  });

  userList?.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (action === "remove-user" && id) {
      try {
        store.deleteUser(id);
        setMessage(userFeedback, "Usuario eliminado", "success");
      } catch (error) {
        setMessage(
          userFeedback,
          error instanceof Error ? error.message : "No fue posible eliminar",
          "error"
        );
      }
      render();
    }
  });

  store.subscribe(render);
  render();
}

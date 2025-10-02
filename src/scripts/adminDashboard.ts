import { createAdminStore, ROLES } from "../utils/adminStore";

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
  const cancelEditBtn = document.querySelector<HTMLButtonElement>("#cancel-edit");
  const userManagement = document.querySelector<HTMLElement>("#user-management");
  const userForm = document.querySelector<HTMLFormElement>("#user-form");
  const userList = document.querySelector<HTMLElement>("#user-list");
  const userFeedback = document.querySelector<HTMLElement>("#user-feedback");

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

  const render = () => {
    const state = store.getState();
    const activeUser = state.users.find((user) => user.id === state.currentUserId) ?? null;
    const isAuthenticated = Boolean(activeUser);

    setHidden(loginView, isAuthenticated);
    setHidden(dashboard, !isAuthenticated);
    if (!isAuthenticated) {
      loginForm?.reset();
      setMessage(loginError, "", "info");
      return;
    }

    if (currentUser && activeUser) {
      currentUser.textContent = `${activeUser.username} · ${activeUser.role}`;
    }

    const canManageUsers = store.canManageUsers();
    setHidden(userManagement, !canManageUsers);

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
                <h4 class="font-semibold text-teal-200">${section.title}</h4>
                <p class="mt-1 text-xs uppercase tracking-wide text-slate-500">${
                  section.status === "published" ? "Publicado" : "Borrador"
                }</p>
                <p class="mt-2 text-xs text-slate-500">Última actualización: ${new Date(
                  section.updatedAt
                ).toLocaleString()}</p>
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
            <p class="mt-3 text-sm text-slate-300">${section.content}</p>
          `;
          sectionList.appendChild(item);
        });
    }

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
              <p class="font-semibold text-slate-100">${user.username}</p>
              <p class="text-xs uppercase tracking-wide text-slate-500">${user.role}</p>
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
    userForm?.reset();
    render();
  });

  sectionForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(sectionForm);
    const sectionId = String(formData.get("sectionId") ?? "");
    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      content: String(formData.get("content") ?? "").trim(),
      status: String(formData.get("status") ?? "draft") as "draft" | "published",
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
      cancelEditBtn?.classList.add("hidden");
    } catch (error) {
      setMessage(
        sectionFeedback,
        error instanceof Error ? error.message : "No fue posible guardar",
        "error"
      );
    }
    render();
  });

  cancelEditBtn?.addEventListener("click", () => {
    sectionForm?.reset();
    cancelEditBtn.classList.add("hidden");
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
      const contentField = sectionForm.querySelector<HTMLTextAreaElement>("[name=content]");
      const statusField = sectionForm.querySelector<HTMLSelectElement>("[name=status]");
      if (idField) idField.value = section.id;
      if (titleField) titleField.value = section.title;
      if (contentField) contentField.value = section.content;
      if (statusField) statusField.value = section.status;
      cancelEditBtn?.classList.remove("hidden");
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

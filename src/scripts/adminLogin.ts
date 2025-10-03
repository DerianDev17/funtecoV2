import { createStrapiAdmin } from "../utils/strapiAdmin";
import type { StorageLike } from "../utils/adminStore";

export interface AdminLoginOptions {
  document?: Document;
  storage?: StorageLike;
  navigate?: (path: string) => void;
}

type MessageKind = "info" | "error" | "success";

const getDocument = (doc?: Document) => {
  if (doc) return doc;
  if (typeof document !== "undefined") return document;
  return undefined;
};

const getStorage = (storage?: StorageLike) => {
  if (storage) return storage;
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return undefined;
};

const defaultNavigate = (path: string) => {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
};

const setMessage = (element: HTMLElement | null, message: string, type: MessageKind = "info") => {
  if (!element) return;
  if (!message) {
    element.classList.add("hidden");
    element.textContent = "";
    element.classList.remove("border-rose-500/40", "text-rose-200", "border-teal-500/40", "text-teal-200");
    return;
  }
  element.textContent = message;
  element.classList.remove("hidden");
  element.classList.toggle("border-rose-500/40", type === "error");
  element.classList.toggle("text-rose-200", type === "error");
  element.classList.toggle("border-teal-500/40", type === "success");
  element.classList.toggle("text-teal-200", type === "success");
  if (type === "info") {
    element.classList.remove("border-rose-500/40", "text-rose-200", "border-teal-500/40", "text-teal-200");
  }
};

export const setupAdminLogin = (options: AdminLoginOptions = {}) => {
  const doc = getDocument(options.document);
  if (!doc) return;
  const root = doc.querySelector<HTMLElement>("#admin-login-app");
  if (!root) return;

  const loginForm = doc.querySelector<HTMLFormElement>("#login-form");
  const loginError = doc.querySelector<HTMLElement>("#login-error");
  const storage = getStorage(options.storage);
  const navigate = options.navigate ?? defaultNavigate;
  const store = createStrapiAdmin(storage);

  const redirectIfAuthenticated = () => {
    const currentUser = store.modules.usersRolesPermissions.currentUser();
    if (currentUser) {
      setMessage(loginError, "", "info");
      navigate("/admin");
      return true;
    }
    return false;
  };

  if (redirectIfAuthenticated()) {
    return { store };
  }

  root.dataset.state = "ready";

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
      setMessage(loginError, "Introduce un usuario y contraseña válidos.", "error");
      return;
    }

    if (password.length < 6) {
      setMessage(loginError, "La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    try {
      store.login(username, password);
      loginForm.reset();
      setMessage(loginError, "", "info");
      navigate("/admin");
    } catch (error) {
      console.warn("Intento de acceso no autorizado", error);
      setMessage(loginError, "Credenciales incorrectas.", "error");
    }
  });

  return { store };
};

if (typeof window !== "undefined") {
  setupAdminLogin();
}

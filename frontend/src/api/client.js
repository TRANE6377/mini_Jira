const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseError(res) {
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = await res.text().catch(() => null);
  }
  const message =
    (payload && payload.detail && String(payload.detail)) ||
    (typeof payload === "string" && payload) ||
    `Request failed (${res.status})`;
  throw new ApiError(message, res.status, payload);
}

export async function apiFetch(path, { token, method = "GET", headers, body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  });
  if (!res.ok) await parseError(res);
  if (res.status === 204) return null;
  return await res.json();
}

export async function register({ email, password }) {
  return await apiFetch("/auth/register", { method: "POST", body: { email, password } });
}

export async function login({ email, password }) {
  // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded fields: username & password
  const data = new URLSearchParams();
  data.set("username", email);
  data.set("password", password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data.toString(),
  });
  if (!res.ok) await parseError(res);
  return await res.json();
}

export async function getTasks(token) {
  return await apiFetch("/tasks", { token });
}

export async function createTask(token, payload) {
  return await apiFetch("/tasks", { token, method: "POST", body: payload });
}

export async function updateTask(token, id, payload) {
  return await apiFetch(`/tasks/${id}`, { token, method: "PUT", body: payload });
}

export async function deleteTask(token, id) {
  return await apiFetch(`/tasks/${id}`, { token, method: "DELETE" });
}


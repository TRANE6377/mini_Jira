import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function useMode(modeProp) {
  return useMemo(() => (modeProp === "register" ? "register" : "login"), [modeProp]);
}

export default function AuthPage({ mode: modeProp }) {
  const mode = useMode(modeProp);
  const nav = useNavigate();
  const { login: saveToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const title = mode === "register" ? "Создать аккаунт" : "С возвращением";
  const subtitle =
    mode === "register"
      ? "Зарегистрируйтесь, чтобы начать вести задачи."
      : "Войдите, чтобы открыть доску.";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register({ email, password });
      }
      const token = await login({ email, password });
      saveToken(token.access_token);
      nav("/board");
    } catch (err) {
      setError(err?.message || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authHeader">
          <div className="brand">Task Tracker</div>
          <h1 className="h1">{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Email
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="label">
            Пароль
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
              minLength={3}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="button primary" disabled={loading}>
            {loading ? "Подождите..." : mode === "register" ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>

        <div className="authFooter">
          {mode === "register" ? (
            <span className="muted">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </span>
          ) : (
            <span className="muted">
              Впервые здесь? <Link to="/register">Создать аккаунт</Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


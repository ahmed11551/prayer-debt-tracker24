import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Импортируем утилиты для тестирования API (только в dev режиме)
if (import.meta.env.DEV) {
  import("./lib/api-test");
}

// Обработка ошибок при инициализации
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to initialize app:", error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; color: hsl(42 50% 95%); text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Ошибка загрузки приложения</h1>
        <p style="margin-bottom: 8px;">Произошла ошибка при инициализации приложения.</p>
        <p style="font-size: 14px; opacity: 0.8;">Пожалуйста, обновите страницу или попробуйте позже.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: hsl(42 65% 50%); color: hsl(30 40% 20%); border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Обновить страницу
        </button>
      </div>
    `;
  }
}

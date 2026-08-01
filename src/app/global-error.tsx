"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1rem",
          background: "#0a0a0b",
          color: "#edeae3",
          fontFamily: "sans-serif",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Ошибка сервера
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#8a8578", marginBottom: "1.5rem" }}>
            {error.message || "Что-то пошло не так. Попробуйте снова."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.5rem",
              background: "transparent",
              border: "1px solid rgba(212, 175, 55, 0.55)",
              color: "#e3c15c",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
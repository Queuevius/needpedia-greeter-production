import { ReactNode } from "react";

const requiredEnvVars = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_BASE_URL",
  "PROMPT_API_TOKEN",
  "PROMPT_AI_TYPE",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_MAX_TOKENS",
  "NEXT_PUBLIC_INITIAL_MESSAGE_TEXT",
];

export default function EnvCheck({ children }: { children: ReactNode }) {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 600,
            background: "#fff",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "2rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            ⚠️ Missing Environment Variables
          </h1>
          <p style={{ marginBottom: "1rem", color: "#b91c1c" }}>
            The following required environment variables are not set:
          </p>
          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "1.5rem",
              marginBottom: "1.5rem",
              color: "#dc2626",
              fontWeight: 600,
            }}
          >
            {missing.map((key) => (
              <li key={key} style={{ marginBottom: "0.25rem" }}>
                {key}
              </li>
            ))}
          </ul>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Please add these to your <code>.env</code> file and restart the
            server.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

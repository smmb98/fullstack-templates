/** Tailwind preset: every value points at a semantic CSS variable. */
module.exports = {
  theme: {
    extend: {
      colors: {
        page: "var(--bg)",
        subtle: "var(--bg-subtle)",
        surface: "var(--surface)",
        raised: "var(--surface-raised)",
        ink: "var(--fg)",
        muted: "var(--fg-muted)",
        line: "var(--border)",
        primary: "var(--primary)",
        "on-primary": "var(--primary-fg)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        focus: "var(--focus-ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
      },
    },
  },
};

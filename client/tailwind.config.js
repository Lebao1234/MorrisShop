/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "2rem", xl: "3.5rem" },
      screens: { "2xl": "1500px" },
    },
    extend: {
      /*
       * Thang opacity day du 0-100 de dung duoc cac buoc tinh te nhu ink/12,
       * bone/45 - can thiet cho lop bong va duong hairline cua thiet ke nay.
       */
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [String(i), String(i / 100)]),
      ),
      colors: {
        /* Bang mau Editorial Luxury - trung tinh am + mot mau nhan dong */
        ink: {
          DEFAULT: "#0B0B0B",
          soft: "#1A1917",
          muted: "#3A3831",
          faint: "#6E6A5F",
        },
        bone: {
          DEFAULT: "#F7F5F0",
          warm: "#EFEBE2",
          deep: "#E2DCD0",
        },
        copper: {
          DEFAULT: "#B08D57",
          light: "#C9A97A",
          dark: "#8E6F41",
        },
        moss: "#4A5340",

        /* Token cho shadcn/ui */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        /* Serif bien tap cho tieu de, grotesk cao cap cho noi dung */
        display: ['"Playfair Display"', "Georgia", "Cambria", "serif"],
        sans: ['"Plus Jakarta Sans"', "SF Pro Text", "Segoe UI", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "SFMono-Regular", "Consolas", "monospace"],
      },
      fontSize: {
        /* Thang chu bien tap - tieu de lon co chu dich */
        "display-sm": ["clamp(2.25rem, 5vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(3rem, 7vw, 5rem)", { lineHeight: "0.98", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(3.75rem, 10vw, 8rem)", { lineHeight: "0.92", letterSpacing: "-0.035em" }],
        eyebrow: ["0.625rem", { lineHeight: "1", letterSpacing: "0.28em" }],
      },
      letterSpacing: {
        editorial: "0.22em",
        wideish: "0.14em",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        38: "9.5rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        bezel: "2rem",
        "bezel-inner": "calc(2rem - 0.375rem)",
      },
      boxShadow: {
        /* Bong khuech tan mem - khong dung shadow-md mac dinh */
        ambient: "0 24px 60px -30px rgba(11,11,11,0.28), 0 4px 14px -8px rgba(11,11,11,0.12)",
        lift: "0 40px 90px -40px rgba(11,11,11,0.42), 0 8px 20px -12px rgba(11,11,11,0.16)",
        inset: "inset 0 1px 1px rgba(255,255,255,0.55)",
        "inset-dark": "inset 0 1px 1px rgba(255,255,255,0.08)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.32, 0.72, 0, 1)",
        "spring-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: { 400: "400ms", 600: "600ms", 800: "800ms", 1200: "1200ms" },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "marquee-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-rise": {
          from: { opacity: "0", transform: "translateY(1.25rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.32s cubic-bezier(0.32,0.72,0,1)",
        "accordion-up": "accordion-up 0.32s cubic-bezier(0.32,0.72,0,1)",
        marquee: "marquee-x 38s linear infinite",
        "fade-rise": "fade-rise 0.7s cubic-bezier(0.32,0.72,0,1) both",
      },
      backgroundImage: {
        "grain-fallback": "none",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

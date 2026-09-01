/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 ZAPTRO — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/zaptro                      ║
 * ║   youtube  ──  https://youtube.com/@ZAPTRO                   ║
 * ║   github   ──  https://github.com/ZAPTRO                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        red: {
          50: '#fff3eb',
          100: '#ffe5d4',
          200: '#ffc8a8',
          300: '#ffa170',
          400: '#ff7038',
          500: '#FC5824', // Koya Orange
          600: '#e04616',
          700: '#bd330f',
          800: '#962b12',
          900: '#792512',
          950: '#410f06',
        },
        kgray: {
          50: '#525359',
          100: '#4e4f55',
          200: '#4a4b52',
          300: '#46474e',
          400: '#42434a',
          500: '#3f4048',
          600: '#3e3f45',
          625: '#3a3b41',
          650: '#393a41',
          675: '#36373e',
          680: '#323339',
          700: '#2c2d32',
          800: '#2b2c32',
          850: '#242429',
          900: '#202225',
        },
        primary: {
          DEFAULT: "#ffffff",
          hover: "#e2e8f0",
          glow: "rgba(255, 255, 255, 0.15)",
        },
        secondary: {
          DEFAULT: "#202225",
          light: "#2b2c32",
        },
        accent: {
          neutral: "rgba(255, 255, 255, 0.05)",
          glass: "rgba(255, 255, 255, 0.03)",
        }
      },
      spacing: {
        '75': '300px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

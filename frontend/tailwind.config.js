/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#eff6ff',
                    DEFAULT: '#3b82f6',
                    dark: '#1d4ed8',
                },
                sidebar: {
                    bg: '#0f172a',
                    active: 'rgba(255, 255, 255, 0.1)',
                    text: '#e2e8f0',
                },
                bg: {
                    body: '#f3f4f6',
                    surface: '#ffffff',
                    dark: '#0f172a',
                    darkSurface: '#1e293b',
                },
                status: {
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    info: '#06b6d4',
                    purple: '#8b5cf6',
                }
            },
            fontFamily: {
                sans: ['"DM Sans"', '"Inter"', 'sans-serif'],
            },
        },
    },
    plugins: [],
    darkMode: ['class', '[data-theme="dark"]'],
}

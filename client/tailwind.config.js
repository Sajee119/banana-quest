/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                banana: {
                50: '#FFFCEB', 100: '#FFF6C2', 200: '#FFEC85',
                300: '#FFDD48', 400: '#FFCB1F', 500: '#F5A800',
                600: '#D98500', 700: '#B56000', 800: '#8F4500',
                900: '#6B3200',
                },
            },
            fontFamily: {
                display: ['"Baloo 2"', 'cursive'],
                body: ['"Nunito"', 'sans-serif'],
            },
            boxShadow: {
                game: '0 10px 0 rgba(0,0,0,0.2), 0 20px 40px rgba(0,0,0,0.15)',
                'game-sm': '0 4px 0 rgba(0,0,0,0.2)',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                pop: {
                    '0%': { transform: 'scale(0.8)', opacity: '0' },
                    '60%': { transform: 'scale(1.1)', opacity: '1' },
                    '100%': { transform: 'scale(1)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-8px)' },
                    '75%': { transform: 'translateX(8px)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                shine: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            animation: {
                wiggle: 'wiggle 1.5s ease-in-out infinite',
                pop: 'pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                shake: 'shake 0.4s ease-in-out',
                float: 'float 3s ease-in-out infinite',
                shine: 'shine 2s linear infinite',
            },
        },
    },
    plugins: [],
};
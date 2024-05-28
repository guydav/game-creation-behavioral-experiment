module.exports = {
    purge:  ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {},
        maxWidth: {
            '90': '90%',
        },
    },
    variants: {
        extend: {
            textColor: ['visited'],
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio'),
    ],
}
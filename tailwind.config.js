module.exports = {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'weather-primary': '#00668A',
				'weather-secondary': '#004E71',
				'weather-tertiary': '#037ba3',
			},
		},
		fontFamily: {
			Roboto: ['Roboto, sans-serif'],
		},
		container: {
			padding: '2rem',
			center: true,
		},
		screens: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
		},
	},
	plugins: [require('tailwind-scrollbar')],
};

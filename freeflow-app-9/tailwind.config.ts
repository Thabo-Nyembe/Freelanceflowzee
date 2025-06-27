import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			gray: {
  				50: 'rgb(249, 250, 251)',
  				100: 'rgb(243, 244, 246)',
  				200: 'rgb(229, 231, 235)',
  				300: 'rgb(209, 213, 219)',
  				400: 'rgb(156, 163, 175)',
  				500: 'rgb(107, 114, 128)',
  				600: 'rgb(75, 85, 99)',
  				700: 'rgb(55, 65, 81)',
  				800: 'rgb(31, 41, 55)',
  				900: 'rgb(17, 24, 39)',
  				950: 'rgb(3, 7, 18)',
  			},
  			slate: {
  				50: 'rgb(248, 250, 252)',
  				100: 'rgb(241, 245, 249)',
  				200: 'rgb(226, 232, 240)',
  				300: 'rgb(203, 213, 225)',
  				400: 'rgb(148, 163, 184)',
  				500: 'rgb(100, 116, 139)',
  				600: 'rgb(71, 85, 105)',
  				700: 'rgb(51, 65, 85)',
  				800: 'rgb(30, 41, 59)',
  				900: 'rgb(15, 23, 42)',
  				950: 'rgb(2, 6, 23)',
  			},
  			rose: {
  				50: 'rgb(255, 241, 242)',
  				100: 'rgb(255, 228, 230)',
  				200: 'rgb(254, 205, 211)',
  				300: 'rgb(253, 164, 175)',
  				400: 'rgb(251, 113, 133)',
  				500: 'rgb(244, 63, 94)',
  				600: 'rgb(225, 29, 72)',
  				700: 'rgb(190, 18, 60)',
  				800: 'rgb(159, 18, 57)',
  				900: 'rgb(136, 19, 55)',
  				950: 'rgb(76, 5, 25)',
  			},
  			violet: {
  				50: 'rgb(245, 243, 255)',
  				100: 'rgb(237, 233, 254)',
  				200: 'rgb(221, 214, 254)',
  				300: 'rgb(196, 181, 253)',
  				400: 'rgb(167, 139, 250)',
  				500: 'rgb(139, 92, 246)',
  				600: 'rgb(124, 58, 237)',
  				700: 'rgb(109, 40, 217)',
  				800: 'rgb(91, 33, 182)',
  				900: 'rgb(76, 29, 149)',
  				950: 'rgb(46, 16, 101)',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))','
  				'2': 'hsl(var(--chart-2))','
  				'3': 'hsl(var(--chart-3))','
  				'4': 'hsl(var(--chart-4))','
  				'5': 'hsl(var(--chart-5))
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))', 'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))', 'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			}, 'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out', 'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

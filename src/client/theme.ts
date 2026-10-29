import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Palette "brand" costruita sul colore primario dell'app (#032D42).
const config = defineConfig({
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: '#e8f1f5' },
                    100: { value: '#c7dbe5' },
                    200: { value: '#9cbfcf' },
                    300: { value: '#6b9eb4' },
                    400: { value: '#3f7f99' },
                    500: { value: '#1f6380' },
                    600: { value: '#114b66' },
                    700: { value: '#073a52' },
                    800: { value: '#032d42' },
                    900: { value: '#021f2e' },
                    950: { value: '#01131c' },
                },
            },
        },
        semanticTokens: {
            colors: {
                brand: {
                    solid: { value: '{colors.brand.800}' },
                    contrast: { value: 'white' },
                    fg: { value: '{colors.brand.700}' },
                    muted: { value: '{colors.brand.100}' },
                    subtle: { value: '{colors.brand.50}' },
                    emphasized: { value: '{colors.brand.200}' },
                    focusRing: { value: '{colors.brand.500}' },
                },
            },
        },
    },
    globalCss: {
        body: { bg: 'bg.subtle', color: 'fg' },
    },
})

export const system = createSystem(defaultConfig, config)

// Colori dei grafici: slot categorici e di stato della palette validata (dataviz).
export const chartColors = {
    series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    good: '#0ca30c',
    warning: '#fab219',
    serious: '#ec835a',
    critical: '#d03b3b',
    grid: '#e4e4e7',
    axis: '#71717a',
}

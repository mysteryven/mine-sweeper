import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
import presetIcons from '@unocss/preset-icons'


import WindiCSS from 'vite-plugin-windicss'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Unocss()
  ]
})

import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

const csp: Plugin = {
  name: 'feasto-csp',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
  ],
}

export default defineConfig({
  plugins: [
    react(),
    csp,
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Feasto',
        short_name: 'Feasto',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [{ src: 'feasto-512.png', sizes: '512x512', type: 'image/png' }],
      },
    }),
  ],
})
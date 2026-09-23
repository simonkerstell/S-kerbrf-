import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Säker BRF',
    short_name: 'Säker BRF',
    description: 'Digital verifikationsplattform för bostadsrättsföreningar',
    start_url: '/projekt',
    display: 'standalone',
    background_color: '#172554',
    theme_color: '#172554',
    lang: 'sv',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

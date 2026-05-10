import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chope & Take',
    short_name: 'Chope',
    description:
      'Internal platform for sharing pre-loved items and surplus food within your agency',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f7faf8',
    theme_color: '#3d8b6e',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any maskable',
      },
    ],
  }
}

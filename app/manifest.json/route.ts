import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "TreeShop",
    short_name: "TreeShop",
    description: "Professional tree service management platform",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#007AFF",
    background_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any"
      }
    ],
    categories: ["business", "productivity"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View your business dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      },
      {
        name: "Equipment",
        short_name: "Equipment",
        description: "Manage equipment",
        url: "/dashboard/equipment",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      },
      {
        name: "Calculators",
        short_name: "Calculators",
        description: "Pricing calculators",
        url: "/dashboard/calculators",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "L&PMakeUp",
    short_name: "L&PMakeUp",
    description:
      "Loja online de maquiagem profissional com preços imbatíveis. Cílios, delineadores, gloss e paletas a partir de R$ 6,99.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#9b1b5a",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

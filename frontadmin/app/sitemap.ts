import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}/admin/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.2,
    },
  ];
}

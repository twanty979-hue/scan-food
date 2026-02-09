// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pos-foodscan.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`, // ถ้ามีหน้าสมัครสมาชิก
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ใส่หน้าอื่นๆ เพิ่มตรงนี้
  ]
}
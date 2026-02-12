import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pos-foodscan.com'

  const routes = [
    '',
    '/features',
    '/pricing',
    '/manual',
    '/login',
    '/register',
    '/terms',
    '/privacy',
    '/refund',
  ]

  return routes.map((route) => {
    let priority = 0.7
    
    // 🔥 แก้ตรงนี้ครับ: เติม | 'yearly' เข้าไป
    let changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'

    if (route === '') {
      priority = 1.0
      changeFrequency = 'daily'
    } else if (['/features', '/pricing'].includes(route)) {
      priority = 0.9
      changeFrequency = 'weekly'
    } else if (['/terms', '/privacy', '/refund'].includes(route)) {
      priority = 0.5
      changeFrequency = 'yearly'
    }

    return {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }
  })
}
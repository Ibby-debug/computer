import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
} from '../../shared/seo'

type DocumentSeo = {
  title?: string
  description?: string
  canonicalPath?: string
}

const META_SELECTOR = (key: string, attribute: 'name' | 'property') =>
  `meta[${attribute}="${key}"]`

function upsertMeta(key: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(META_SELECTOR(key, attribute))

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = content
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }

  element.href = href
}

function upsertJsonLd(data: Record<string, unknown>) {
  const id = 'tai-news-jsonld'
  let element = document.getElementById(id) as HTMLScriptElement | null

  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

export function applyDocumentSeo({ title, description, canonicalPath = '/' }: DocumentSeo = {}) {
  const resolvedTitle = title ?? DEFAULT_TITLE
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const origin = window.location.origin
  const canonicalUrl = absoluteUrl(origin, canonicalPath)
  const imageUrl = absoluteUrl(origin, DEFAULT_OG_IMAGE_PATH)

  document.title = resolvedTitle

  upsertMeta('description', resolvedDescription)
  upsertMeta('robots', 'index, follow')
  upsertCanonical(canonicalUrl)

  upsertMeta('og:type', 'website', 'property')
  upsertMeta('og:site_name', SITE_NAME, 'property')
  upsertMeta('og:title', resolvedTitle, 'property')
  upsertMeta('og:description', resolvedDescription, 'property')
  upsertMeta('og:url', canonicalUrl, 'property')
  upsertMeta('og:image', imageUrl, 'property')
  upsertMeta('og:image:alt', DEFAULT_OG_IMAGE_ALT, 'property')
  upsertMeta('og:locale', 'en_US', 'property')

  upsertMeta('twitter:card', 'summary_large_image')
  upsertMeta('twitter:title', resolvedTitle)
  upsertMeta('twitter:description', resolvedDescription)
  upsertMeta('twitter:image', imageUrl)
  upsertMeta('twitter:image:alt', DEFAULT_OG_IMAGE_ALT)

  upsertJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: SITE_NAME,
        description: resolvedDescription,
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebApplication',
        '@id': `${canonicalUrl}#app`,
        name: SITE_NAME,
        url: canonicalUrl,
        description: resolvedDescription,
        applicationCategory: 'NewsApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  })
}

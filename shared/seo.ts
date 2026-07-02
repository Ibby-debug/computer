export const SITE_NAME = 'TAI News'

export const SITE_TAGLINE = 'Trending news read aloud by AI voices'

export const DEFAULT_TITLE = `Trending News — ${SITE_NAME}`

export const DEFAULT_DESCRIPTION =
  'Listen to trending headlines across US, global, crypto, tech, politics, sports, and more. TAI News curates top stories and reads them aloud with AI narrators, updated every few hours.'

export const DEFAULT_OG_IMAGE_PATH = '/logo.svg'

export const DEFAULT_OG_IMAGE_ALT = 'TAI News logo'

export const THEME_COLOR = '#194F82'

export function buildTopicTitle(topicLabel: string): string {
  return `${topicLabel} News — ${SITE_NAME}`
}

export function buildTrendsTitle(topicLabel: string, leadHeadline?: string): string {
  if (leadHeadline) {
    return `${topicLabel} News: ${leadHeadline} — ${SITE_NAME}`
  }
  return buildTopicTitle(topicLabel)
}

export function buildTrendsDescription(
  topicLabel: string,
  headlines: { title: string }[],
): string {
  const preview = headlines
    .slice(0, 3)
    .map((headline) => headline.title)
    .join(' · ')

  if (!preview) {
    return `${topicLabel} trending news read aloud. ${DEFAULT_DESCRIPTION}`
  }

  return `${topicLabel} trending news read aloud: ${preview}`
}

export function absoluteUrl(origin: string, path: string): string {
  return new URL(path, origin).href
}

import type { TrendsPayload } from '../types/trends'
import { sourceForStory } from '../utils/sourceForStory'

type HeadlineMarqueeProps = {
  headlines: TrendsPayload['topics']
  sources: TrendsPayload['sources']
  loading?: boolean
}

function MarqueeItems({
  headlines,
  sources,
}: {
  headlines: TrendsPayload['topics']
  sources: TrendsPayload['sources']
}) {
  return (
    <>
      {headlines.map((story, index) => {
        const source = sourceForStory(story, index, sources)
        return (
          <span key={`${story.title}-${index}`} className="headline-marquee__item">
            {source ? (
              <a
                className="headline-marquee__link"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {story.title}
              </a>
            ) : (
              <span>{story.title}</span>
            )}
            <span className="headline-marquee__dot" aria-hidden="true">
              •
            </span>
          </span>
        )
      })}
    </>
  )
}

export function HeadlineMarquee({ headlines, sources, loading }: HeadlineMarqueeProps) {
  if (loading) {
    return (
      <div className="headline-marquee headline-marquee--loading" aria-live="polite">
        <span className="headline-marquee__placeholder">Loading headlines…</span>
      </div>
    )
  }

  if (headlines.length === 0) {
    return (
      <div className="headline-marquee headline-marquee--empty">
        <span className="headline-marquee__placeholder">No headlines available</span>
      </div>
    )
  }

  return (
    <div className="headline-marquee" aria-label="Headlines ticker">
      <div className="headline-marquee__track">
        <div className="headline-marquee__content">
          <MarqueeItems headlines={headlines} sources={sources} />
        </div>
        <div className="headline-marquee__content" aria-hidden="true">
          <MarqueeItems headlines={headlines} sources={sources} />
        </div>
      </div>
    </div>
  )
}

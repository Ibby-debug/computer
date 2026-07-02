import { useState } from 'react'
import { SUPPORT_WALLETS } from '../../shared/support'
import { ChainIcon } from './ChainIcon'

type SupportMarqueeItemsProps = {
  copiedId: string | null
  onCopy: (id: string, address: string) => void
}

function SupportMarqueeItems({ copiedId, onCopy }: SupportMarqueeItemsProps) {
  return (
    <>
      <span className="headline-marquee__item">
        <span className="support-marquee__label">Support this project</span>
        <span className="headline-marquee__dot" aria-hidden="true">
          •
        </span>
      </span>
      {SUPPORT_WALLETS.map((wallet) => (
        <span key={wallet.id} className="headline-marquee__item">
          <ChainIcon chain={wallet.id} />
          <span className="support-marquee__label">{wallet.label}</span>
          <button
            type="button"
            className="headline-marquee__link support-marquee__copy"
            aria-label={`Copy ${wallet.label} address`}
            onClick={() => void onCopy(wallet.id, wallet.address)}
          >
            {copiedId === wallet.id ? 'Copied' : wallet.address}
          </button>
          <span className="headline-marquee__dot" aria-hidden="true">
            •
          </span>
        </span>
      ))}
    </>
  )
}

export function SupportFooter() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (id: string, address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500)
    } catch {
      // Clipboard may be unavailable in some contexts.
    }
  }

  return (
    <footer className="headline-marquee support-marquee" aria-label="Support this project">
      <div className="headline-marquee__track">
        <div className="headline-marquee__content">
          <SupportMarqueeItems copiedId={copiedId} onCopy={handleCopy} />
        </div>
        <div className="headline-marquee__content" aria-hidden="true">
          <SupportMarqueeItems copiedId={copiedId} onCopy={handleCopy} />
        </div>
      </div>
    </footer>
  )
}

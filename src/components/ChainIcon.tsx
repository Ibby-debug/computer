import { useId } from 'react'
import type { SupportWalletId } from '../../shared/support'

type ChainIconProps = {
  chain: SupportWalletId
}

export function ChainIcon({ chain }: ChainIconProps) {
  const gradientId = useId()

  switch (chain) {
    case 'solana':
      return (
        <svg className="support-marquee__icon" viewBox="0 0 16 16" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="2" y1="14" x2="14" y2="2">
              <stop offset="0%" stopColor="#9945FF" />
              <stop offset="100%" stopColor="#14F195" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#${gradientId})`}
            d="M2.2 10.4c-.2-.2-.2-.5 0-.7l1.1-1.1c.2-.2.5-.2.7 0l1.8 1.8 3.6-3.6c.2-.2.5-.2.7 0l1.1 1.1c.2.2.2.5 0 .7l-4.6 4.6c-.2.2-.5.2-.7 0L2.2 10.4zm0-4.1c-.2-.2-.2-.5 0-.7l1.1-1.1c.2-.2.5-.2.7 0l1.8 1.8 3.6-3.6c.2-.2.5-.2.7 0l1.1 1.1c.2.2.2.5 0 .7l-4.6 4.6c-.2.2-.5.2-.7 0L2.2 6.3z"
          />
        </svg>
      )
    case 'ethereum':
      return (
        <svg className="support-marquee__icon" viewBox="0 0 16 16" aria-hidden="true">
          <path fill="#627EEA" d="M8 1 2.5 8.1 8 10.7 13.5 8.1 8 1z" />
          <path fill="#627EEA" fillOpacity="0.6" d="M8 11.4 2.5 8.8 8 15l5.5-6.2-5.5 2.6z" />
        </svg>
      )
    case 'base':
      return (
        <svg className="support-marquee__icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="#0052FF" />
          <path fill="#fff" d="M4.5 8h7v1.2H4.5V8z" />
        </svg>
      )
    case 'sui':
      return (
        <svg className="support-marquee__icon" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="#4DA2FF"
            d="M8 1.5c2.8 2.1 4.7 4.8 4.7 7.5 0 2.8-2.1 5-4.7 5s-4.7-2.2-4.7-5c0-2.7 1.9-5.4 4.7-7.5z"
          />
          <path fill="#fff" fillOpacity="0.35" d="M6.2 8.8c.8-.8 1.8-1.2 2.8-1.2V7c-1.3 0-2.5.5-3.4 1.4l.6.4z" />
        </svg>
      )
  }
}

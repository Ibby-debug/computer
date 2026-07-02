export const SUPPORT_WALLETS = [
  {
    id: 'solana',
    label: 'Solana',
    address: '32Bm4792qbWEYibNdmpqwyatbM5rty3N4dcY2cNF8m4u',
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    address: '0x64Ac7da3457855cA56Dcc2870BfcBF5f80DcAD93',
  },
  {
    id: 'base',
    label: 'Base',
    address: '0x64Ac7da3457855cA56Dcc2870BfcBF5f80DcAD93',
  },
  {
    id: 'sui',
    label: 'Sui',
    address: '0x461821fb9e242240fc2ee758ccd0e7a81540937ed9dd6474c5612cd97bc725b5',
  },
] as const

export type SupportWalletId = (typeof SUPPORT_WALLETS)[number]['id']

import FAQClient from './FAQClient'

export const metadata = {
  title: 'FAQ — SpaceX Stocks | How to Invest in SpaceX',
  description: 'Frequently asked questions about SpaceX Stocks — how to invest in SpaceX shares, weekly returns, crypto deposits, invitation codes, and member perks.',
  keywords: ['SpaceX investment', 'how to invest in SpaceX', 'SpaceX IPO', 'SPCX stock', 'SpaceX shares'],
  openGraph: {
    title: 'FAQ — SpaceX Stocks | How to Invest in SpaceX',
    description: 'Everything you need to know about investing through SpaceX Stocks.',
    url: 'https://www.spacestocks.finance/faq',
    siteName: 'SpaceX Stocks',
    type: 'website',
    images: [{ url: 'https://www.spacestocks.finance/spacex_stocks_og_image.jpg', width: 1200, height: 635 }],
  },
}

export default function FAQPage() {
  return <FAQClient />
}
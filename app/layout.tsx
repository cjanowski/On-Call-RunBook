import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PEII Documentation',
  description: 'Helm Chart and DevOps Troubleshooting Guides',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}


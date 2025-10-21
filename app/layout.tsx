import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'On Call Runbook',
  description: 'Essential DevOps, Kubernetes & Terraform Troubleshooting Guide',
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


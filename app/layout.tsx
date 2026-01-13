import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prateleira 3D - ASICs Antminer S19k Pro',
  description: 'Modelo 3D paramétrico de estantes metálicas para mineração',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

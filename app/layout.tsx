// ============================================
// Root Layout — 暗色电影主题，全局字体 + Navbar
// ============================================
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/ui/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '时光画廊 · Photo Gallery',
  description: '每一张图片都是一次穿越，每一个场景都是一段未曾到达的人生。',
  openGraph: {
    title: '时光画廊 · Photo Gallery',
    description: 'AI 艺术肖像画廊 — 博物馆级在线展览',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}

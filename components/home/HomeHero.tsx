'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'

export function HomeHero() {
    const { t, language } = useLanguage()

    return (
        <section className="relative flex h-[100vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
            {/* ---- Mesh Gradient 背景 ---- */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] -top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-600/40 blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute -right-[10%] top-[10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/40 blur-[120px] mix-blend-screen animate-pulse delay-1000" />
                <div className="absolute left-[20%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/40 blur-[120px] mix-blend-screen animate-pulse delay-2000" />
                <div className="absolute right-[20%] -bottom-[20%] h-[400px] w-[400px] rounded-full bg-cyan-600/30 blur-[100px] mix-blend-screen animate-pulse delay-3000" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,var(--color-bg)_100%)]" />
            </div>

            {/* ---- 书法/英文标题 ---- */}
            <h1
                className="relative z-10 text-shimmer bg-clip-text text-transparent leading-[1.1] tracking-[0.15em] animate-fade-in"
                style={{
                    fontFamily: language === 'zh' ? 'var(--font-brush), serif' : 'var(--font-display), serif',
                    fontSize: 'clamp(5rem, 15vw, 12rem)',
                    backgroundImage: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6, #22d3ee, #f97316)',
                }}
            >
                {language === 'zh' ? (
                    <>
                        {t('hero.title_1')}{t('hero.title_2')}
                    </>
                ) : (
                    <span className="tracking-tighter">
                        {t('hero.title_1')} <span className="text-[0.8em]">{t('hero.title_2')}</span>
                    </span>
                )}
            </h1>

            {/* ---- 英文副标题 ---- */}
            <p
                className="mt-4 text-shimmer bg-clip-text text-transparent relative z-10 animate-fade-in delay-100 font-[family-name:var(--font-display)] italic tracking-wide"
                style={{
                    fontSize: 'clamp(1.2rem, 3vw, 2.5rem)',
                    backgroundImage: 'linear-gradient(90deg, #22d3ee, #a78bfa, #e879f9, #22d3ee)',
                }}
            >
                {t('hero.subtitle')}
            </p>

            {/* ---- 描述 ---- */}
            <p className="mt-10 max-w-lg text-[var(--color-text-secondary)] text-sm md:text-base tracking-[0.25em] relative z-10 animate-fade-in delay-200 leading-relaxed">
                {t('hero.desc_1')}<br />{t('hero.desc_2')}
            </p>

            {/* ---- CTA 按钮 ---- */}
            <Link
                href="/gallery"
                className="group relative mt-14 overflow-hidden rounded-full px-14 py-4 text-lg font-medium text-white transition-all hover:scale-105 active:scale-95 z-10 animate-fade-in delay-300"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 transition-opacity group-hover:opacity-100" />
                <span className="relative tracking-widest">{t('hero.cta')}</span>
            </Link>

            {/* ---- 底部署名 (Optional) ---- */}
            <p className="absolute bottom-8 text-xs text-[var(--color-text-muted)] z-10 opacity-50">
                {t('hero.footer')}
            </p>
        </section>
    )
}

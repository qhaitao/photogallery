// ============================================
// 登录页
// ============================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const supabase = createClient()
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        router.push('/gallery')
        router.refresh()
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-6">
            <div className="glass w-full max-w-md rounded-2xl p-8">
                <h1 className="font-[family-name:var(--font-display)] text-2xl text-center mb-2">
                    欢迎回来
                </h1>
                <p className="text-center text-sm text-[var(--color-text-muted)] mb-8">
                    登录时光画廊
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                            邮箱
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                            密码
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                    还没有账号？{' '}
                    <Link href="/auth/register" className="text-[var(--color-accent)] hover:underline">
                        注册
                    </Link>
                </p>
            </div>
        </div>
    )
}

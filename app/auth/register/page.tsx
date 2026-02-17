// ============================================
// 注册页
// ============================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [success, setSuccess] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('两次密码不一致')
            return
        }

        if (password.length < 6) {
            setError('密码至少 6 个字符')
            return
        }

        setLoading(true)

        const supabase = createClient()
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-6">
                <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
                    <h1 className="font-[family-name:var(--font-display)] text-2xl mb-4">
                        📧 验证邮件已发送
                    </h1>
                    <p className="text-[var(--color-text-muted)] mb-8">
                        请前往 <strong>{email}</strong> 查收验证邮件。<br />
                        点击邮件中的链接即可完成注册。
                    </p>
                    <Link
                        href="/auth/login"
                        className="inline-block rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
                    >
                        去登录
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-6">
            <div className="glass w-full max-w-md rounded-2xl p-8">
                <h1 className="font-[family-name:var(--font-display)] text-2xl text-center mb-2">
                    创建账号
                </h1>
                <p className="text-center text-sm text-[var(--color-text-muted)] mb-8">
                    加入时光画廊，分享你的作品
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
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
                            placeholder="至少 6 个字符"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">
                            确认密码
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                            placeholder="再输入一次"
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
                        {loading ? '注册中...' : '注册'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                    已有账号？{' '}
                    <Link href="/auth/login" className="text-[var(--color-accent)] hover:underline">
                        登录
                    </Link>
                </p>
            </div>
        </div>
    )
}

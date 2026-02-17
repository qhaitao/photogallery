'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'zh' | 'en'

// ---- 字典定义 ----
const dictionary = {
    zh: {
        nav: {
            home: '首页',
            gallery: '画廊',
            upload: '上传',
            login: '登录',
            profile: '我的',
            logout: '退出',
        },
        hero: {
            title_1: '时光',
            title_2: '画廊',
            subtitle: 'A Thousand Faces, A Million Dreams',
            desc_1: '每一张图片都是一次穿越',
            desc_2: '每一个场景都是一段未曾到达的人生',
            cta: '探索画廊',
            footer: '时光画廊 · 2026',
        },
        gallery: {
            search_placeholder: '搜索作品...',
            filter_all: '全部',
            loading: '加载中...',
            no_results: '暂无相关作品',
        },
        upload: {
            page_title: '上传作品',
            drag_title: '支持多图拖拽上传',
            drag_subtitle: 'JPEG / PNG / WebP · 最大 10MB/张',
            form_title: '标题 (批量)',
            form_title_placeholder: '为这一组作品取个名字',
            form_desc: '描述 (可选)',
            form_desc_placeholder: '讲述这些照片背后的故事...',
            form_category: '分类',
            form_new_category: '新分类...',
            form_add_category: '+ 新建',
            submit_uploading: '正在上传...',
            submit_default: '上传',
        },
    },
    en: {
        nav: {
            home: 'Home',
            gallery: 'Gallery',
            upload: 'Upload',
            login: 'Login',
            profile: 'My Profile',
            logout: 'Logout',
        },
        hero: {
            title_1: 'Time',
            title_2: 'Gallery',
            subtitle: 'A Thousand Faces, A Million Dreams',
            desc_1: 'Every picture is a journey through time',
            desc_2: 'Every scene is a life you have yet to live',
            cta: 'Explore Gallery',
            footer: 'Time Gallery · 2026',
        },
        gallery: {
            search_placeholder: 'Search works...',
            filter_all: 'All',
            loading: 'Loading...',
            no_results: 'No results found',
        },
        upload: {
            page_title: 'Upload Work',
            drag_title: 'Drag & Drop Photos',
            drag_subtitle: 'JPEG / PNG / WebP · Max 10MB/each',
            form_title: 'Title (Batch)',
            form_title_placeholder: 'Name this collection',
            form_desc: 'Description (Optional)',
            form_desc_placeholder: 'Tell the story behind these photos...',
            form_category: 'Category',
            form_new_category: 'New Category...',
            form_add_category: '+ New',
            submit_uploading: 'Uploading...',
            submit_default: 'Upload',
        },
    },
}

// ---- Context ----
interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('zh')

    // 初始化：从 localStorage 读取
    useEffect(() => {
        const saved = localStorage.getItem('app_language') as Language
        if (saved && (saved === 'zh' || saved === 'en')) {
            setLanguage(saved)
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('app_language', lang)
    }

    // 翻译函数 t('nav.home')
    const t = (path: string) => {
        const keys = path.split('.')
        let current: any = dictionary[language]
        for (const key of keys) {
            if (current[key] === undefined) return path
            current = current[key]
        }
        return current
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const SEED_DIR = path.join(process.cwd(), 'seed')
const BUCKET = 'gallery'

// Theme to Category Name mapping
const THEME_MAP = {
    '法律职场': '岁月长廊',
    '环游世界': '世界地图',
    '新疆': '西域幻境',
    '时尚': '时尚殿堂',
    '极致': '时尚殿堂',
    '幻想': '幻想国度',
    '娇妻': '娇妻日常',
    '穿越': '朝代穿越',
    '年代': '百年中国',
    '广州': '广州时光机',
    '成长': '成长轨迹',
    '海滩': '环球海滩',
    '性感': '私密时光',
    '概念': '创意终章',
    '电影': '创意终章',
    '职业': '创意终章',
}

async function main() {
    console.log('🚀 Starting seed process...')

    // 1. Auth as Seeder
    const email = 'seeder@gallery.com'
    const password = 'password123'

    let { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError) {
        console.log(`⚠️ Sign in failed: ${authError.message}. Creating account...`)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })
        if (signUpError) {
            console.error('❌ Sign up failed:', signUpError.message)
            process.exit(1)
        }
        user = signUpData.user
        // If sign up successful, we might need to wait for email confirmation if not auto-confirmed
        // But we just manually confirmed it via SQL for this user.
    }

    if (!user) {
        console.error('❌ Auth failed')
        process.exit(1)
    }
    console.log('✅ Authenticated as:', user.email)

    // 2. Fetch Categories
    const { data: categories } = await supabase.from('categories').select('id, name')
    if (!categories) {
        console.error('❌ No categories found. Run migration first.')
        process.exit(1)
    }

    const categoryMap = new Map(categories.map(c => [c.name, c.id]))

    // 3. Scan Files
    const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.png'))
    console.log(`📂 Found ${files.length} images`)

    // 4. Process Uploads
    for (const [index, filename] of files.entries()) {
        const filePath = path.join(SEED_DIR, filename)
        const fileBuffer = fs.readFileSync(filePath)

        // Parse Filename: 001-20260116-法律职场-1岁.png
        // parts: [ID, Date, Theme, Title]
        const nameWithoutExt = filename.replace('.png', '')
        const parts = nameWithoutExt.split('-')

        if (parts.length < 4) {
            console.warn(`⚠️ Skipping invalid filename format: ${filename}`)
            continue
        }

        const theme = parts[2]
        const title = parts[3]
        const categoryName = THEME_MAP[theme]
        const categoryId = categoryMap.get(categoryName)

        if (!categoryId) {
            console.warn(`⚠️ Unknown theme "${theme}" for file ${filename}`)
        }

        // Check if photo already exists to support idempotency
        const { data: existingPhoto } = await supabase.from('photos')
            .select('id')
            .eq('title', title)
            .eq('description', `${theme}系列作品`)
            .single()

        if (existingPhoto) {
            process.stdout.write(`\r⏩ Skipping existing ${index + 1}/${files.length}: ${title}                    `)
            continue
        }

        // Upload to Storage
        // Use safe filename to avoid encoding issues with Chinese characters
        const safeName = `image-${index}-${Date.now()}.png`
        const storagePath = `${user.id}/seed/${safeName}`

        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            })

        if (uploadError) {
            console.error(`❌ Upload failed for ${filename}:`, uploadError.message)
            continue
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(storagePath)

        // Insert into DB
        const { error: dbError } = await supabase.from('photos').insert({
            user_id: user.id,
            title: title,
            description: `${theme}系列作品`,
            storage_path: storagePath,
            image_url: publicUrl,
            is_public: true,
            file_size: fileBuffer.length,
            // width/height omitted for simplicity in seed, or use 'image-size' lib if critical
        }).select().single()

        // Map Category (Need photo ID first, so we use select().single())
        // Wait, insert returns data if select() is chained.
        // But duplicate check? Filename uniqueness?
        // Let's check if photo exists first to avoid duplicates

        // Actually, simpler: Upsert photos based on storage_path? 
        // storage_path is not unique constraint in DB schema.

        // Let's just correct the insert to handle return data
        const { data: photoData, error: insertError } = await supabase.from('photos')
            .insert({
                user_id: user.id,
                title: title,
                description: `${theme}系列作品`,
                storage_path: storagePath,
                image_url: publicUrl,
                is_public: true,
                file_size: fileBuffer.length,
            })
            .select('id')
            .single()

        if (insertError) {
            console.error(`❌ DB Insert failed for ${filename}:`, insertError.message)
        } else if (photoData && categoryId) {
            // Link Category
            const { error: linkError } = await supabase.from('photo_categories').insert({
                photo_id: photoData.id,
                category_id: categoryId
            })
            if (linkError) console.error(`❌ Link category failed:`, linkError.message)
        }

        process.stdout.write(`\r✅ Processed ${index + 1}/${files.length}: ${title}                    `)
    }

    console.log('\n✨ Seed complete!')
}

main().catch(console.error)

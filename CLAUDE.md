# Architecture: 时光画廊 · Photo Gallery

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Deploy**: Vercel

## Directory Structure
```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (dark theme, fonts, Navbar)
│   ├── page.tsx            # Home: Hero + Featured + Categories
│   ├── gallery/page.tsx    # Gallery: Masonry + Filters + Lightbox
│   ├── upload/page.tsx     # Upload: Drag-drop + Signed URL
│   ├── profile/page.tsx    # Profile: My photos CRUD
│   └── auth/               # Login, Register, OAuth callback
├── components/
│   ├── gallery/            # PhotoCard, Lightbox
│   └── ui/                 # Navbar
├── lib/
│   ├── supabase/           # Client (browser), Server, Middleware
│   ├── types.ts            # Photo, Category interfaces
│   └── constants.ts        # Upload limits, bucket names
├── actions/photos.ts       # Server Actions: CRUD, pagination, upload URL
├── middleware.ts            # Auth session refresh
├── supabase/migration.sql  # DB schema + RLS + seed categories
└── seed/                   # 222 original AI portraits (for import)
```

## Design Principles
- Dark cinema theme: `#0a0a0f` background, images are the only light
- Glassmorphism navbar, smooth animations
- Cursor-based pagination for infinite scroll
- Signed URL upload: Server Action signs → client direct uploads to Storage

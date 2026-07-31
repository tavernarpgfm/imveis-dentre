# Dentre Imóveis — Plataforma de Capacitação e Certificação de Corretores

## Overview

A Dentre Imóveis é uma plataforma que capacita novos corretores e conecta profissionais certificados a imobiliárias, construtoras e incorporadoras.

This project uses the following tech stack:

- Vite
- Typescript
- React Router v7 (all imports from `react-router` instead of `react-router-dom`)
- React 19 (for frontend components)
- Tailwind v4 (for styling)
- Shadcn UI (for UI components library)
- Lucide Icons (for icons)
- Supabase (for backend, database & auth)
- Supabase Storage (for file storage)
- PostgreSQL with Row Level Security (RLS)
- Framer Motion (for animations)

All relevant files live in the 'src' directory.

## Setup

The project is set up already and running on a cloud environment.

## Environment Variables

The project is configured with the following client-side environment variables (managed in the project's Keys/API keys tab):

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

The database schema, indexes, triggers, RLS policies, and storage buckets are defined in `supabase-migration.sql`. Run that script in your Supabase SQL Editor to provision the backend.

## Using Authentication

Auth is handled entirely by Supabase Auth (email OTP). All authentication logic lives in:

- `src/lib/supabase.ts` — Supabase client initialization
- `src/lib/supabase-service.ts` — typed data-access layer (users, profiles, brokers, companies, courses, lessons, enrollments, assessments, certificates, opportunities)
- `src/hooks/use-auth.ts` — React auth hook

You MUST use the `useAuth` hook to get user data:

```typescript
import { useAuth } from "@/hooks/use-auth";

const { isLoading, isAuthenticated, user, signIn, verifyOtp, signOut } = useAuth();
```

## Protected Routes

The `/dashboard` route is protected with `RequireAuth`, which sends signed-out users to `/auth?returnTo=<current route>`. Reuse `RequireAuth` when adding another protected route.

## Auth Page

The auth page is defined in `src/pages/Auth.tsx`. Send sign-in and sign-up actions to `/auth`.

## Authorization

Authorization is enforced at the database level with Row Level Security policies (defined in `supabase-migration.sql`):

- Users can only view/edit their own data
- Companies can only view certified (approved) brokers
- Admins have full access
- Storage buckets (`avatars`, `documents`, `certificates`) are access-controlled by user ID prefixes

## Page routing

Your page component should go under the `src/pages` folder. When adding a page, update the react router configuration in `src/main.tsx`.

## Styling

This project uses a Neobrutalism Minimalism theme: square corners, strong black borders, flat color blocking, and bold controlled contrast. Theme tokens live in `src/index.css`.

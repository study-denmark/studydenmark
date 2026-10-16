# StudyDenmark Guide – fase 1

Next.js 15 + Tailwind 4 + Supabase + Stripe.
Navnet "StudyDenmark Guide" er en pladsholder og ændres i `src/config/site.ts`.

## Hvad er bygget (fase 1)

- **Offentlig del** (engelsk): forside, 5 guidesider, programtyper, eligibility-quiz, priser, FAQ
- **Login**: opret konto (med samtykke til vilkår/privatliv), log ind, glemt adgangskode
- **Betaling**: Stripe Checkout med årligt abonnement, webhook, kundeportal til at opsige
- **Betalingsvæg**: `/dashboard` kræver aktivt abonnement – håndhævet både i appen og i databasen (RLS)
- **GDPR**: samtykkelog, download alle data, slet konto + filer
- **Datamodel for alle 4 faser** ligger allerede i Supabase (`supabase/migrations/`)

## Datamodel (Supabase-projekt `studydenmark-guide`, EU/Stockholm)

| Tabel | Bruges i | Indhold |
|---|---|---|
| profiles | 1–2 | Bruger + onboarding-felter, rolle (student/admin) |
| consents | 1, 3 | Samtykkelog med version og tidspunkt |
| subscriptions, payments | 1, 4 | Skrives kun af Stripe-webhook |
| institutions | 2 | Skoler, `is_partner` vises som "Partner" |
| partner_agreements | 4 | Kommissionsbeløb – kun synligt for admin |
| programmes, programme_required_documents | 2–3 | Uddannelser, krav, frister, priser |
| saved_programmes | 2 | Brugerens favoritter |
| documents | 3 | Uploadede filer (privat bucket `student-documents`) |
| applications, application_stage_history | 4 | Pipeline: Interesseret → … → Kommission betalt |
| document_shares | 4 | Log over hvilke dokumenter der er delt med hvilken skole |

Sikkerhed er testet: studerende ser kun egne data, kan ikke gøre sig selv til admin, og betalte uddannelser er låst for ikke-betalende.

## Opsætning (ca. 20 min)

### 1. Supabase
1. Dashboard → Project Settings → API Keys → kopier en **Secret key** til `SUPABASE_SECRET_KEY`.
2. Authentication → URL Configuration:
   - Site URL: `https://jeres-domæne.dk` (lokalt: `http://localhost:3000`)
   - Redirect URLs: tilføj `https://jeres-domæne.dk/auth/callback` og `http://localhost:3000/auth/callback`
3. Authentication → Emails → SMTP: sæt jeres egen mailudbyder op før lancering (Supabases standard-mail er stærkt begrænset).

### 2. Stripe (start i testmode)
1. Opret produkt "Membership" med en **tilbagevendende årlig pris på 100 DKK** → kopier `price_...` til `STRIPE_PRICE_ID`.
2. Developers → API keys → `STRIPE_SECRET_KEY`.
3. Developers → Webhooks → tilføj endpoint `https://jeres-domæne.dk/api/stripe/webhook` med events:
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`,
   `invoice.paid`, `invoice.payment_failed` → kopier signing secret til `STRIPE_WEBHOOK_SECRET`.
4. Settings → Billing → Customer portal: slå "Cancel subscription" til.
5. Moms: salg af digitale ydelser til forbrugere i EU kræver moms efter forbrugerens land (OSS). Aktivér Stripe Tax og sæt `STRIPE_AUTOMATIC_TAX=true`, eller tal med jeres revisor.

### 3. Kør lokalt
```bash
cp .env.example .env.local   # udfyld de tomme felter
npm install
npm run dev                   # http://localhost:3000
```
Test webhook lokalt: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
Testkort: `4242 4242 4242 4242`, vilkårlig fremtidig dato og CVC.

### 4. Gør dig selv til admin
Supabase → SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'din@email.dk';
```

### 5. Deploy
Vercel: importer repoet, indsæt alle variabler fra `.env.local`, sæt `NEXT_PUBLIC_SITE_URL` til domænet.

## Inden lancering
- [ ] Privatlivspolitik og handelsbetingelser (`/privacy`, `/terms`) skal skrives færdige og gennemgås af en jurist – især fortrydelsesret for digitale ydelser
- [ ] Databehandleraftaler med partnerskolerne, før der deles dokumenter
- [ ] Udskift `hello@example.com` i `src/config/site.ts`
- [ ] Tilføj uddannelser (Supabase → Table Editor → `institutions` og `programmes`; sæt `is_published = true`, og `is_public_preview = true` på 3–6 stykker, der skal vises gratis)

## Næste faser
- **Fase 2**: Onboarding-formular, uddannelsesdatabase med filtre, personlige matches
- **Fase 3**: Dokumentupload med status og tjekliste
- **Fase 4**: Admin-panel, pipeline, kommission, eksport af dokumentpakker

Bemærk til fase 4: Når en studerende sletter sin konto, slettes også deres ansøgninger. Hvis I skal beholde kommissionshistorik til fakturering, skal den gemmes anonymiseret i en separat tabel.

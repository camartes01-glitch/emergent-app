# Here are your Instructions
# CAMARTES Photography Ecosystem — Product specification & implementation plan

> Single-source product spec for the Camartes mobile + backend platform (MVP → v1)

---

## 1. Project summary (MVP focus)

* Mobile-first app (Flutter) + backend API + admin portal.
* Core user types: **Freelancer**, **Business**, **End-customer**, **Admin**.
* Key flows: auth, profile + advanced profile building, search & listing, booking (including camera rental inventory), media upload, notifications, payments, admin analytics.

---

## 2. Authentication & onboarding

* **Login / Signup**: Phone or email, password or OTP.
* **Signup fields**: full name (as ID), phone, email, password, confirm password, reference ID, OTP verification.
* **Post-signup immediate**: profile building wizard (choose Freelancer / Business / Both).
* **Save states**: "Continue later" for profile steps; partial profiles stored with `profile_status` flags.

---

## 3. Profile types & advanced profile building

* **Freelancer** (multi-select services): Photographer, Videographer, Album Designer, Video Editor, Web Live, LED Wall, Fly Cam, etc.

  * Each service record includes: years_of_experience, portfolio_files (min 5, max 10), equipment list (items with name, model, service_number, photos), pricing (6h/8h/12h or per-minute/per-hour), service styles (multi-select dropdown e.g. Traditional, Candid, Fashion...).
* **Business**: Photography firm, Camera Rental, Service centres, Outdoor studios, Editing studios, Printing labs.

  * Camera rental must include full inventory model + booking calendar + QC image uploads for in/out transactions.

---

## 4. Data model (high level tables / collections)

(Use relational DB recommended — PostgreSQL. Can map to NoSQL if desired.)

* `users` (id, name, phone, email, role_flags, profile_status, location, created_at)
* `profiles` (user_id, type: freelancer|business, short_bio, verification_docs, rating, etc.)
* `services` (id, profile_id, service_type, description, pricing_scheme, styles[], years_experience, active)
* `portfolio_items` (id, profile_id, service_id, type=image|video|link, url, metadata)
* `equipment_items` (id, profile_id, category, brand, model, service_number, photos[], status[in, out, maintenance], hourly_price, day_price)
* `bookings` (id, customer_id, provider_id, service_id, equipment_ids[], start_time, end_time, location, status, payment_id)
* `rental_transactions` (id, equipment_id, booking_id, qc_images_in[], qc_images_out[], timestamps)
* `notifications`, `messages`, `admin_logs`, `analytics_events`

---

## 5. API surface (examples)

* `POST /auth/signup`, `POST /auth/login` (OTP), `POST /auth/verify-otp`
* `GET /profiles/:id`, `PUT /profiles/:id` (partial save / continue later)
* `POST /profiles/:id/services`, `GET /services/search` (filters: location, price, style, availability)
* `POST /equipment` (business), `GET /equipment/:id`, `POST /equipment/:id/book`
* `POST /bookings`, `GET /bookings/:user`, `PATCH /bookings/:id/status`
* `POST /media/upload` (signed URLs), `GET /media/:id/stream`
* Admin: `GET /admin/analytics`, `PATCH /admin/user/:id/verify`

---

## 6. Mobile UI (Flutter) — screen map (bottom nav)

* Bottom tabs: **Home**, **Services**, **Account**
* **Home**: dynamic ad banner (image/video), Business box (top 6), Freelancer box (top 6), Events & Blogs carousel
* **Services**: full service directory + filters + map / list view
* **Account**: Dashboard (edit portfolio, view bookings, inventory (for rentals), settings)
* Onboarding screens: Login / Signup → Role selection → Profile wizard (multi-step forms with image/video upload, equipment pickers, pricing inputs)

---

## 7. Camera rental & inventory workflow (detailed)

* Inventory items maintained by business account with photos & QC checklist.
* Booking flow: customer selects equipment + time range → system checks availability → places provisional hold → confirmation on payment.
* On pickup: staff uploads `QC-out` images (7 photos as specified) and marks item `out` with renter details and location trace.
* On return: staff uploads `QC-in` images; system sets status back to `in` or `maintenance` (if issues).
* Reporting: rental history, revenue by equipment, utilization rates.

---

## 8. Permissions & sensitive features

* Permissions to request: precise location (for bookings & live tracking), storage (gallery), contacts (optional for invite/referral), camera, microphone (for live services), SMS/send OTP.
* Provide granular permission prompts and an in-app privacy page explaining usage and retention.
* Store location traces only while active on a booking or with explicit consent; purge traces after configurable retention (e.g., 30 days) unless required by disputes.

---

## 9. Media handling & constraints

* Accept PNG / JPEG / JPG for logos and images; video formats: mp4, mov.
* Enforce portfolio minimums (5) and maximums (10) at UI level and validate on backend.
* Use cloud storage (S3-compatible) with signed upload URLs; generate thumbnails, and transcode video to adaptive formats.
* Strip EXIF if user chooses to obfuscate precise GPS, but allow providers to include location if they want.

---

## 10. Payments, disputes & cancellations

* Integrate payment gateway(s) popular in India (Razorpay recommended) for bookings & rentals.
* Support partial/capture flow for security deposits on rental items.
* Booking status lifecycle: `pending` → `confirmed` → `in-progress` → `completed` → `cancelled`.
* Admin tools for manual refund, dispute resolution, and issuing credits.

---

## 11. Admin panel & analytics

* Admin roles: super-admin, operations, finance, support.
* Key dashboards: daily active providers/customers, bookings (by status), rental utilization, revenue, disputes, content moderation queue.
* Tools: user verification workflows, manual booking creation, inventory adjustments, export CSV, send push-notifications.

---

## 12. Security, verification & compliance

* Standard OWASP practices, HTTPS everywhere, rate limiting, input validation, validated file types and sizes.
* Optional KYC flow for businesses (upload PAN, GSTIN, government ID) with admin verification.

---

## 13. Tech stack (recommended)

* **Frontend (mobile)**: Flutter (single codebase for Android/iOS)
* **Backend**: Node.js + TypeScript (NestJS) or Python (FastAPI) — REST or GraphQL API
* **DB**: PostgreSQL (primary), Redis (caching & locks), S3 (media)
* **Auth / Push / OTP**: Firebase Auth (OTP) or custom using provider + Twilio/RapidAPI for SMS; FCM for push
* **Payments**: Razorpay
* **Hosting**: AWS / GCP / DigitalOcean. Use managed DB (RDS/Cloud SQL) and object storage (S3/GCS)
* **Admin**: React (or Next.js) dashboard

---

## 14. Analytics & tracking

* Capture event-level analytics for search & booking funnels; integrate with Amplitude / Firebase Analytics / Mixpanel.
* Basic reports in admin for revenue, bookings, cancellations, top services.

---

## 15. QA checklist

* Auth: OTP flows, password reset, input validation.
* Uploads: size limits, file type checks, max/min portfolio counts.
* Booking & rental: concurrency tests (double-book), availability logic, QC image capture flows.
* Permissions: location accuracy & revocation handling.
* Security: pen test for main endpoints.

---

## 16. MVP scope suggestion (minimal set to launch)

* Signup/login with OTP
* Profile wizard for core services (Photographer, Camera Rental)
* Portfolio upload (5 items), equipment listing for rental with booking & payments
* Basic booking flow + QC image upload for rentals
* Admin portal with user management and rental booking monitoring
* Push notifications & basic analytics

---

## 17. Deliverables & next actions (how I can help next)

1. Convert this spec into clickable low-fi wireframes (Flutter-ready screens).
2. Produce a detailed DB schema (DDL) and API contract (OpenAPI spec).
3. Generate Flutter screen components (single-file previews) and sample backend endpoints (Node/NestJS).
4. Help prepare developer tasks / tickets (Jira/GitHub) and acceptance criteria.

---

**If you want any of the items in section 17, tell me which one to start** and I will produce it next (wireframes, DB schema, API spec, or Flutter code).

---

## 18. Wireframes (low-fidelity screen descriptions)

Below are clickable-wireframe level screen descriptions ready to be converted into Figma/Flutter screens. Each screen lists primary components and interactions.

### 1. Launch & Auth

**Launch / Splash**

* App logo (center), yellow background accent, subtle animation.
* CTA: "Get started" → goes to Login / Signup chooser.

**Login / Signup (single screen with tabs)**

* Tabs: "Login" | "Signup"
* Login: phone/email input, password or "Send OTP" button, "Forgot password?", social login buttons (optional)
* Signup: full name, phone, email, password, confirm password, reference ID, "Send OTP" → OTP modal
* Primary CTA: Continue

**OTP verification modal**

* 6-digit input, resend timer, verify button.

### 2. Role selection & Quick Profile

**Role chooser**

* Toggle chips: Freelancer / Business (multi-select allowed)
* Continue → opens Profile Building Wizard (see below)

**Profile Building Wizard (multi-step)**

* Stepper at top (1/4 etc). Buttons: "Continue later" and "Submit"
* Step A: Basic info — display name, short bio, city, precise location toggle (allow permission)
* Step B: Services selection — grid of service tiles (multi-select). When a service tile chosen, show "Configure" button.
* Step C: Portfolio upload — drag/drop or gallery picker, min 5, max 10 thumbnails.
* Step D: Equipment listing & pricing — form for each equipment: category, brand, model, service_number, photos, pricing tiers.
* Final: Review screen with summary and Submit.

### 3. Home (Bottom nav active: Home)

* Top dynamic carousel (image/video ad banner)
* Two horizontal cards: Business Services (6 tiles + More) and Freelancer Services (6 tiles + More)
* Events & Blogs carousel
* Floating action button: Quick Add Booking (for frequent users)

### 4. Services (Bottom nav active: Services)

* Search bar, filters (style, price, location, availability), list/grid toggle, map toggle
* Each card: provider name, thumbnail, star rating, price summary, "View" button

### 5. Provider Detail / Booking

* Header with gallery carousel, contact button, book button
* Tabs: Overview | Portfolio | Equipment | Reviews
* Booking widget: date/time picker, duration presets (6/8/12/24h), equipment add-ons, total price, "Proceed to Pay"

### 6. Account / Dashboard

* Profile header, quick stats (bookings, earnings, active listings)
* Tabs: Edit Portfolio, My Bookings, Inventory (for rentals), Analytics (basic)
* Inventory item row: photo, name, status, in/out history (tap to open transaction details)

### 7. Booking Flow (Customer)

* Select service → choose provider → configure date/time/equipment → confirm & pay → booking confirmed screen with map & contact

### 8. Admin Panel (web)

* Left nav: Dashboard, Users, Services, Bookings, Equipment, Analytics, Moderation
* Analytics cards (DAU, Revenue, Booking Volume), moderation queue, quick filters

---

## 19. Database schema (Postgres DDL)

Below is a starting SQL DDL. Run with migrations (e.g. Flyway / Prisma / TypeORM). Adjust types and indexes as needed.

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT,
  roles TEXT[] DEFAULT ARRAY['customer'], -- e.g. ['freelancer','business']
  reference_id TEXT,
  profile_status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles (one-to-one extension)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  short_bio TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  precise_location GEOGRAPHY(POINT), -- optional
  verification_status TEXT DEFAULT 'unverified',
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  description TEXT,
  styles TEXT[],
  years_experience INT,
  pricing JSONB, -- e.g. {"6h": 5000, "8h":7000}
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Portfolio items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  type TEXT, -- 'image','video','link'
  url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Equipment items (for rental/inventory)
CREATE TABLE equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,
  brand TEXT,
  model TEXT,
  service_number TEXT,
  photos TEXT[], -- array of urls
  status TEXT DEFAULT 'in', -- in|out|maintenance
  price_hours JSONB, -- {"6h":..., "8h":..., "12h":..., "24h":...}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  equipment_ids UUID[], -- array of equipment ids
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location JSONB,
  total_amount NUMERIC(12,2),
  payment_status TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rental transactions (QC images, in/out)
CREATE TABLE rental_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment_items(id),
  booking_id UUID REFERENCES bookings(id),
  qc_images_out TEXT[],
  qc_images_in TEXT[],
  renter_info JSONB,
  out_time TIMESTAMP WITH TIME ZONE,
  in_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  body TEXT,
  payload JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages (simple chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  from_user UUID REFERENCES users(id),
  to_user UUID REFERENCES users(id),
  body TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Notes: add indexes on frequently queried columns: `services.service_type`, `profiles.city`, `equipment_items.status`, `bookings.start_time`.

---

## 20. OpenAPI (brief API contract)

Below is a compact OpenAPI 3.0 YAML snippet covering core auth, profile, services, equipment, and bookings. Use as a starting point, expand with request/response schemas and security definitions.

```yaml
openapi: 3.0.3
info:
  title: Camartes API
  version: 1.0.0
servers:
  - url: https://api.camartes.com/v1
paths:
  /auth/signup:
    post:
      summary: Sign up user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                full_name: { type: string }
                phone: { type: string }
                email: { type: string }
                password: { type: string }
                reference_id: { type: string }
      responses:
        '201':
          description: Created
  /auth/login:
    post:
      summary: Login with email/phone + password or request OTP
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                identifier: { type: string }
                password: { type: string }
                request_otp: { type: boolean }
      responses:
        '200':
          description: OK
  /auth/verify-otp:
    post:
      summary: Verify OTP
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                phone: { type: string }
                otp: { type: string }
      responses:
        '200': { description: Verified }

  /profiles:
    get:
      summary: Get current user's profile
      security: [ bearerAuth: [] ]
      responses:
        '200':
          description: Profile
    post:
      summary: Create / update profile (partial save)
      security: [ bearerAuth: [] ]
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Profile'
      responses:
        '200': { description: Saved }

  /services:
    post:
      summary: Create service under profile
      security: [ bearerAuth: [] ]
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Service'
    get:
      summary: Search services
      parameters:
        - name: q
          in: query
          schema: { type: string }
        - name: city
          in: query
          schema: { type: string }
        - name: styles
          in: query
          schema: { type: string }
      responses:
        '200': { description: list }

  /equipment:
    post:
      summary: Add equipment (business)
      security: [ bearerAuth: [] ]
    get:
      summary: Get equipment by id

  /bookings:
    post:
      summary: Create booking
      security: [ bearerAuth: [] ]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                provider_id: { type: string }
                service_id: { type: string }
                equipment_ids: { type: array, items: { type: string } }
                start_time: { type: string, format: date-time }
                end_time: { type: string, format: date-time }
      responses:
        '201': { description: Booking created }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Profile:
      type: object
      properties:
        short_bio: { type: string }
        city: { type: string }
        services: { type: array, items: { type: string } }
    Service:
      type: object
      properties:
        service_type: { type: string }
        years_experience: { type: integer }
        styles: { type: array, items: { type: string } }
        pricing: { type: object }
```

---

## 21. Next steps & how I'll deliver

* I can now generate (choose one):

  1. Clickable low-fi wireframes (Figma-ready), exported as PNGs or a clickable PDF.
  2. Full DB migration scripts (with constraints & indexes) tuned for Postgres.
  3. A complete OpenAPI 3.0 YAML file (expanded schemas + examples) and a Postman collection.

Tell me which of the three above to generate immediately (I will produce it in this canvas).

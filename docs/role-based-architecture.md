# StayCraft Role-Based Architecture

## Goal

Extend StayCraft from a listing + booking flow into a 3-role rental management platform with:

- `admin` dashboard
- `owner` dashboard
- `tenant` dashboard

Use a single Supabase auth system and route users to the correct dashboard based on role.

## Roles

### Admin

Admin manages platform operations.

Core responsibilities:

- create and edit room/property listings
- upload room photos
- assign rooms to owners
- review bookings
- review payment records
- verify tenants
- assign tenants to rooms
- generate monthly rent invoices if needed

### Owner

Owner manages only their own properties and tenants.

Core responsibilities:

- see their rooms
- see occupancy status
- see current tenant details
- see tenant verification status
- see booking status
- see rent payment history for their rooms

### Tenant

Tenant manages only their own room, bills, and payments.

Core responsibilities:

- see current room assignment
- see booking details
- see monthly rent bills
- pay monthly rent
- see payment history and receipts
- see verification status

## Recommended Auth Model

Use one Supabase Auth login for all users.

After login:

1. read the logged-in user's profile row
2. check `role`
3. redirect automatically:
   - `admin` -> `/admin`
   - `owner` -> `/owner`
   - `tenant` -> `/tenant`

Do not create 3 separate login pages. One login page is simpler and safer.

## Proposed Database Tables

### 1. `profiles`

Purpose: stores role and base user identity metadata.

Suggested fields:

- `id uuid primary key references auth.users(id)`
- `full_name text`
- `email text unique`
- `phone text`
- `role text check (role in ('admin', 'owner', 'tenant'))`
- `is_active boolean default true`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- this becomes the main user profile table
- every authenticated user should have one row here

### 2. `owners`

Purpose: owner-specific business data.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id)`
- `company_name text`
- `government_id_type text`
- `government_id_number text`
- `bank_account_name text`
- `bank_account_last4 text`
- `is_verified boolean default false`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- if one owner account maps 1:1 to profile, `profile_id` should be unique
- keep sensitive full bank details outside the app if not needed

### 3. `tenants`

Purpose: tenant-specific identity and verification data.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `profile_id uuid not null references public.profiles(id)`
- `date_of_birth date`
- `gender text`
- `emergency_contact_name text`
- `emergency_contact_phone text`
- `occupation_type text`
- `institution_or_company text`
- `is_verified boolean default false`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- if one tenant account maps 1:1 to profile, `profile_id` should be unique

### 4. `tenant_verifications`

Purpose: track document verification status.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `tenant_id uuid not null references public.tenants(id)`
- `document_type text`
- `document_url text`
- `status text check (status in ('pending', 'approved', 'rejected'))`
- `reviewed_by uuid references public.profiles(id)`
- `review_notes text`
- `submitted_at timestamptz`
- `reviewed_at timestamptz`

### 5. `properties`

Purpose: parent entity for owner-managed locations/buildings.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null references public.owners(id)`
- `name text not null`
- `city text not null`
- `pincode text not null`
- `address text not null`
- `property_type text`
- `status text check (status in ('active', 'inactive'))`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- this is useful if one owner has multiple buildings/hostels/apartments
- current `property_leads` table can stay for owner acquisition

### 6. `rooms`

Purpose: actual rentable units.

Current table exists, but should be expanded.

Add/adjust fields:

- `property_id uuid references public.properties(id)`
- `owner_id uuid references public.owners(id)`
- `slug text unique`
- `title text`
- `description text`
- `monthly_rent_paise integer`
- `security_deposit_paise integer`
- `room_category text`
- `occupancy_type text`
- `status text check (status in ('draft', 'published', 'occupied', 'inactive'))`
- `available_from date`
- `amenities jsonb`
- `cover_image_url text`

Keep from current table:

- `location`
- `city`
- `pincode`
- `type`
- `for_girls_only`
- `beds_available`

Notes:

- move away from storing price as formatted text only
- keep a numeric paise field for all payment logic

### 7. `room_images`

Purpose: multiple photos per room.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `room_id integer not null references public.rooms(id) on delete cascade`
- `image_url text not null`
- `sort_order integer default 0`
- `created_at timestamptz`

### 8. `room_bookings`

Purpose: booking/reservation payment and booking status.

Current table exists. Expand it.

Recommended additional fields:

- `booking_type text check (booking_type in ('reservation')) default 'reservation'`
- `assigned_tenant_id uuid references public.tenants(id)`
- `booking_status text check (booking_status in ('initiated', 'paid', 'cancelled', 'converted'))`
- `payment_status text check (payment_status in ('created', 'paid', 'failed', 'refunded'))`
- `notes text`

Notes:

- current `status` can be split into booking status and payment status for clarity

### 9. `room_assignments`

Purpose: map a tenant to a room after booking/approval.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `room_id integer not null references public.rooms(id)`
- `tenant_id uuid not null references public.tenants(id)`
- `owner_id uuid not null references public.owners(id)`
- `booking_id uuid references public.room_bookings(id)`
- `start_date date not null`
- `end_date date`
- `status text check (status in ('active', 'ended', 'pending_move_in'))`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- this is the main source of truth for who is staying where

### 10. `rent_invoices`

Purpose: monthly rent billing.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `assignment_id uuid not null references public.room_assignments(id)`
- `tenant_id uuid not null references public.tenants(id)`
- `owner_id uuid not null references public.owners(id)`
- `room_id integer not null references public.rooms(id)`
- `invoice_month date not null`
- `rent_amount_paise integer not null`
- `due_date date not null`
- `late_fee_paise integer default 0`
- `total_amount_paise integer not null`
- `status text check (status in ('draft', 'issued', 'paid', 'overdue', 'cancelled'))`
- `created_at timestamptz`
- `updated_at timestamptz`

### 11. `rent_payments`

Purpose: payment records for recurring monthly rent.

Suggested fields:

- `id uuid primary key default gen_random_uuid()`
- `invoice_id uuid not null references public.rent_invoices(id)`
- `tenant_id uuid not null references public.tenants(id)`
- `owner_id uuid not null references public.owners(id)`
- `amount_paise integer not null`
- `currency text default 'INR'`
- `payment_method text`
- `payment_provider text default 'razorpay'`
- `razorpay_order_id text`
- `razorpay_payment_id text`
- `razorpay_signature text`
- `status text check (status in ('created', 'paid', 'failed', 'refunded'))`
- `paid_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Notes:

- this is separate from booking payment
- booking payment and monthly rent payment should not share one table

## Recommended Route Structure

### Public routes

- `/`
- `/rooms/[id]` or continue `/book?roomId=...`
- `/auth/login`
- `/auth/sign-up`
- `/book`
- `/book/success`

### Shared authenticated routes

- `/dashboard` -> smart redirect by role
- `/account` -> profile settings for any logged-in user

### Admin routes

- `/admin`
- `/admin/rooms`
- `/admin/rooms/new`
- `/admin/rooms/[id]/edit`
- `/admin/owners`
- `/admin/owners/[id]`
- `/admin/tenants`
- `/admin/tenants/[id]`
- `/admin/bookings`
- `/admin/rent-invoices`
- `/admin/payments`
- `/admin/verifications`

### Owner routes

- `/owner`
- `/owner/rooms`
- `/owner/rooms/[id]`
- `/owner/tenants`
- `/owner/tenants/[id]`
- `/owner/payments`
- `/owner/rent-history`
- `/owner/bookings`

### Tenant routes

- `/tenant`
- `/tenant/room`
- `/tenant/bills`
- `/tenant/payments`
- `/tenant/verification`
- `/tenant/profile`

## Dashboard Content

### Admin dashboard widgets

- total owners
- total tenants
- active rooms
- occupied rooms
- pending verifications
- recent bookings
- recent rent payments

### Owner dashboard widgets

- total rooms
- occupied rooms
- vacant rooms
- this month rent collected
- pending rent invoices
- tenant verification alerts

### Tenant dashboard widgets

- current room
- current month bill
- payment due date
- recent payments
- verification status

## Access Control / RLS Direction

### Admin

Admin should be able to read and manage everything.

Best implementation:

- create an `is_admin()` SQL helper based on `profiles.role = 'admin'`
- use that helper in policies

### Owner

Owner should only access:

- their own properties
- their own rooms
- their tenants via assignments
- invoices/payments tied to their rooms

### Tenant

Tenant should only access:

- their own profile
- their own verification
- their own booking rows
- their own room assignment
- their own invoices and payments

## Payment Model

### Booking payment

Used before move-in.

Flow:

1. user books room
2. booking payment collected
3. booking row marked paid
4. admin reviews
5. tenant can be assigned to room

### Rent payment

Used after room assignment.

Flow:

1. admin or scheduled job creates monthly invoice
2. tenant logs in
3. tenant sees invoice in `/tenant/bills`
4. tenant pays invoice
5. payment stored in `rent_payments`
6. invoice marked paid
7. owner sees it in `/owner/payments`

## Recommended Build Order

### Phase 1

- add `profiles`
- add role-based redirect after login
- create `/admin`, `/owner`, `/tenant` placeholders

### Phase 2

- expand `rooms`
- add `properties`
- add `room_images`
- let admin manage rooms/photos

### Phase 3

- add `owners`, `tenants`, `tenant_verifications`
- build admin verification flow

### Phase 4

- add `room_assignments`
- let admin assign tenants to rooms
- show owner + tenant dashboards

### Phase 5

- add `rent_invoices` and `rent_payments`
- build tenant rent payment flow
- build owner rent history view

## Recommended First Implementation Slice

Build these first:

1. `profiles` table with roles
2. `/dashboard` redirect by role
3. `/admin`, `/owner`, `/tenant` layouts
4. admin room management
5. owner room overview
6. tenant bills placeholder

This keeps momentum high while setting the foundation for the full product.

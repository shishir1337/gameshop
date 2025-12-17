So example Product :
product name : Valorant Point Malaysia
product image
product description : 

will have varients :
Select Top-Up Amount

475 VP 525 BDT
1000 VP 1050 BDT
1475 VP 1550 BDT
2050 VP 2050 BDT
3650 BDT 3650 BDT
etc

user input form will be there 
Riot ID : (Placeholder Please Input your Riot id)

this user form can be for some product
its not necesserry it will be same for all products it can be one input form can be two can be dropdown select with options like this 

example another product :
product name : PUBG Mobile UC (Global)
product image
product  Description
Select Top-Up Amount
60UC 100BDT
300+25 UC 500BDT
600+60 UC 900 BDT
1500 + 300 UC 2300BDT

user input form : 
user input form will be there 
Player ID : (Placeholder Please Input your Player id)


another :

product name : iTunes Gift Card (US)

product image
product  Description
Select Denomination
iTunes Gift Card 2 USD US  - 200 BDT
iTunes Gift Card 10 USD US  - 1000 BDT
iTunes Gift Card 20 USD US  - 2000 BDT
iTunes Gift Card 50 USD US  - 5500 BDT
iTunes Gift Card 100 USD US  - 12000 BDT

no user form 


another product :
product name : Genshin Impact Miliastra Wonderland Top Up
product image
product  Description
Select Top-Up Amount

60 Chronal Nexus  - 100 BDT
300 + 30 Chronal Nexus  - 400 BDT
980 + 110 Chronal Nexus  - 1100 BDT
1980 + 260 Chronal Nexus  - 2500 BDT
3280 + 600 Chronal Nexus  - 3900 BDT

user input form : 
user input form will be there 
User ID : (Placeholder Please Input your User id)
Server : (Dropdown select : Options: (Europe, America, Asia))






Ok so about this website:
admin dashboard for a digital shop ecommerce product add functionalities example In Game TopUp Users can instantly top up in-game currencies from GameShop directly to their gaming accounts for a seamless experience. ID Code TopUp Users can easily top up using their unique player ID code to ensure secure and accurate transactions using GameShop.
user/guest both can purchase .
user go to product details page

this product will have a user form that need to filledup by user so showing Enter Riot ID then user select the varient example 475 VP which is 525 BDT

then Enter Email address (for guest if user then prefill this ) then choose payment provider if multiple present and pay so simple everything from the product page so covertion rate is high, no need billing address , shipping address , Delivery method

example this user form can be or cannot be as well, can be one input field can be two , can be dropdown as well it depeneds


Features :
Admin dashboard with product management (CRUD)
Admin dashboard with product Category management (CRUD)
Product listing with categories Product detail page with integrated checkout
Dynamic user forms per product
Variant selection with pricing
Payment provider selection


Make sure to do the api endpoints accordingly , then admin dashboard for the admin req and frontend part






i already did these :
Reviewing key files to understand the project structure and features.


[6 tools called]


Checking admin features and the database schema to understand the full scope:


[5 tools called]


Checking admin pages and user actions to see what features are implemented:


[5 tools called]


Checking authentication features and email functionality:


[4 tools called]


## Project overview: GameShop

A Next.js e-commerce authentication and admin system. Summary:

---

## Project status

**Project name:** GameShop  
**Version:** 0.1.0  
**Tech stack:** Next.js 16, TypeScript, Better Auth, PostgreSQL, Prisma, Redis (optional), shadcn/ui, Tailwind CSS

---

## Implemented features

### 1. Authentication system
- Email/Password authentication — registration and login
- OAuth — Google and Discord
- Email verification — OTP-based with 15-minute expiry
- Password reset — forgot password and reset flow
- Session management — Redis-backed (optional), database fallback
- Rate limiting — per-route limits
- Role-based access — User and Admin roles

### 2. User management
- User profiles — name, email, avatar
- Avatar upload — ImageKit integration
- Email verification status
- User banning — reason and expiry

### 3. Admin dashboard
- Dashboard overview — stats:
  - Total users
  - Verified/Unverified users
  - Admin users
  - Banned users
- User management page:
  - User list with pagination
  - Search and filters
  - Update user roles
  - Ban/Unban users
  - Toggle email verification
- Placeholder pages:
  - Products (not implemented)
  - Analytics (not implemented)
  - Settings (not implemented)

### 4. UI/UX
- Dark/Light theme (next-themes)
- Responsive design
- shadcn/ui components
- Email templates — verification, password reset, welcome
- Toast notifications (Sonner)
- Loading states and skeletons

---

## Project structure

```
gameshop/
├── app/
│   ├── (auth)/          # Auth pages (login, register, verify, etc.)
│   ├── admin/           # Admin dashboard pages
│   ├── actions/         # Server actions (auth, admin, user)
│   └── api/             # API routes
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── auth/            # Auth-related components
│   ├── layout/          # Header, footer, navigation
│   ├── theme/           # Theme provider and toggle
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── auth.ts          # Better Auth configuration
│   ├── email.ts         # Email utilities (Resend)
│   ├── prisma.ts        # Prisma client
│   ├── redis.ts         # Redis client
│   └── validations/     # Zod schemas
└── prisma/
    └── schema.prisma    # Database schema
```

---

## Database schema

### Core models
- User — id, email, name, image, role, banned, banReason, banExpires
- Account — OAuth account linking
- Session — user sessions with IP/userAgent tracking
- Verification — email verification OTPs
- RateLimit — rate limiting storage

### E-commerce models
- None found — migration file exists but is empty

---

## Authentication routes

- `/login` — Sign in
- `/register` — Sign up
- `/forgot-password` — Request password reset
- `/reset-password` — Reset password
- `/verify-email` — Verify email with OTP
- `/resend-verification` — Resend verification code

---

## Admin routes

- `/admin` — Dashboard overview
- `/admin/users` — User management
- `/admin/products` — Placeholder (coming soon)
- `/admin/analytics` — Placeholder (coming soon)
- `/admin/settings` — Placeholder (coming soon)

---

## Security features

- Rate limiting per route
- Session security (Redis-backed)
- Email verification
- Password reset flow
- OAuth integration
- Role-based access control
- User banning system

---

## Technologies & integrations

- Better Auth — authentication
- Prisma — ORM
- PostgreSQL — database
- Redis — optional session storage
- Resend — email sending
- ImageKit — image hosting (avatars)
- shadcn/ui — component library
- React Hook Form + Zod — form validation

---

## What’s missing / next steps

1. E-commerce features:
   - Product management
   - Shopping cart
   - Order management
   - Categories
   - Inventory

2. Admin features:
   - Product CRUD
   - Analytics dashboard
   - Settings page

3. User-facing features:
   - Product browsing
   - Shopping experience
   - Order history

---

## Current status

The project has a solid authentication and admin foundation. The admin dashboard includes user management, and authentication flows are implemented. The e-commerce side (products, orders, cart) is not implemented yet.




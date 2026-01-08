# 🏋️ FlexFit - Gym Day Pass Booking Platform

A full-stack application for booking gym day passes, consisting of a mobile app for users, a gym owner panel, and an admin dashboard.

## 📁 Project Structure

```
flexifit/
├── apps/
│   ├── backend/          # NestJS API server
│   ├── mobile/           # React Native app (User + Gym Owner)
│   └── admin/            # Next.js admin panel
├── packages/
│   └── shared/           # Shared types and utilities
├── package.json          # Root package.json (workspaces)
├── .env.example          # Environment variables template
└── README.md
```

## 🚀 Tech Stack

| Component       | Technology                    |
|-----------------|-------------------------------|
| Mobile App      | React Native + TypeScript     |
| Admin Panel     | Next.js + Tailwind CSS        |
| Backend         | NestJS + TypeScript           |
| Database        | PostgreSQL (Supabase)         |
| ORM             | Prisma                        |
| Authentication  | Supabase Auth (Email OTP)     |
| Location        | Google Maps API               |
| Payments        | Razorpay                      |
| Image Storage   | Cloudinary                    |

## 🛠️ Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Razorpay account
- Cloudinary account
- Google Maps API key

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flexifit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Setup database**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   npx prisma generate
   ```

## 🏃 Running the Applications

### Backend
```bash
npm run dev:backend
# Runs on http://localhost:3001
```

### Admin Panel
```bash
npm run dev:admin
# Runs on http://localhost:3000
```

### Mobile App
```bash
cd apps/mobile
npx expo start
```

## 📱 Features

### User App
- 📍 Location-based gym discovery
- 🏢 Gym details with images and amenities
- 📅 Day pass booking
- 💳 Razorpay payment integration
- 🎫 QR code for gym entry
- 📋 Booking history

### Gym Owner Panel
- 🏪 Gym registration
- 📊 Booking dashboard
- 📷 QR code scanner for check-ins
- ✏️ Gym details management

### Admin Panel
- ✅ Gym approval workflow
- 📈 Dashboard metrics
- 📋 Booking monitoring
- 👥 User management

## 📜 License

Private - All rights reserved

## 👥 Authors

FlexFit Team

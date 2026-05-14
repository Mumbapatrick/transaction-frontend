# 🚀 M-Pesa Scheduler Pro

M-Pesa Scheduler Pro is a modern full-stack fintech application designed to help users schedule, manage, automate, and analyze M-Pesa payments efficiently. The platform supports batch payments, contact management, budgeting, analytics, exports, and future-ready integration with Safaricom Daraja API.

The application combines a modern Next.js frontend with a Kotlin Spring Boot backend, Supabase PostgreSQL database, and M-Pesa Daraja API integration to provide a scalable and production-ready payment management system.

---

# 🌟 Key Features

## 📅 Smart Payment Scheduling
- Schedule one-time payments
- Plan recurring payments
- Set future transaction dates
- Manage pending and completed payments

## 👥 Batch Payment Processing
- Send payments to multiple recipients at once
- Validate phone numbers automatically
- Calculate batch totals instantly
- Simulated and real M-Pesa transaction support

## 📒 Contact Management
- Save and organize recipients
- Categorize contacts
- Edit and manage contact records
- Quick payment recipient selection

## 📊 Analytics Dashboard
- View payment trends
- Monitor spending categories
- Analyze transaction statistics
- Track payment history and activity

## 💰 Budget Management
- Set spending limits
- Monitor financial usage
- Receive budget alerts
- Track monthly payment summaries

## 📁 Export & Reporting
- Export transaction data to CSV
- Generate PDF payment reports
- Download payment histories
- Reporting for finance tracking

## 🌍 Multi-Currency Support
Supports:
- Kenyan Shilling (KES)
- US Dollar (USD)
- Euro (EUR)
- British Pound (GBP)

## 🔔 Notifications System
- Payment reminders
- Budget alerts
- Success & failure notifications
- Transaction updates

## 📱 Responsive UI
- Mobile-friendly design
- Modern dashboard interface
- Smooth user experience
- Built with Tailwind CSS and Radix UI

---

# 🏗️ System Architecture

```text
Frontend (Next.js + React + TypeScript)
                ↓
REST API Backend (Kotlin + Spring Boot)
                ↓
Supabase PostgreSQL Database
                ↓
Safaricom Daraja API (M-Pesa Integration)
```

---

# ⚙️ Tech Stack

## Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React Icons

## Backend
- Kotlin
- Spring Boot
- Spring Security
- REST APIs
- JWT Authentication

## Database
- Supabase PostgreSQL

## Payment Integration
- Safaricom Daraja API
- STK Push
- B2C Payments
- Transaction Status APIs

## Deployment
- Vercel (Frontend)
- Render (Backend)

---

# 🔥 Backend Setup (Kotlin + Spring Boot)

## Backend Project

Used Spring Initializer with:
- Kotlin
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- Validation
- JWT

---

# 📲 Safaricom Daraja API Integration

## Supported APIs
- STK Push
- B2C Payments
- Transaction Status
- Account Balance
- Callback Handling

---

# 🔐 Authentication & Security

Security features include:

- JWT Authentication
- Spring Security
- Protected APIs
- Role-based access control
- Secure payment processing

---

# 📈 Future Improvements

- Real Safaricom production integration
- AI-powered payment analytics
- Fraud detection system
- Real-time notifications
- Cross platiform mobile app
- Email & SMS alerts
- Cloud synchronization
- Offline mode support

---

# 🧠 Hydration & SSR Stability

The project includes hydration-safe rendering strategies:
- Client-side localStorage loading
- Safe React state initialization
- SSR-compatible rendering patterns
- Optimized Next.js app structure

---

# 👨‍💻 Author

Developed by Mumba Patrick

GitHub Repository:

https://github.com/Mumbapatrick/transaction-frontend

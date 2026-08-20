# UNITY A LIVE GROUP — Digital ID Registration System

A complete, production-ready **Digital ID Registration and Management System** built for **UNITY A LIVE GROUP**.

The application allows users to register, generate a unique membership ID, upload a profile photo, generate a high-resolution digital ID card, download the card as PDF/PNG, and verify membership using a QR code / public URL.

It also features a protected **Admin Panel** to search, filter, paginate, view, and manage all registrations and statistics.

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React.js (v18) + Vite
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **ID Card Capture & Export**: `html2canvas` + `jsPDF`
- **QR Code**: `qrcode.react`
- **HTTP Client**: Axios

### Backend
- **Platform**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: MongoDB Atlas (MongoDB Node Driver v6 with Worker `nodejs_compat`)
- **Image Storage**: Cloudinary (Signed REST API)
- **Auth**: JWT stored in HTTP-Only, Secure, SameSite cookies

---

## 📁 Project Structure

```text
unity-a-live-group/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IDCard.jsx            # Printable/Exportable Digital ID Card
│   │   │   ├── Loading.jsx           # Spinners and Loading states
│   │   │   ├── Navbar.jsx            # Organization Header
│   │   │   ├── PhotoUpload.jsx       # Drag & drop photo uploader + preview
│   │   │   ├── ProtectedRoute.jsx    # Admin route guard
│   │   │   └── QRCodeComponent.jsx   # QR Code component pointing to verify URL
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Admin stats, table, search, filter, pagination
│   │   │   ├── AdminLogin.jsx        # Admin authentication
│   │   │   ├── AdminRegistrationDetails.jsx # Detailed single registration view
│   │   │   ├── Registration.jsx      # Public registration form
│   │   │   ├── RegistrationSuccess.jsx # Post-registration card download
│   │   │   └── VerifyID.jsx          # Public ID verification page
│   │   ├── services/
│   │   │   └── api.js                # Axios API service
│   │   ├── utils/
│   │   │   ├── downloadIdCard.js     # html2canvas + jsPDF capture utility
│   │   │   └── validation.js         # Zod schemas for forms
│   │   ├── App.jsx                   # React Router entry
│   │   ├── index.css                 # Tailwind directives & custom CSS
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── worker/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT Auth middleware via Web Crypto API
│   │   ├── routes/
│   │   │   ├── admin.js              # Admin endpoints (login, logout, stats, registrations)
│   │   │   ├── public.js             # Public verification endpoint GET /api/id/:uniqueId
│   │   │   └── registration.js       # Registration endpoint POST /api/register
│   │   ├── services/
│   │   │   ├── cloudinary.js         # Cloudinary REST API upload/delete
│   │   │   ├── idGenerator.js        # UALG-2026-XXXXXX ID generator with uniqueness check
│   │   │   └── mongodb.js            # MongoDB Atlas connection manager
│   │   ├── utils/
│   │   │   └── validation.js         # Server-side validation
│   │   └── index.js                  # Hono Worker entry point
│   ├── package.json
│   └── wrangler.toml                 # Cloudflare Worker configuration
│
├── .gitignore
└── README.md
```

---

## 🔑 Environment Variables & Setup

### 1. Worker Setup (`worker/wrangler.toml`)
Non-secret configuration is stored in `worker/wrangler.toml`:

```toml
name = "unity-a-live-group-api"
main = "src/index.js"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
MONGODB_DATABASE = "unity_a_live_group"
MONGODB_COLLECTION = "registrations"
CLOUDINARY_CLOUD_NAME = "pplcot0h"
PUBLIC_BASE_URL = "http://localhost:5173"
ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:4173"
```

Set Cloudflare Secrets using `wrangler secret put <NAME>`:
- `MONGODB_URI`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` *(SHA-256 hash of admin password)*
- `SESSION_SECRET`

> **Helper**: To generate an `ADMIN_PASSWORD_HASH` using Node.js / PowerShell:
> ```powershell
> [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes("your_admin_password"))).Replace("-","").ToLower()
> ```

### 2. Frontend Setup (`frontend/.env`)
```env
VITE_API_URL=https://unity-a-live-group-api.manan-patel-cg.workers.dev
VITE_PUBLIC_BASE_URL=http://localhost:5173
```

---

## 🚀 Local Development

### 1. Worker API
```bash
cd worker
npm install
npm run dev
```

### 2. Frontend App
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the registration portal.

---

## ⚡ API Documentation

### Public Endpoints
- `POST /api/register`: Register new member with photo upload.
- `GET /api/id/:uniqueId`: Fetch public verification info for a given member.

### Admin Endpoints (Protected by JWT Cookie)
- `POST /api/admin/login`: Authenticate admin and set HTTP-only cookie.
- `POST /api/admin/logout`: Clear authentication cookie.
- `GET /api/admin/me`: Get current logged-in admin.
- `GET /api/admin/stats`: Get member registration statistics.
- `GET /api/admin/registrations`: List members with search, blood group filter, city filter, and pagination.
- `GET /api/admin/registrations/:uniqueId`: Fetch single member details.
- `DELETE /api/admin/registrations/:uniqueId`: Delete member record and corresponding Cloudinary image.

---

## 🌐 Deployment Instructions

### Cloudflare Workers (Backend)
```bash
cd worker
npx wrangler deploy
```

### Cloudflare Pages (Frontend)
```bash
cd frontend
npm run build
```
Deploy the `frontend/dist` directory to Cloudflare Pages.

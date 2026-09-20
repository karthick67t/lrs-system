# Loyalty Reward Management System - Production Deployment Guide

This guide outlines the step-by-step instructions to deploy the **Loyalty Reward Management System** for **FREE** using:
- **Frontend**: Vercel (Static Web Hosting with SPA Rewrites)
- **Backend**: Render (Free Web Service)
- **Database**: PostgreSQL (Render PostgreSQL / Neon.tech / Supabase / Aiven Free Tier)
- **GitHub Repository**: [https://github.com/karthick67t/lrs-system.git](https://github.com/karthick67t/lrs-system.git)

---

## 1. PostgreSQL Database Hosting Setup

You can use any free PostgreSQL database provider (such as Render PostgreSQL, Neon.tech, Supabase, or Aiven).

1. Create a free PostgreSQL database instance on your chosen provider.
2. Note down your connection credentials:
   - Host / Hostname
   - Port (Default: `5432`)
   - Database Name
   - Username
   - Password
3. Construct your JDBC Database URL:
   ```text
   jdbc:postgresql://<HOST>:<PORT>/<DATABASE_NAME>?sslmode=require
   ```

---

## 2. Render Backend Deployment (Spring Boot)

1. Log in to [Render Console](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/karthick67t/lrs-system.git`.
4. Configure the Web Service:
   - **Name**: `lrs-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Java` (or `Native Environment` with Java 17)
   - **Build Command**:
     ```bash
     mvn clean package -DskipTests
     ```
   - **Start Command**:
     ```bash
     java -jar target/rewards-backend-1.0.0.jar
     ```
   - **Instance Type**: `Free`

5. Add the following **Environment Variables** in Render Dashboard under **Environment**:

| Environment Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | JDBC Connection URL | `jdbc:postgresql://ep-xyz.postgres.database.azure.com:5432/loyalty_db?sslmode=require` |
| `DATABASE_USERNAME` | Database User | `postgres` |
| `DATABASE_PASSWORD` | Database Password | `YourSecurePassword123` |
| `JWT_SECRET` | 64-char Hex Secret Key | `9a2f8c4e6b1d3a7f9e8d2c4b6a8f1e3d5c7b9a1f3e5d7c9b2a4f6e8d1c3b5a7f` |
| `JWT_EXPIRATION` | Token Expiry (ms) | `86400000` |
| `FRONTEND_URL` | Deployed Vercel Domain | `https://lrs-system.vercel.app` |

6. Deploy the Web Service and copy your public backend URL (e.g. `https://lrs-backend.onrender.com`).

---

## 3. Vercel Frontend Deployment (React + Vite)

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `https://github.com/karthick67t/lrs-system.git`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://lrs-backend.onrender.com` (Your Render Backend URL) |

6. Click **Deploy**.

---

## 4. CORS & SPA Routing Configuration

- **CORS Handling**: The backend `SecurityConfig.java` reads `FRONTEND_URL` and permits cross-origin requests from your Vercel frontend.
- **SPA Rewrites**: The `frontend/vercel.json` file automatically handles single-page application routing so direct links like `/login`, `/dashboard`, `/members`, `/rewards` work without 404 errors.

---

## 5. Post-Deployment Testing

1. Open your Vercel URL (e.g. `https://lrs-system.vercel.app`).
2. Verify the Landing Page loads.
3. Click **Login** and test with initial seed accounts:
   - **Customer**: `customer@loyalty.com` / `customer123`
   - **Super Admin**: `admin@loyalty.com` / `admin123`
   - **Manager**: `manager@loyalty.com` / `manager123`
   - **Staff**: `staff@loyalty.com` / `staff123`
4. Confirm Dashboard loads, data populates, and backend REST APIs respond.

---

## 6. How to Redeploy on Future Pushes

- **Automatic Deployments**: Both Vercel and Render automatically trigger a build whenever you push new commits to the `main` branch of `https://github.com/karthick67t/lrs-system.git`.
- **Manual Redeployment**: You can trigger a manual deployment anytime from the Vercel or Render project dashboards.

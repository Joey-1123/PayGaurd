# 🛡️ PayGuard Frontend / Web

> **Agentic Guardian for Real-Time Payment Scam Interception**
> Admin & Analyst Web Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📖 Overview

The PayGuard Frontend/Web sub-project provides a comprehensive dashboard for risk monitoring and payment interception analysis. Built for admins and fraud analysts, the interface visualizes real-time payment sagas, agent reasoning paths, and overall threat intelligence metrics gathered by the PayGuard backend.

## ✨ Features

- **Real-Time Threat Monitoring:** Track payment risk scores and interception status instantly.
- **Saga Visualizations:** Dynamic flowcharts of payment lifecycles using Mermaid.js.
- **Agent Reasoning Transparency:** Drill down into multi-model AI agent evaluations and justifications for blocked transactions.
- **Responsive Design:** Crafted with Tailwind CSS for optimal viewing across various desktop monitors.
- **Robust State Management:** High-performance, scalable state handling with Zustand.

## 🏗️ Architecture

The application is built using the Next.js 14 App Router (`app/` directory). It leverages a modern frontend stack:
- **Framework:** Next.js 14.2, React 18
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **State Management:** Zustand 5
- **Data Fetching:** Axios
- **Diagrams:** Mermaid 12
- **Icons:** Lucide React

It connects to the PayGuard backend via REST APIs located at `/api/v1`.

## 📋 Prerequisites

Ensure you have the following installed on your local machine:
- Node.js (v18 or higher recommended)
- npm (v9 or higher) or yarn/pnpm

## 💻 Installation

1. Clone the repository and navigate to the web frontend directory:
   ```bash
   cd src/paygraud/frontend/web
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

## 🚀 Running

### Development Mode

Run the development server on `http://localhost:3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page auto-updates as you modify files like `app/page.tsx`.

### Production Build

To build and run the production-optimized application:
```bash
npm run build
npm start
```

## 🔐 Environment Variables

Create a `.env.local` file in the root of `src/paygraud/frontend/web` with the following variables:

```env
# Base URL for the PayGuard backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📂 Project Structure

```text
src/paygraud/frontend/web/
├── app/
│   ├── page.tsx          # Main dashboard view
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components (UI, charts, forms)
├── lib/                  # Utilities, Axios instances, formatting tools
├── store/                # Zustand state stores
├── public/               # Static assets
├── tailwind.config.ts    # Tailwind styling configuration
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies and scripts
└── README.md             # This documentation file
```

## 🤝 Contributing

Contributions to the PayGuard Web Frontend are welcome! Please adhere to the main repository's contribution guidelines.
- Keep commits small and focused (under 100 LOC when possible).
- Use clear, descriptive commit messages.
- Ensure all TypeScript checks and builds pass before submitting a Pull Request.

## 📄 License

This project is licensed under the MIT License.

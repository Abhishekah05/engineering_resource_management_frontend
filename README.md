# Resource Management Frontend

This is the frontend for the Engineering Resource Management System. It is built with React, TypeScript, Zustand, React Hook Form, Material UI, and Tailwind CSS.

## Tech Stack
- React + TypeScript
- Zustand (state management)
- React Hook Form (forms)
- Material UI (UI components)
- Tailwind CSS (utility-first styling)
- Vite (build tool)

## Folder Structure
```
frontend/
├── src/
│   ├── pages/           # Main app pages (Login, Register, Dashboards, Profile, etc.)
│   ├── components/      # Reusable UI components
│   ├── store/           # Zustand stores (authStore, etc.)
│   ├── utils/           # API utilities, helpers
│   ├── types/           # TypeScript types (Project, User, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── assets/          # Static assets
│   ├── index.css        # Tailwind and global styles
│   ├── App.tsx          # Main app component (routing, layout)
│   └── main.tsx         # Entry point
├── tailwind.config.js   # Tailwind config
├── postcss.config.cjs   # PostCSS config (use .cjs for ESM compatibility)
├── vite.config.ts       # Vite config
├── package.json         # Frontend dependencies
└── ...
```

## Setup & Run
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the dev server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Features
- **Authentication:** Login & register (JWT-based)
- **Role-based Dashboards:**
  - **Manager:** Create/edit/delete projects, assign engineers, view team capacity
  - **Engineer:** View assignments, profile, and capacity
- **Profile Management:** View and update user info
- **Project Management:** Create, edit, delete, and assign engineers to projects
- **Assignment Management:** Assign engineers with allocation %
- **Modern UI:** Material UI components, Tailwind utility classes

## API Integration
- All API calls use `http://localhost:5000` as the backend base URL (see `src/utils/api.ts`)
- JWT token is stored in `localStorage` and sent with every authenticated request

## Notes
- Make sure the backend is running at `http://localhost:5000`
- Install Material UI and icons if not already:
  ```sh
  npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
  ```
- For Tailwind utility classes like `btn` and `input`, you may use DaisyUI or replace with Material UI components

---

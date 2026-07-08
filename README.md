# Next.js Application

A modern Next.js application with JavaScript, Tailwind CSS, shadcn/ui, and more.

## Getting Started

### Prerequisites

- Node.js 18.x or later

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod

## Project Structure

```
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
├── lib/              # Core utilities & shadcn/ui utils
├── hooks/            # Custom React hooks
├── services/         # API services layer
├── store/            # Zustand stores
├── utils/            # Helper functions
├── constants/        # Application constants
├── assets/           # Static assets
├── styles/           # Additional CSS styles
└── public/           # Public static files
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)

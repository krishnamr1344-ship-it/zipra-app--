import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ToastProvider } from "@/components/providers/toast-provider";
import { FirebaseAuthProvider } from "@/lib/firebase";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Zipra — Fresh groceries in minutes",
    template: "%s · Zipra",
  },
  description:
    "Premium grocery delivery. Fresh fruits, vegetables, daily essentials delivered in minutes.",
  applicationName: "Zipra",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zipra",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#FF7A00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider>
          <ToastProvider>
            <FirebaseAuthProvider>
              <AppShell>{children}</AppShell>
            </FirebaseAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

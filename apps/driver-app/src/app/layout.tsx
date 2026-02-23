import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paradise Driver - Drive with Paradise",
  description: "Professional driver app for Paradise Delivery. Earn more with every delivery.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-dark-900 text-white min-h-screen">
        <div className="max-w-md mx-auto min-h-screen bg-dark-900 relative shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}

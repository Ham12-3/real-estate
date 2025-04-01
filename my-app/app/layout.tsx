import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Rental Listings',
  description: 'Find your perfect rental property',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              RentalSpace
            </Link>
            <nav className="space-x-4">
              <Link href="/">
                <Button variant="ghost">Browse</Button>
              </Link>
              <Link href="/properties/new">
                <Button variant="ghost">List Property</Button>
              </Link>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-gray-500">
            RentalSpace &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </body>
    </html>
  );
}

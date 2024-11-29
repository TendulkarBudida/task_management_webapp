"use client";

import "./globals.css";
import ProtectedLayout from "./(protected)/layout";
import { AuthProvider, useAuth } from '../../lib/auth';
import LoginPage from './(auth)/login/page';
import SignupPage from './(auth)/signup/page';
import { usePathname, useRouter } from 'next/navigation';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user && pathname !== '/admin') {
    if (pathname === '/signup') {
      return <SignupPage />;
    }
    return <LoginPage />;
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    router.push('/');
    return null;
  }

  if (user && pathname === '/login') {
    return <ProtectedLayout>{children}</ProtectedLayout>;
  }

  return <ProtectedLayout>{children}</ProtectedLayout>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

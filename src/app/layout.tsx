import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Sahraoui Store | Votre expert électronique au Maroc',
  description: 'Achetez vos appareils électroménagers, smartphones et informatique au meilleur prix au Maroc. Livraison rapide et paiement à la livraison.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased text-foreground selection:bg-primary/30 flex flex-col min-h-screen" suppressHydrationWarning>
        <FirebaseClientProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

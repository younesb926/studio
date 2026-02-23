
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md bg-white p-12 rounded-3xl shadow-xl border">
          <h1 className="text-8xl font-black text-primary mb-4 italic">404</h1>
          <h2 className="text-2xl font-bold mb-6">عذراً، الصفحة غير موجودة!</h2>
          <p className="text-muted-foreground mb-8">
            يبدو أن الرابط الذي تحاول الوصول إليه غير متاح حالياً أو تم نقله.
          </p>
          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/90 text-secondary h-12 text-lg font-black gap-2">
              <Home className="h-5 w-5" /> العودة للرئيسية
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

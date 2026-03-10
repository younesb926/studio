
"use client"

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, ShoppingCart, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { categories } from '@/lib/data';

export function Header() {
  const { itemCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      <div className="container mx-auto px-4">
        {/* Mobile Header Top */}
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 bg-primary text-primary-foreground text-left">
                  <SheetTitle className="text-xl font-bold">Sahraoui Store</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="py-3 text-lg font-medium border-b last:border-0 hover:text-primary transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tighter italic">
                SAHRAOUI<span className="text-primary">STORE</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <User className="h-6 w-6" />
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-10 w-10">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar - ElectroMall Style */}
        <div className="pb-4">
          <form onSubmit={handleSearch} className="relative flex items-center h-12 rounded-full border-2 border-primary overflow-hidden">
            <Input 
              placeholder="Qu'est-ce qui vous ferait plaisir ?" 
              className="flex-1 border-none focus-visible:ring-0 text-sm pl-6 h-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="h-full px-6 bg-primary hover:bg-primary/90 rounded-none">
              <Search className="h-5 w-5 text-primary-foreground" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

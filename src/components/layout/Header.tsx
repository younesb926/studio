
"use client"

import Link from 'next/link';
import { Menu, Search, ShoppingCart, User, X, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { categories } from '@/lib/data';

export function Header() {
  const { itemCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      {/* Top Bar */}
      <div className="bg-secondary text-secondary-foreground py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> 05 22 XX XX XX</span>
            <span>Besoin d'aide ? Contactez-nous</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track" className="hover:text-primary transition-colors">Suivre ma commande</Link>
            <Link href="/about" className="hover:text-primary transition-colors">À propos</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 bg-primary text-primary-foreground text-left">
                  <SheetTitle className="text-xl font-bold">Sahraoui Store</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Catégories</p>
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

            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-black text-2xl leading-none">S</div>
              <span className="text-2xl font-black tracking-tighter text-secondary hidden sm:inline-block">SAHRAOUI<span className="text-primary">STORE</span></span>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par marque, produit ou catégorie..." 
                className="pl-12 h-12 w-full bg-muted/50 border-none ring-1 ring-border focus:ring-2 focus:ring-primary text-base rounded-full"
              />
              <Button className="absolute right-1 top-1 bottom-1 px-6 rounded-full font-bold">RECHERCHER</Button>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-6 w-6" />
            </Button>
            
            <Link href="/account" className="hidden md:block">
              <Button variant="ghost" className="gap-2 font-bold hover:text-primary">
                <User className="h-5 w-5" />
                <span>Compte</span>
              </Button>
            </Link>

            <Link href="/account" className="md:hidden">
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative group">
                <ShoppingCart className="h-6 w-6 group-hover:text-primary transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
        
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 w-full bg-background h-10"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Nav Desktop */}
      <div className="hidden lg:block border-t">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 h-12">
            <Link href="/deals" className="text-primary font-bold uppercase text-sm flex items-center gap-1">Ventes Flash</Link>
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="text-sm font-semibold hover:text-primary transition-colors uppercase">
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

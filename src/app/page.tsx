"use client"

import { Header } from '@/components/layout/Header';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductCard } from '@/components/product/ProductCard';
import { products, categories } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-promo');
  const featured = products.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[300px] md:h-[450px] overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="Promo Sahraoui Store"
              fill
              priority
              className="object-cover"
              data-ai-hint="electronics banner"
            />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-md text-white space-y-4">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                  Saison <span className="text-primary">Sahraoui</span>
                </h1>
                <p className="text-lg md:text-xl font-medium">
                  Jusqu'à -40% sur une sélection de produits gros électroménager.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                  Découvrir les offres
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <CategoryGrid />

        {/* Featured Products */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Produits Vedettes</h2>
              <Button variant="link" className="text-primary font-bold group">
                Voir tout <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Brand Promise Section */}
        <section className="py-12 border-t">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-primary rounded-full" />
                </div>
                <h3 className="font-bold text-lg mb-2">Paiement à la Livraison</h3>
                <p className="text-sm text-muted-foreground">Commandez l'esprit tranquille, payez uniquement à la réception de votre colis.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-primary rounded-full" />
                </div>
                <h3 className="font-bold text-lg mb-2">Garantie Officielle</h3>
                <p className="text-sm text-muted-foreground">Tous nos produits sont neufs, originaux et bénéficient d'une garantie constructeur.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-bold text-xl leading-none">SS</div>
                <span className="text-xl font-bold text-white">Sahraoui Store</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Votre destination n°1 pour l'électronique de qualité au Maroc. Qualité, prix et service client irréprochable.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Navigation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-primary">Livraison</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Catégories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {categories.slice(0, 4).map(cat => (
                  <li key={cat.id}><Link href={`/category/${cat.slug}`} className="hover:text-primary">{cat.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-widest">Contactez-nous</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>05 22 XX XX XX</li>
                <li>support@sahraouistore.ma</li>
                <li>Casablanca, Maroc</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-muted/20 pt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sahraoui Store. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

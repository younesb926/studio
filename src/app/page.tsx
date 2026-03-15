
"use client"

import { Header } from '@/components/layout/Header';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductCard } from '@/components/product/ProductCard';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { Product } from '@/lib/types';

export default function Home() {
  const db = useFirestore();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-promo');

  const featuredQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'), 
      where('status', '==', 'PUBLISHED'),
      limit(10)
    );
  }, [db]);

  const { data: productsData, isLoading } = useCollection(featuredQuery);
  const products = (productsData || []) as unknown as Product[];

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background">
          <div className="container mx-auto px-0 md:px-4 py-0 md:py-4">
            <div className="relative w-full aspect-[2.5/1] overflow-hidden rounded-none md:rounded-xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt="Promo Sahraoui Store"
                  fill
                  priority
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <CategoryGrid />

        {/* Featured Products */}
        <section className="py-12 bg-background mt-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold">Sélection du moment</h2>
              <Link href="/">
                <Button variant="link" className="text-primary font-bold">
                  Voir tout <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <p>Aucun produit n'est disponible pour le moment.</p>
                <p className="text-sm">Ajoutez des produits depuis le panneau d'administration.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/212710669953" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#128c7e] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.181-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.109.004.258-.041.405.314.159.386.541 1.32.588 1.417.047.097.078.21.014.339-.063.128-.094.209-.188.319-.094.109-.197.244-.28.328-.101.101-.206.21-.089.412.116.202.518.854 1.112 1.381.766.68 1.408.89 1.61.992.202.101.32.083.438-.054.118-.137.503-.586.637-.786.135-.199.27-.166.455-.097.185.069 1.176.554 1.381.657s.341.155.39.238c.049.083.049.481-.095.886z" />
        </svg>
      </a>
    </div>
  );
}

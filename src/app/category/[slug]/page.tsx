
"use client"

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { categories as staticCategories } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Product } from '@/lib/types';

export default function CategoryPage() {
  const { slug } = useParams();
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch Categories to get the current one
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: dbCategories } = useCollection(categoriesQuery);
  const displayCategories = dbCategories && dbCategories.length > 0 ? dbCategories : staticCategories;
  const category = displayCategories.find(c => c.slug === slug);

  // Fetch Products for THIS category slug
  const productsQuery = useMemoFirebase(() => {
    if (!db || !slug) return null;
    return query(
      collection(db, 'products'), 
      where('categorySlug', '==', slug),
      where('status', '==', 'PUBLISHED')
    );
  }, [db, slug]);

  const { data: categoryProducts, isLoading } = useCollection(productsQuery);

  if (!category && isMounted && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Catégorie non trouvée</h1>
          <Link href="/">
            <Button className="bg-primary text-secondary font-bold">Retour à l'accueil</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs & Title */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">Accueil</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-bold">{category?.name || slug}</span>
          </div>

          <div className="flex items-center justify-between mb-8 bg-background p-4 rounded-xl border shadow-sm">
            <h1 className="text-xl md:text-2xl font-black">{category?.name || slug}</h1>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !categoryProducts || categoryProducts.length === 0 ? (
            <div className="bg-background rounded-2xl p-12 text-center border shadow-sm">
              <p className="text-muted-foreground mb-4">Aucun produit n'est disponible dans cette catégorie pour le moment.</p>
              <Link href="/">
                <Button variant="link" className="text-primary font-bold">Parcourir d'autres sections</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product as unknown as Product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

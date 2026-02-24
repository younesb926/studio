
"use client"

import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProductCard } from '@/components/product/ProductCard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Loader2, SearchX } from 'lucide-react';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const db = useFirestore();

  // In a real Firestore app, full-text search is limited. 
  // For this prototype, we'll fetch all published products and filter client-side 
  // to ensure we catch partial matches since Firestore only supports prefix matches.
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('status', '==', 'PUBLISHED'));
  }, [db]);

  const { data: productsData, isLoading } = useCollection(productsQuery);
  const allProducts = (productsData || []) as unknown as Product[];

  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(queryParam.toLowerCase()) ||
    product.description?.toLowerCase().includes(queryParam.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-2xl font-bold">Résultats pour :</h1>
        <span className="text-2xl font-black text-primary italic">"{queryParam}"</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 font-bold text-muted-foreground">Recherche en cours...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchX className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black mb-4">Aucun résultat trouvé</h2>
          <p className="text-muted-foreground">
            Nous n'avons trouvé aucun produit correspondant à votre recherche. 
            Essayez d'utiliser des mots-clés plus généraux.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }>
          <SearchResults />
        </Suspense>
      </main>
    </div>
  );
}

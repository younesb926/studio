"use client"

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ShieldCheck, Truck, RefreshCw, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, query, collection, where, limit } from 'firebase/firestore';
import { Product } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ProductPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, isLoading: isProductLoading } = useDoc(productRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const recommendedProductsQuery = useMemoFirebase(() => {
    if (!db || !product?.categorySlug) return null;
    return query(
      collection(db, 'products'),
      where('categorySlug', '==', product.categorySlug),
      where('status', '==', 'PUBLISHED'),
      limit(6) // Fetch 6 to have extras if current product is included
    );
  }, [db, product]);

  const { data: recommendedProductsData, isLoading: areRecsLoading } = useCollection(recommendedProductsQuery);
  
  // Filter out the current product from the recommendations
  const recommendedProducts = (recommendedProductsData || [])
    .filter(p => p.id !== id)
    .slice(0, 5) as unknown as Product[];


  if (isProductLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">Produit non trouvé</div>
    </div>
  );

  // Ensure we have an array of images, fallback if empty
  const images = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls 
    : [product.imageUrl || 'https://picsum.photos/seed/default/500/500'];

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product as unknown as Product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} est maintenant dans votre panier.`,
    });
  };

  const displayPrice = isMounted ? product.price.toLocaleString() : product.price.toString();
  const displayOriginalPrice = isMounted && product.originalPrice ? product.originalPrice.toLocaleString() : (product.originalPrice?.toString() || "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <div className="relative group">
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((url, idx) => (
                      <CarouselItem key={idx}>
                        <div className="relative aspect-square bg-white rounded-2xl border overflow-hidden shadow-sm">
                          <Image
                            src={url}
                            alt={`${product.name} - image ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized={true}
                            priority={idx === 0}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4 bg-white/80 hover:bg-white text-secondary border-none shadow-lg" />
                      <CarouselNext className="right-4 bg-white/80 hover:bg-white text-secondary border-none shadow-lg" />
                    </>
                  )}

                  {discount > 0 && (
                    <Badge className="absolute top-4 left-4 bg-red-600 text-white font-black text-lg p-2 z-10">
                      -{discount}%
                    </Badge>
                  )}
                </Carousel>
              </div>

              {/* Thumbnails indicator */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg border-2 border-muted overflow-hidden shrink-0">
                      <Image src={url} alt="thumbnail" fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground font-bold">
                  Nouvel Arrivage
                </Badge>
                <h1 className="text-3xl font-black">{product.name}</h1>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-muted-foreground text-xs ml-2">(24 avis clients)</span>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary">{displayPrice} DH</span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {displayOriginalPrice} DH
                    </span>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {product.descriptionDetailed || product.descriptionShort || product.description || product.name}
                </p>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className={`h-2.5 w-2.5 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    {product.stockQuantity > 0 ? `En stock (${product.stockQuantity} unités disponibles)` : 'En rupture de stock'}
                  </div>
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-lg"
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity === 0}
                  >
                    Ajouter au Panier
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border flex flex-col items-center text-center gap-2 shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <span className="text-xs font-bold uppercase">Garantie 1 an</span>
                </div>
                <div className="p-4 bg-white rounded-xl border flex flex-col items-center text-center gap-2 shadow-sm">
                  <Truck className="h-8 w-8 text-primary" />
                  <span className="text-xs font-bold uppercase">Livraison Gratuite</span>
                </div>
                <div className="p-4 bg-white rounded-xl border flex flex-col items-center text-center gap-2 shadow-sm">
                  <RefreshCw className="h-8 w-8 text-primary" />
                  <span className="text-xs font-bold uppercase">Retours 7 jours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {(areRecsLoading || recommendedProducts.length > 0) && (
            <div className="mt-16">
              <h2 className="text-2xl font-black mb-8 border-b pb-4 italic">PRODUITS <span className="text-primary">SIMILAIRES</span></h2>
              {areRecsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                   {recommendedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

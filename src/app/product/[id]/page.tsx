
"use client"

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ShieldCheck, Truck, RefreshCw, Star, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { personalizedProductRecommendations } from '@/ai/flows/personalized-product-recommendations-flow';
import { ProductCard } from '@/components/product/ProductCard';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, query, collection, where, limit } from 'firebase/firestore';
import { Product } from '@/lib/types';

export default function ProductPage() {
  const { id } = useParams();
  const db = useFirestore();
  const { addToCart } = useCart();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, isLoading: isProductLoading } = useDoc(productRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchRecs() {
      if (product) {
        setLoadingRecs(true);
        try {
          // Fix: Ensure browsingHistory contains only non-null strings
          // Use categorySlug instead of categoryId for consistency
          const history = [product.name, product.categorySlug].filter((item): item is string => typeof item === 'string' && item.length > 0);
          
          const result = await personalizedProductRecommendations({
            browsingHistory: history,
            numRecommendations: 4
          });
          setRecommendations(result.recommendations);
        } catch (e) {
          console.error("Failed to fetch AI recommendations", e);
        } finally {
          setLoadingRecs(false);
        }
      }
    }
    fetchRecs();
  }, [product]);

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

  const imageUrl = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls[0] 
    : (product.imageUrl || 'https://picsum.photos/seed/default/500/500');

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
              <div className="relative aspect-square bg-white rounded-2xl border overflow-hidden shadow-sm">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white font-black text-lg p-2">
                    -{discount}%
                  </Badge>
                )}
              </div>
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
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.descriptionDetailed || product.descriptionShort || product.name}
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

          {/* AI Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black mb-8 border-b pb-4 italic">POURRAIENT VOUS <span className="text-primary">INTÉRESSER</span></h2>
              {loadingRecs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {/* In a production app, we would fetch the actual products by name/id here. 
                       For this prototype, we just show that the AI generated recommendations. */}
                   <p className="col-span-full text-sm text-muted-foreground mb-4">L'IA suggère : {recommendations.join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

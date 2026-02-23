
"use client"

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { products } from '@/lib/data';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { personalizedProductRecommendations } from '@/ai/flows/personalized-product-recommendations-flow';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    async function fetchRecs() {
      if (product) {
        setLoadingRecs(true);
        try {
          const result = await personalizedProductRecommendations({
            browsingHistory: [product.name, product.categoryId],
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

  if (!product) return <div>Produit non trouvé</div>;

  const placeholder = PlaceHolderImages.find(img => img.id === product.imageId);
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} est maintenant dans votre panier.`,
    });
  };

  // Find matching products from mock data for recommendations
  const recommendedProducts = products.filter(p => 
    recommendations.some(recName => p.name.toLowerCase().includes(recName.toLowerCase()) || p.categoryId === product.categoryId)
  ).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white rounded-2xl border overflow-hidden shadow-sm">
                {placeholder && (
                  <Image
                    src={placeholder.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white font-black text-lg p-2">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Info */}
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
                  <span className="text-4xl font-black text-primary">{product.price.toLocaleString()} DH</span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {product.originalPrice.toLocaleString()} DH
                    </span>
                  )}
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    {product.stock > 0 ? `En stock (${product.stock} unités disponibles)` : 'En rupture de stock'}
                  </div>
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
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
          <section className="mt-16 pt-16 border-t">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Produits recommandés pour vous</h2>
              <div className="h-1 bg-primary w-24 rounded-full" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {loadingRecs ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted aspect-[3/4] rounded-xl" />
                ))
              ) : recommendedProducts.length > 0 ? (
                recommendedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))
              ) : (
                products.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

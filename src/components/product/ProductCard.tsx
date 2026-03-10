
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use product images from Firestore (ImgBB URLs)
  const imageUrl = (product.imageUrls && product.imageUrls.length > 0) 
    ? product.imageUrls[0] 
    : (product.imageUrl || 'https://picsum.photos/seed/default/500/500');

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  const displayPrice = isMounted ? product.price.toLocaleString() : product.price.toString();
  const displayOriginalPrice = isMounted && product.originalPrice ? product.originalPrice.toLocaleString() : (product.originalPrice?.toString() || "");

  return (
    <Link href={`/product/${product.id}`} className="group bg-background rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-500 flex flex-col h-full relative">
      <div className="relative aspect-square overflow-hidden bg-muted m-2 rounded-lg">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          unoptimized={true} // Bypasses Next.js Image optimization for immediate reflecting of new uploads
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {discount > 0 && (
            <Badge className="bg-primary text-primary-foreground font-black text-xs px-2 py-0.5 rounded-none shadow-lg">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-foreground text-background font-bold text-[10px] rounded-none shadow-lg">
              HOT
            </Badge>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/95 text-red-600 border-red-200 text-[10px] font-black uppercase">
            Plus que {product.stock} restants
          </Badge>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-1">
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sahraoui Verified</span>
        </div>
        
        <h3 className="font-bold text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors leading-tight">
          {product.name}
        </h3>
        
        <div className="flex flex-col mt-auto pt-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl font-black text-secondary-foreground">{displayPrice} <span className="text-xs">DH</span></span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through font-medium">
                {displayOriginalPrice} DH
              </span>
            )}
          </div>
          
          <Button 
            className="w-full mt-4 bg-primary text-primary-foreground font-black h-11 rounded-lg shadow-md transition-all group-hover:shadow-primary/20 flex items-center gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            ACHETER
          </Button>
        </div>
      </div>
    </Link>
  );
}

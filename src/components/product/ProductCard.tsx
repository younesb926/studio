
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const placeholder = PlaceHolderImages.find(img => img.id === product.imageId);

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
    <Link href={`/product/${product.id}`} className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            data-ai-hint={placeholder.imageHint}
          />
        )}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-600 text-white font-bold">
            -{discount}%
          </Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-white/90 text-red-600 border-red-200">
            Presque épuisé
          </Badge>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex flex-col mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{displayPrice} DH</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {displayOriginalPrice} DH
              </span>
            )}
          </div>
          <Button 
            className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </Button>
        </div>
      </div>
    </Link>
  );
}


"use client"

import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { items, total, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8">Votre Panier</h1>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl p-12 shadow-sm text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-8">Parcourez nos catégories et trouvez les meilleures offres du moment.</p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
                  Commencer mes achats
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const placeholder = PlaceHolderImages.find(img => img.id === item.imageId);
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl border flex gap-4 shadow-sm">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {placeholder && (
                          <Image
                            src={placeholder.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-sm line-clamp-2">{item.name}</h3>
                            <p className="text-primary font-bold mt-1">{item.price.toLocaleString()} DH</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-red-600 -mt-2 -mr-2"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border rounded-lg bg-muted/30">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-bold">Total: {(item.price * item.quantity).toLocaleString()} DH</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border shadow-sm p-6 sticky top-24">
                  <h2 className="text-lg font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Résumé de la commande</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{total.toLocaleString()} DH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span className="text-green-600 font-medium">Gratuite</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg">Total</span>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{total.toLocaleString()} DH</p>
                        <p className="text-[10px] text-muted-foreground uppercase">TVA Incluse</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-bold">
                      Passer à la caisse
                    </Button>
                  </Link>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Paiement à la livraison disponible partout au Maroc.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

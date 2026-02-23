
"use client"

import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { total, clearCart, items } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order processing
    toast({
      title: "Commande enregistrée",
      description: "Votre commande a été reçue avec succès.",
    });
    setStep('success');
    clearCart();
  };

  if (items.length === 0 && step === 'form') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="mb-4">Votre panier est vide.</p>
          <Link href="/"><Button>Retour aux achats</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {step === 'form' ? (
            <>
              <div className="flex items-center gap-2 mb-8">
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">Finaliser la commande</h1>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h2 className="font-bold text-lg mb-4">Informations de livraison</h2>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Nom Complet</Label>
                        <Input id="fullname" placeholder="Ex: Ahmed Alaoui" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" placeholder="06XXXXXXXX" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input id="city" placeholder="Ex: Casablanca" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse de livraison</Label>
                        <Input id="address" placeholder="N°, Rue, Quartier..." required />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <h2 className="font-bold text-lg mb-4">Mode de Paiement</h2>
                    <RadioGroup defaultValue="cod">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg bg-primary/5 border-primary">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <span className="font-bold block">Paiement à la livraison (COD)</span>
                          <span className="text-xs text-muted-foreground">Payez en espèces lorsque vous recevez votre commande.</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="font-bold text-lg mb-4 uppercase text-xs tracking-widest text-muted-foreground">Récapitulatif</h2>
                    <div className="space-y-3 mb-6">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="flex-1 pr-4 line-clamp-1">{item.quantity}x {item.name}</span>
                          <span className="font-medium">{(item.price * item.quantity).toLocaleString()} DH</span>
                        </div>
                      ))}
                      <Separator className="my-4" />
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total à payer</span>
                        <span className="text-primary">{total.toLocaleString()} DH</span>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 text-xl">
                      Confirmer la commande
                    </Button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      En cliquant sur "Confirmer", vous acceptez nos conditions générales de vente.
                    </p>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="max-w-md mx-auto text-center py-12 bg-white rounded-2xl border shadow-sm">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-black mb-2">Merci !</h1>
              <p className="text-lg font-bold mb-2">Votre commande est confirmée.</p>
              <p className="text-muted-foreground mb-8 px-8">
                Un conseiller client vous appellera dans les prochaines minutes pour confirmer les détails de votre livraison.
              </p>
              <div className="space-y-3 px-8">
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                    Continuer mes achats
                  </Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline" className="w-full">
                    Suivre ma commande
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

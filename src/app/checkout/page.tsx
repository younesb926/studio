
"use client"

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPage() {
  const { total, clearCart, items } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    city: '',
    address: ''
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Prepare WhatsApp Message
    const whatsappNumber = "212710669953";
    const itemsList = items.map(item => `- ${item.quantity}x ${item.name} (${item.price.toLocaleString()} DH)`).join('\n');
    
    const message = `*طلب جديد - Sahraoui Store*\n\n` +
      `*معلومات الزبون:*\n` +
      `• الاسم: ${formData.fullname}\n` +
      `• الهاتف: ${formData.phone}\n` +
      `• المدينة: ${formData.city}\n` +
      `• العنوان: ${formData.address}\n\n` +
      `*تفاصيل الطلب:*\n${itemsList}\n\n` +
      `*المجموع الإجمالي:* ${total.toLocaleString()} DH\n\n` +
      `_طريقة الدفع: الدفع عند الاستلام_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    toast({
      title: "Commande enregistrée",
      description: "Redirection vers WhatsApp...",
    });

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Switch to success step and clear cart
    setStep('success');
    clearCart();
    setLoading(false);
  };

  const displayTotal = isMounted ? total.toLocaleString() : total.toString();

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
                        <Input 
                          id="fullname" 
                          placeholder="Ex: Ahmed Alaoui" 
                          required 
                          value={formData.fullname}
                          onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input 
                          id="phone" 
                          placeholder="06XXXXXXXX" 
                          required 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input 
                          id="city" 
                          placeholder="Ex: Casablanca" 
                          required 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse de livraison</Label>
                        <Input 
                          id="address" 
                          placeholder="N°, Rue, Quartier..." 
                          required 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
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
                      {items.map(item => {
                        const itemTotal = isMounted ? (item.price * item.quantity).toLocaleString() : (item.price * item.quantity).toString();
                        return (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="flex-1 pr-4 line-clamp-1">{item.quantity}x {item.name}</span>
                            <span className="font-medium">{itemTotal} DH</span>
                          </div>
                        );
                      })}
                      <Separator className="my-4" />
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total à payer</span>
                        <span className="text-primary">{displayTotal} DH</span>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 text-xl gap-2"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirmer la commande"}
                    </Button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      En cliquant sur "Confirmer", vous serez redirigé vers WhatsApp pour finaliser avec un conseiller.
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
              <p className="text-lg font-bold mb-2">Votre commande est en cours.</p>
              <p className="text-muted-foreground mb-8 px-8">
                Nous avons ouvert une discussion WhatsApp pour confirmer les détails. Si la fenêtre ne s'est pas ouverte, cliquez ci-dessous.
              </p>
              <div className="space-y-3 px-8">
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                    Continuer mes achats
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => window.open('https://wa.me/212710669953', '_blank')}>
                  Contacter sur WhatsApp
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

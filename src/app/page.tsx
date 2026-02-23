
"use client"

import { Header } from '@/components/layout/Header';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductCard } from '@/components/product/ProductCard';
import { products, categories } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Zap, ShieldCheck, Truck, RotateCcw, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-promo');
  const featured = products.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-xl group">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt="Promo Sahraoui Store"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    data-ai-hint="electronics banner"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                  <div className="px-12 space-y-4">
                    <Badge className="bg-primary text-white font-black px-4 py-1 rounded-none text-lg">PROMO EXCLUSIVE</Badge>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-none">
                      PRIX <span className="text-primary">CASSÉS</span>
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-medium max-w-sm">
                      Le meilleur de l'électronique au meilleur prix du marché marocain.
                    </p>
                    <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-black px-8">
                      ACHETER MAINTENANT
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex lg:col-span-1 flex-col gap-4">
              <div className="flex-1 bg-secondary rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2 uppercase">Gros<br/>Electro</h3>
                  <Link href="/category/gros-electromenager">
                    <Button variant="link" className="text-primary font-bold p-0 group-hover:underline">Voir Offres</Button>
                  </Link>
                </div>
                <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
              </div>
              <div className="flex-1 bg-primary rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2 uppercase">Flash<br/>Sales</h3>
                  <Link href="/deals">
                    <Button variant="link" className="text-white font-bold p-0 group-hover:underline">Jusqu'à -50%</Button>
                  </Link>
                </div>
                <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5" />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white border-y py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-full"><Truck className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-sm">Livraison Rapide</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Partout au Maroc</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-full"><ShieldCheck className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-sm">Garantie Officielle</p>
                  <p className="text-[10px] text-muted-foreground uppercase">100% Neuf & Original</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-full"><RotateCcw className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-sm">Paiement à Livraison</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Simple & Sécurisé</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-full"><ShieldCheck className="h-6 w-6 text-primary" /></div>
                <div>
                  <p className="font-bold text-sm">Service Client 24/7</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Expert à votre écoute</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <CategoryGrid />

        {/* Flash Sales Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-white p-2 rounded-lg animate-pulse">
                  <Zap className="h-6 w-6 fill-current" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Ventes <span className="text-primary">Flash</span></h2>
              </div>
              <Button variant="outline" className="rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white group">
                Toutes les offres <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* App Promo */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-secondary rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="space-y-4 relative z-10 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Téléchargez l'application <span className="text-primary">Sahraoui Store</span></h2>
                <p className="text-white/70">Profitez de promotions exclusives uniquement sur l'app. Disponible sur App Store et Google Play.</p>
                <div className="flex flex-wrap gap-4 pt-4">
                   <Button variant="outline" className="bg-white/10 border-white/20 text-white font-bold h-14 px-8 rounded-xl hover:bg-white hover:text-black">App Store</Button>
                   <Button variant="outline" className="bg-white/10 border-white/20 text-white font-bold h-14 px-8 rounded-xl hover:bg-white hover:text-black">Google Play</Button>
                </div>
              </div>
              <div className="relative w-64 h-64 md:w-80 md:h-80 opacity-20">
                <div className="absolute inset-0 bg-primary rounded-full blur-3xl" />
                <ShoppingCart className="absolute inset-0 m-auto w-40 h-40 text-white" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-secondary text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary text-white p-1.5 rounded-lg font-black text-2xl leading-none">S</div>
                <span className="text-2xl font-black tracking-tighter">SAHRAOUI<span className="text-primary">STORE</span></span>
              </Link>
              <p className="text-white/60 text-sm leading-relaxed">
                Sahraoui Store est votre partenaire de confiance pour tout l'équipement de la maison et l'électronique de pointe au Maroc. Excellence, garantie et satisfaction.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest border-l-4 border-primary pl-3">Aide & Contact</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link href="/faq" className="hover:text-primary hover:pl-2 transition-all">Questions Fréquentes</Link></li>
                <li><Link href="/shipping" className="hover:text-primary hover:pl-2 transition-all">Modes de Livraison</Link></li>
                <li><Link href="/returns" className="hover:text-primary hover:pl-2 transition-all">Retours & Echanges</Link></li>
                <li><Link href="/contact" className="hover:text-primary hover:pl-2 transition-all">Nous Contacter</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest border-l-4 border-primary pl-3">Informations</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link href="/about" className="hover:text-primary hover:pl-2 transition-all">Qui sommes-nous ?</Link></li>
                <li><Link href="/terms" className="hover:text-primary hover:pl-2 transition-all">Conditions Générales</Link></li>
                <li><Link href="/privacy" className="hover:text-primary hover:pl-2 transition-all">Données Personnelles</Link></li>
                <li><Link href="/cookies" className="hover:text-primary hover:pl-2 transition-all">Gestion des Cookies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest border-l-4 border-primary pl-3">Moyens de Paiement</h4>
              <p className="text-sm text-white/60 mb-4 italic">Payez en toute sécurité par carte ou à la livraison.</p>
              <div className="flex gap-2">
                <div className="bg-white/10 w-12 h-8 rounded" />
                <div className="bg-white/10 w-12 h-8 rounded" />
                <div className="bg-white/10 w-12 h-8 rounded" />
                <div className="bg-white/10 w-12 h-8 rounded" />
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-xs text-white/40 font-medium">
              &copy; {new Date().getFullYear()} Sahraoui Store Maroc. Tous droits réservés. Élaboré pour votre satisfaction.
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a 
        href="https://wa.me/2126XXXXXXXX" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">Service Client</span>
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.181-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.109.004.258-.041.405.314.159.386.541 1.32.588 1.417.047.097.078.21.014.339-.063.128-.094.209-.188.319-.094.109-.197.244-.28.328-.101.101-.206.21-.089.412.116.202.518.854 1.112 1.381.766.68 1.408.89 1.61.992.202.101.32.083.438-.054.118-.137.503-.586.637-.786.135-.199.27-.166.455-.097.185.069 1.176.554 1.381.657s.341.155.39.238c.049.083.049.481-.095.886z" />
        </svg>
      </a>
    </div>
  );
}

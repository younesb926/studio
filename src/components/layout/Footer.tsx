
"use client"

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { categories } from '@/lib/data';

export function Footer() {
  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Livraison Rapide</h4>
              <p className="text-xs text-white/60">Partout au Maroc</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l-0 md:border-l border-white/10 md:pl-8">
            <div className="bg-primary/10 p-3 rounded-full">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Garantie Officielle</h4>
              <p className="text-xs text-white/60">Produits 100% Authentiques</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l-0 md:border-l border-white/10 md:pl-8">
            <div className="bg-primary/10 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Paiement Sécurisé</h4>
              <p className="text-xs text-white/60">À la livraison ou par carte</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-black tracking-tighter italic">
                SAHRAOUI<span className="text-primary">STORE</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Sahraoui Store est votre destination n°1 au Maroc pour l'électroménager, le multimédia et la technologie au meilleur prix.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-white/5 hover:bg-primary hover:text-secondary p-2 rounded-lg transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/5 hover:bg-primary hover:text-secondary p-2 rounded-lg transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/5 hover:bg-primary hover:text-secondary p-2 rounded-lg transition-all">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-primary">Catégories</h4>
            <ul className="space-y-4 text-sm text-white/60">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-primary">Liens Utiles</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link href="/account" className="hover:text-primary transition-colors">Mon Compte</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Panier</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Suivi de commande</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Conditions Générales</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-primary">Contactez-nous</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Casablanca, Maroc</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>0608023714</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>contact@sahraouistore.ma</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© 2024 Sahraoui Store. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
             <img src="https://picsum.photos/seed/payment/150/30" alt="Payment Methods" className="opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />;
}

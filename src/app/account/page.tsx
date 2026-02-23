
"use client"

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, User, LogOut, Heart, MapPin, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black">Mon Compte</h1>
            <Button variant="ghost" className="text-red-600 font-bold gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1 space-y-2">
              <Button variant="secondary" className="w-full justify-start gap-3 bg-primary/20 text-primary-foreground font-bold">
                <User className="h-4 w-4" /> Profil
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Package className="h-4 w-4" /> Mes Commandes
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Heart className="h-4 w-4" /> Favoris
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <MapPin className="h-4 w-4" /> Adresses
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Bell className="h-4 w-4" /> Notifications
              </Button>
            </aside>

            <div className="md:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-widest">Nom complet</p>
                      <p className="font-bold">Ahmed Alaoui</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-widest">Email</p>
                      <p className="font-bold">ahmed.alaoui@email.ma</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-widest">Téléphone</p>
                      <p className="font-bold">06 61 XX XX XX</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 uppercase text-[10px] font-bold tracking-widest">Ville</p>
                      <p className="font-bold">Casablanca</p>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline" size="sm" className="font-bold">Modifier mes informations</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dernières Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-8 text-center">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">Aucune commande récente</p>
                    <Button variant="link" className="text-primary font-bold mt-2">Commencer vos achats</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

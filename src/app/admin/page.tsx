
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories as staticCategories } from '@/lib/data';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Loader2, Lock } from 'lucide-react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function AdminPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [loading, setLoading] = useState(false);
  
  // Check Admin Role from roles_admin collection
  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  // Fetch real categories from DB if available
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: dbCategories } = useCollection(categoriesQuery);
  const displayCategories = dbCategories && dbCategories.length > 0 ? dbCategories : staticCategories;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    descriptionShort: '',
    descriptionDetailed: '',
    price: '',
    categoryId: '',
    stockQuantity: '10',
    imageUrl: '',
    isFeatured: false
  });

  // Loading state for auth/admin check
  if (isUserLoading || isAdminChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground italic">Vérification des accès administrateur...</p>
      </div>
    );
  }

  // Access Denied state
  if (!user || !adminData) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-red-200 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-black text-red-700">Accès Refusé</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 pt-4">
              <p className="text-muted-foreground font-medium">
                Désolé, vous n'avez pas les privilèges nécessaires pour accéder à cet espace. 
                Seuls les comptes administrateurs peuvent ajouter des produits.
              </p>
              <Button onClick={() => window.location.href = '/'} className="w-full h-12 text-lg font-bold" variant="outline">
                Retour à la boutique
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setLoading(true);
    const productsRef = collection(db, 'products');
    
    // Generate simple slug if not provided
    const slug = formData.slug || formData.name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const dataToSave = {
      name: formData.name,
      slug: slug,
      descriptionShort: formData.descriptionShort || formData.name.substring(0, 50),
      descriptionDetailed: formData.descriptionDetailed,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      imageUrls: [formData.imageUrl || 'https://picsum.photos/seed/default/500/500'],
      categoryId: formData.categoryId,
      isFeatured: formData.isFeatured,
      status: 'PUBLISHED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Use non-blocking update to avoid UI hangs
    addDocumentNonBlocking(productsRef, dataToSave);
    
    toast({
      title: "Produit en cours d'ajout",
      description: "L'opération a été lancée. Le produit apparaîtra une fois synchronisé.",
    });

    // Reset form immediately for next entry
    setFormData({
      name: '',
      slug: '',
      descriptionShort: '',
      descriptionDetailed: '',
      price: '',
      categoryId: '',
      stockQuantity: '10',
      imageUrl: '',
      isFeatured: false
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-2xl border-t-8 border-t-primary rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-white border-b">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black italic">SAHRAOUI <span className="text-primary">ADMIN</span></CardTitle>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Gestion du Catalogue</p>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold uppercase">Nom du produit</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="ex: Samsung Galaxy S24 Ultra" 
                    className="h-12 border-2 focus:border-primary transition-all"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-bold uppercase">Catégorie</Label>
                  <Select onValueChange={(val) => setFormData({...formData, categoryId: val})} value={formData.categoryId}>
                    <SelectTrigger className="h-12 border-2">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold uppercase">Prix (DH)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00" 
                      className="h-12 border-2"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-sm font-bold uppercase">Quantité Stock</Label>
                    <Input 
                      id="stock" 
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                      placeholder="10" 
                      className="h-12 border-2"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descDetailed" className="text-sm font-bold uppercase">Description détaillée</Label>
                  <Textarea 
                    id="descDetailed" 
                    value={formData.descriptionDetailed}
                    onChange={(e) => setFormData({...formData, descriptionDetailed: e.target.value})}
                    placeholder="Détails techniques, garantie, accessoires inclus..." 
                    className="min-h-[140px] border-2"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm font-bold uppercase">Lien URL de l'image</Label>
                  <Input 
                    id="imageUrl" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://..." 
                    className="h-12 border-2"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Note: Utilisez une URL d'image directe (Unsplash, Pexels, etc.)</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-primary hover:bg-secondary text-white font-black text-xl gap-3 shadow-lg hover:shadow-primary/20 transition-all rounded-xl"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                  PUBLIER LE PRODUIT
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories as staticCategories } from '@/lib/data';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Loader2, Lock, ShieldCheck, Image as ImageIcon, X, AlertCircle, Upload } from 'lucide-react';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { uploadImage } from '@/app/actions/upload-image';

export default function AdminPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Check Admin Role
  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  // Categories
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
    imageUrls: [] as string[],
    isFeatured: false
  });

  const handleClaimAdmin = () => {
    if (!db || !user) return;
    setClaimLoading(true);
    const ref = doc(db, 'roles_admin', user.uid);
    setDocumentNonBlocking(ref, { 
      uid: user.uid, 
      email: user.email || 'anonymous',
      createdAt: serverTimestamp() 
    }, { merge: true });
    
    toast({
      title: "Activation en cours",
      description: "Vos droits d'administrateur sont en cours d'activation. Veuillez patienter 2 secondes.",
    });
    
    setTimeout(() => setClaimLoading(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const result = await uploadImage(uploadFormData);
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, result.imageUrl]
      }));
      toast({
        title: "Succès",
        description: "L'image a été téléchargée et ajoutée.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de téléchargement",
        description: error.message,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!formData.imageUrl) return;
    setFormData({
      ...formData,
      imageUrls: [...formData.imageUrls, formData.imageUrl],
      imageUrl: ''
    });
  };

  const removeImageUrl = (index: number) => {
    const newUrls = [...formData.imageUrls];
    newUrls.splice(index, 1);
    setFormData({ ...formData, imageUrls: newUrls });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setLoading(true);
    const productsRef = collection(db, 'products');
    
    const slug = formData.slug || formData.name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const finalImages = formData.imageUrls.length > 0 
      ? formData.imageUrls 
      : [formData.imageUrl || 'https://picsum.photos/seed/default/500/500'];

    const dataToSave = {
      name: formData.name,
      slug: slug,
      descriptionShort: formData.descriptionShort || formData.name.substring(0, 50),
      descriptionDetailed: formData.descriptionDetailed,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      imageUrls: finalImages,
      categoryId: formData.categoryId,
      isFeatured: formData.isFeatured,
      status: 'PUBLISHED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(productsRef, dataToSave);
    
    toast({
      title: "Succès !",
      description: "Le produit a été ajouté au catalogue.",
    });

    setFormData({
      name: '',
      slug: '',
      descriptionShort: '',
      descriptionDetailed: '',
      price: '',
      categoryId: '',
      stockQuantity: '10',
      imageUrl: '',
      imageUrls: [],
      isFeatured: false
    });
    setLoading(false);
  };

  if (isUserLoading || isAdminChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Initialisation...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <CardTitle>Connexion requise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">Vous devez être connecté pour accéder à l'espace admin.</p>
              <Button onClick={() => initiateAnonymousSignIn(auth)} className="w-full h-12 font-bold">
                Se connecter anonymement
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-primary/20 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">Mode Administrateur</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 pt-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 text-left">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Votre compte n'est pas encore configuré comme administrateur. Cliquez sur le bouton ci-dessous pour activer l'accès pour ce compte.
                </p>
              </div>
              <Button 
                onClick={handleClaimAdmin} 
                className="w-full h-14 text-lg font-black bg-primary hover:bg-secondary text-white rounded-xl shadow-lg"
                disabled={claimLoading}
              >
                {claimLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "ACTIVER MON ACCÈS ADMIN"}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-2xl border-t-8 border-t-primary rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-white border-b p-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black italic">SAHRAOUI <span className="text-primary">ADMIN</span></CardTitle>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Ajouter un produit</p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase">Nom du produit</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Samsung Galaxy S24 Ultra" 
                    className="h-12 border-2 font-medium"
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-xs font-black uppercase">Catégorie</Label>
                    <Select onValueChange={(val) => setFormData({...formData, categoryId: val})} value={formData.categoryId}>
                      <SelectTrigger className="h-12 border-2">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {displayCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-black uppercase">Prix (DH)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-12 border-2" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Images du produit</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex gap-2">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 h-12 gap-2 border-dashed border-2 font-bold"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {isUploading ? "Téléchargement..." : "Choisir une image"}
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          placeholder="Ou coller le lien de l'image..." 
                          className="h-12 pl-10 border-2"
                        />
                        <Button type="button" onClick={handleAddImageUrl} variant="secondary" className="h-12 px-6 font-bold">
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {formData.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg border-2 overflow-hidden bg-muted group">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImageUrl(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground italic">يمكنك رفع صور من جهازك أو لصق روابط خارجية.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descDetailed" className="text-xs font-black uppercase">Description</Label>
                  <Textarea id="descDetailed" value={formData.descriptionDetailed} onChange={(e) => setFormData({...formData, descriptionDetailed: e.target.value})} className="min-h-[120px] border-2" required />
                </div>

                <Button type="submit" className="w-full h-16 bg-primary hover:bg-secondary text-white font-black text-xl gap-3 shadow-xl rounded-xl transition-all" disabled={loading}>
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

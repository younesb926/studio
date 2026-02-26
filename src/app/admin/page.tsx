
'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories as staticCategories } from '@/lib/data';
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection, useAuth, updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Loader2, Lock, ShieldCheck, Image as ImageIcon, X, AlertCircle, Upload, Pencil, Trash2, ListFilter, FolderOpen } from 'lucide-react';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { uploadImage } from '@/app/actions/upload-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export default function AdminPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("add");
  
  // Check Admin Role
  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  // Categories from Firestore
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'categories');
  }, [db]);
  const { data: dbCategories } = useCollection(categoriesQuery);
  const displayCategories = dbCategories && dbCategories.length > 0 ? dbCategories : staticCategories;

  // Products from Firestore
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: products } = useCollection(productsQuery);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    descriptionShort: '',
    descriptionDetailed: '',
    price: '',
    categorySlug: '',
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    let uploadedCount = 0;
    let failedCount = 0;

    try {
      const uploadPromises = filesArray.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        try {
          const result = await uploadImage(uploadFormData);
          uploadedCount++;
          return result.imageUrl;
        } catch (error) {
          failedCount++;
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((url): url is string => url !== null);

      if (successfulUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...successfulUrls]
        }));
      }

      if (uploadedCount > 0) {
        toast({
          title: "Succès",
          description: `${uploadedCount} image(s) ajoutée(s) avec succès.`,
        });
      }
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

  const handleEditClick = (product: any) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      descriptionShort: product.descriptionShort || '',
      descriptionDetailed: product.descriptionDetailed || '',
      price: product.price?.toString() || '',
      categorySlug: product.categorySlug || '',
      stockQuantity: product.stockQuantity?.toString() || '10',
      imageUrl: '',
      imageUrls: product.imageUrls || [],
      isFeatured: product.isFeatured || false
    });
    setActiveTab("add");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (productId: string) => {
    if (!db || !confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    const docRef = doc(db, 'products', productId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Produit supprimé",
      description: "Le produit a été retiré du catalogue.",
    });
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      slug: '',
      descriptionShort: '',
      descriptionDetailed: '',
      price: '',
      categorySlug: '',
      stockQuantity: '10',
      imageUrl: '',
      imageUrls: [],
      isFeatured: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    if (!formData.categorySlug) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez choisir une catégorie." });
      return;
    }

    setLoading(true);
    
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
      categorySlug: formData.categorySlug,
      isFeatured: formData.isFeatured,
      status: 'PUBLISHED',
      updatedAt: serverTimestamp(),
    };

    if (editingProductId) {
      const docRef = doc(db, 'products', editingProductId);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: "Produit mis à jour", description: "Les modifications ont été enregistrées." });
    } else {
      const productsRef = collection(db, 'products');
      addDocumentNonBlocking(productsRef, { ...dataToSave, createdAt: serverTimestamp() });
      toast({ title: "Succès !", description: "Le produit a été ajouté au catalogue." });
    }

    resetForm();
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
              <Button onClick={handleClaimAdmin} className="w-full h-14 text-lg font-black bg-primary text-white rounded-xl shadow-lg" disabled={claimLoading}>
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
        <div className="container mx-auto px-4 max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-white border p-1 rounded-xl h-14 shadow-sm">
                <TabsTrigger value="add" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-secondary">
                  {editingProductId ? "Modifier le produit" : "Ajouter un produit"}
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-secondary">
                  Gérer le stock
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="add">
              <Card className="shadow-2xl border-t-8 border-t-primary rounded-2xl overflow-hidden max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center gap-4 bg-white border-b p-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black italic">SAHRAOUI <span className="text-primary">ADMIN</span></CardTitle>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      {editingProductId ? "Modifier un produit existant" : "Ajouter un nouveau produit"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase">Nom du produit</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Samsung Galaxy S24 Ultra" className="h-12 border-2 font-medium" required />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="categorySlug" className="text-xs font-black uppercase">Catégorie</Label>
                        <Select onValueChange={(val) => setFormData({...formData, categorySlug: val})} value={formData.categorySlug}>
                          <SelectTrigger className="h-12 border-2">
                            <SelectValue placeholder="Choisir..." />
                          </SelectTrigger>
                          <SelectContent>
                            {displayCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
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
                        <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button type="button" variant="outline" className="h-12 gap-2 border-dashed border-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {isUploading ? "Téléchargement..." : "Choisir des images (plusieurs possible)"}
                        </Button>

                        <div className="flex gap-2">
                          <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="Ou coller le lien de l'image..." className="h-12 border-2" />
                          <Button type="button" onClick={handleAddImageUrl} variant="secondary" className="h-12 px-6 font-bold">Ajouter</Button>
                        </div>
                      </div>
                      
                      {formData.imageUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {formData.imageUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg border-2 overflow-hidden bg-muted group">
                              <img src={url} alt="Preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImageUrl(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descDetailed" className="text-xs font-black uppercase">Description</Label>
                      <Textarea id="descDetailed" value={formData.descriptionDetailed} onChange={(e) => setFormData({...formData, descriptionDetailed: e.target.value})} className="min-h-[120px] border-2" required />
                    </div>

                    <div className="flex gap-4">
                      {editingProductId && (
                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-16 font-bold text-lg">
                          Annuler
                        </Button>
                      )}
                      <Button type="submit" className="flex-[2] h-16 bg-primary hover:bg-secondary text-white font-black text-xl gap-3 shadow-xl rounded-xl transition-all" disabled={loading}>
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : editingProductId ? <Pencil className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                        {editingProductId ? "METTRE À JOUR" : "PUBLIER LE PRODUIT"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-12">
                {displayCategories.map((category) => {
                  const categoryProducts = products?.filter(p => p.categorySlug === category.slug) || [];
                  
                  if (categoryProducts.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight">
                          {category.name} <span className="text-muted-foreground text-sm font-bold ml-2">({categoryProducts.length})</span>
                        </h2>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categoryProducts.map((product) => (
                          <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all border group relative">
                            <div className="relative aspect-square bg-muted">
                              {product.imageUrls?.[0] && (
                                <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" unoptimized />
                              )}
                              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white shadow-md" onClick={() => handleEditClick(product)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="destructive" className="shadow-md" onClick={() => handleDeleteClick(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold text-sm line-clamp-2 mb-3 h-10">{product.name}</h3>
                              <div className="flex items-center justify-between">
                                <p className="text-primary font-black">{product.price.toLocaleString()} DH</p>
                                <p className="text-[10px] font-bold px-2 py-1 bg-muted rounded">Stock: {product.stockQuantity}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Handle products without category or with unknown category */}
                {products?.some(p => !displayCategories.find(c => c.slug === p.categorySlug)) && (
                   <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="bg-red-500/20 p-2 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <h2 className="text-xl font-black italic uppercase tracking-tight text-red-500">
                        Autres / Catégorie Inconnue
                      </h2>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products?.filter(p => !displayCategories.find(c => c.slug === p.categorySlug)).map((product) => (
                        <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all border group relative">
                          <div className="relative aspect-square bg-muted">
                            {product.imageUrls?.[0] && (
                              <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" unoptimized />
                            )}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white shadow-md" onClick={() => handleEditClick(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="destructive" className="shadow-md" onClick={() => handleDeleteClick(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-sm line-clamp-2 mb-3 h-10">{product.name}</h3>
                            <div className="flex items-center justify-between">
                              <p className="text-primary font-black">{product.price.toLocaleString()} DH</p>
                              <p className="text-[10px] font-bold px-2 py-1 bg-muted rounded">Stock: {product.stockQuantity}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

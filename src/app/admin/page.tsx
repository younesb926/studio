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
import { Package, Plus, Loader2, Lock, ShieldCheck, Image as ImageIcon, X, AlertCircle, Upload, Pencil, Trash2, ListFilter, FolderOpen, FileSpreadsheet, KeyRound, Tags, RefreshCw } from 'lucide-react';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { uploadImage } from '@/app/actions/upload-image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import Papa from 'papaparse';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

export default function AdminPage() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("add");
  const [adminPassword, setAdminPassword] = useState('');

  // Category State
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  // Check Admin Role
  const adminDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user]);
  const { data: adminData, isLoading: isAdminChecking } = useDoc(adminDocRef);

  // Categories from Firestore
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('name', 'asc'));
  }, [db]);
  const { data: dbCategories, isLoading: isCategoriesLoading } = useCollection(categoriesQuery);
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
    originalPrice: '',
    categorySlug: '',
    stockQuantity: '10',
    imageUrl: '',
    imageUrls: [] as string[],
    isFeatured: false
  });

  const handleClaimAdmin = () => {
    if (!db || !user) return;
    
    if (adminPassword !== 'Ayoub@sahraoui123') {
      toast({
        variant: "destructive",
        title: "Mot de passe incorrect",
        description: "Veuillez entrer le code correct.",
      });
      return;
    }

    setClaimLoading(true);
    const ref = doc(db, 'roles_admin', user.uid);
    setDocumentNonBlocking(ref, { 
      uid: user.uid, 
      email: user.email || 'anonymous',
      createdAt: serverTimestamp() 
    }, { merge: true });
    
    toast({
      title: "Accès activé",
      description: "Bienvenue dans l'espace admin.",
    });
    
    setTimeout(() => setClaimLoading(false), 2000);
  };

  // Category CRUD
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const slug = categorySlug || categoryName.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const data = {
      name: categoryName,
      slug: slug,
      iconId: 'cat-petit-electro', // Default icon
      updatedAt: serverTimestamp()
    };

    if (editingCategoryId) {
      const docRef = doc(db, 'categories', editingCategoryId);
      updateDocumentNonBlocking(docRef, data);
      toast({ title: "Catégorie mise à jour" });
    } else {
      const colRef = collection(db, 'categories');
      addDocumentNonBlocking(colRef, { ...data, createdAt: serverTimestamp() });
      toast({ title: "Catégorie ajoutée" });
    }

    setCategoryName('');
    setCategorySlug('');
    setEditingCategoryId(null);
    setIsCategoryDialogOpen(false);
  };

  const handleRestoreDefaults = () => {
    if (!db || !confirm("Voulez-vous restaurer les catégories initiales ?")) return;
    
    staticCategories.forEach(cat => {
      // Check if already exists in dbCategories to avoid duplicates
      const exists = dbCategories?.find(dbCat => dbCat.slug === cat.slug);
      if (!exists) {
        const colRef = collection(db, 'categories');
        addDocumentNonBlocking(colRef, {
          name: cat.name,
          slug: cat.slug,
          iconId: cat.iconId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });

    toast({ title: "Restauration terminée", description: "Les catégories initiales ont été ajoutées." });
  };

  const deleteCategory = (id: string) => {
    if (!db || !confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;
    const docRef = doc(db, 'categories', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Catégorie supprimée" });
  };

  const openEditCategory = (cat: any) => {
    setEditingCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setIsCategoryDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files);
    let uploadedCount = 0;

    try {
      const uploadPromises = filesArray.map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        try {
          const result = await uploadImage(uploadFormData);
          uploadedCount++;
          return result.imageUrl;
        } catch (error) {
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

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !db) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\ufeff/, ''),
      complete: async (results) => {
        const data = results.data as any[];
        let importedCount = 0;
        let errorCount = 0;

        for (const row of data) {
          const name = row.name?.trim();
          const priceStr = row.price?.toString().trim().replace(/[^\d.]/g, '');
          const originalPriceStr = row.originalPrice?.toString().trim().replace(/[^\d.]/g, '');
          const categorySlug = row.categorySlug?.trim();
          const imageUrl = row.imageUrl?.trim();
          const stock = row.stock?.toString().trim();
          const description = row.description?.trim();

          if (!name || !priceStr || !categorySlug || !imageUrl) {
            errorCount++;
            continue;
          }

          const slug = name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

          const images = imageUrl.split(/[;,]/).map((u: string) => u.trim()).filter((u: string) => u !== '');

          const dataToSave = {
            name,
            slug,
            descriptionShort: description ? description.substring(0, 80) : name,
            descriptionDetailed: description || name,
            price: parseFloat(priceStr),
            originalPrice: originalPriceStr ? parseFloat(originalPriceStr) : null,
            stockQuantity: parseInt(stock) || 10,
            imageUrls: images.length > 0 ? images : [imageUrl],
            categorySlug: categorySlug,
            isFeatured: false,
            status: 'PUBLISHED',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          try {
            const productsRef = collection(db, 'products');
            addDocumentNonBlocking(productsRef, dataToSave);
            importedCount++;
          } catch (error) {
            errorCount++;
          }
        }

        toast({
          title: "Importation terminée",
          description: `${importedCount} produits importés.`,
        });
        setIsImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
      },
      error: () => {
        toast({ variant: "destructive", title: "Erreur CSV" });
        setIsImporting(false);
      }
    });
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
      originalPrice: product.originalPrice?.toString() || '',
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
    if (!db || !confirm("Supprimer ce produit ?")) return;
    const docRef = doc(db, 'products', productId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Produit supprimé" });
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormData({
      name: '', slug: '', descriptionShort: '', descriptionDetailed: '',
      price: '', originalPrice: '', categorySlug: '', stockQuantity: '10',
      imageUrl: '', imageUrls: [], isFeatured: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    if (!formData.categorySlug) {
      toast({ variant: "destructive", title: "Erreur", description: "Choisissez une catégorie." });
      return;
    }

    setLoading(true);
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
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      stockQuantity: parseInt(formData.stockQuantity),
      imageUrls: formData.imageUrls,
      categorySlug: formData.categorySlug,
      isFeatured: formData.isFeatured,
      status: 'PUBLISHED',
      updatedAt: serverTimestamp(),
    };

    if (editingProductId) {
      updateDocumentNonBlocking(doc(db, 'products', editingProductId), dataToSave);
      toast({ title: "Produit mis à jour" });
    } else {
      addDocumentNonBlocking(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });
      toast({ title: "Produit ajouté" });
    }

    resetForm();
    setLoading(false);
  };

  if (isUserLoading || isAdminChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!user || !adminData) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden rounded-2xl">
            <div className="bg-primary h-2 w-full" />
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">Espace Sécurisé</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Veuillez saisir votre code d'accès administrateur</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Code d'accès" 
                    className="h-12 pl-10 border-2 font-medium focus:border-primary transition-all rounded-xl"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>
              {!user ? (
                 <Button onClick={() => initiateAnonymousSignIn(auth)} className="w-full h-14 font-black bg-primary text-white rounded-xl shadow-lg">
                    SE CONNECTER
                 </Button>
              ) : (
                <Button 
                  onClick={handleClaimAdmin} 
                  className="w-full h-14 text-lg font-black bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 transition-all" 
                  disabled={claimLoading}
                >
                  {claimLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "ACTIVER L'ACCÈS"}
                </Button>
              )}
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <TabsList className="bg-white border p-1 rounded-xl h-14 shadow-sm w-full md:w-auto">
                <TabsTrigger value="add" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                  Produit
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                  Stock
                </TabsTrigger>
                <TabsTrigger value="categories" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                  Catégories
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <input type="file" accept=".csv" className="hidden" ref={csvInputRef} onChange={handleCsvImport} />
                <Button 
                  variant="outline" 
                  className="h-14 px-6 font-bold gap-2 border-2 border-dashed border-primary/50 hover:bg-primary/10"
                  onClick={() => csvInputRef.current?.click()}
                  disabled={isImporting}
                >
                  {isImporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5 text-primary" />}
                  CSV
                </Button>
              </div>
            </div>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories">
              <Card className="shadow-2xl border-none rounded-2xl overflow-hidden max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between bg-white border-b p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl"><Tags className="h-6 w-6 text-primary" /></div>
                    <CardTitle className="text-xl font-black">Gestion des Catégories</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 font-bold" onClick={handleRestoreDefaults}>
                      <RefreshCw className="h-4 w-4" /> Restaurer
                    </Button>
                    <Button size="sm" className="gap-2 font-bold" onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryName('');
                      setCategorySlug('');
                      setIsCategoryDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4" /> Nouveau
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {displayCategories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border group">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center border shadow-sm">
                             <FolderOpen className="h-5 w-5 text-primary/60" />
                          </div>
                          <div>
                            <p className="font-bold">{cat.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{cat.slug}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => openEditCategory(cat)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-100 hover:text-red-600" onClick={() => deleteCategory(cat.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingCategoryId ? "Modifier" : "Ajouter"} une catégorie</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase">Nom de la catégorie</Label>
                      <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Ex: Informatique" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase">Slug (URL)</Label>
                      <Input value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} placeholder="ex: informatique" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full font-black">ENREGISTRER</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ADD PRODUCT TAB */}
            <TabsContent value="add">
              <Card className="shadow-2xl border-t-8 border-t-primary rounded-2xl overflow-hidden max-w-2xl mx-auto border-none">
                <CardHeader className="flex flex-row items-center gap-4 bg-white border-b p-6">
                  <div className="p-3 bg-primary/10 rounded-xl"><Package className="h-6 w-6 text-primary" /></div>
                  <div>
                    <CardTitle className="text-2xl font-black italic">SAHRAOUI <span className="text-primary">ADMIN</span></CardTitle>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{editingProductId ? "Modifier" : "Nouveau"} Produit</p>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-black uppercase">Nom du produit</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-12 border-2 font-medium" required />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase">Catégorie</Label>
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
                        <Label className="text-xs font-black uppercase">Quantité</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} className="h-12 border-2" required />
                          <Button type="button" variant="outline" size="icon" className="h-12 w-12 border-2 shrink-0" onClick={() => setFormData(prev => ({...prev, stockQuantity: '0'}))}>
                              <X className="h-5 w-5 text-red-500"/>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase">Prix (DH)</Label>
                        <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-12 border-2" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase">Prix Barré (Optionnel)</Label>
                        <Input type="number" value={formData.originalPrice || ''} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} className="h-12 border-2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase">Images</Label>
                      <div className="grid gap-4">
                        <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <Button type="button" variant="outline" className="h-12 gap-2 border-dashed border-2 font-bold" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {isUploading ? "Téléchargement..." : "Ajouter des images"}
                        </Button>
                        <div className="flex gap-2">
                          <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="Ou lien URL..." className="h-12 border-2" />
                          <Button type="button" onClick={handleAddImageUrl} variant="secondary" className="h-12 px-6 font-bold">Ajouter</Button>
                        </div>
                      </div>
                      {formData.imageUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {formData.imageUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg border-2 overflow-hidden group">
                              <img src={url} alt="Preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImageUrl(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase">Description</Label>
                      <Textarea value={formData.descriptionDetailed} onChange={(e) => setFormData({...formData, descriptionDetailed: e.target.value})} className="min-h-[120px] border-2" required />
                    </div>

                    <div className="flex gap-4">
                      {editingProductId && <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12 font-bold">Annuler</Button>}
                      <Button type="submit" className="flex-[2] h-12 bg-primary text-white font-black gap-2" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProductId ? "METTRE À JOUR" : "PUBLIER LE PRODUIT"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* STOCK TAB */}
            <TabsContent value="list">
              <div className="space-y-12">
                {displayCategories.map((category) => {
                  const categoryProducts = products?.filter(p => p.categorySlug === category.slug) || [];
                  if (categoryProducts.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <div className="bg-primary/20 p-2 rounded-lg"><FolderOpen className="h-5 w-5 text-primary" /></div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight">{category.name} ({categoryProducts.length})</h2>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categoryProducts.map((product) => (
                          <Card key={product.id} className="overflow-hidden shadow-lg border-none group relative rounded-xl bg-white">
                            <div className="relative aspect-square bg-muted">
                              {product.imageUrls?.[0] && <Image src={product.imageUrls[0]} alt={product.name} fill className="object-cover" unoptimized />}
                              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button size="icon" variant="secondary" className="bg-white/90 shadow-md" onClick={() => handleEditClick(product)}><Pencil className="h-4 w-4" /></Button>
                                <Button size="icon" variant="destructive" className="shadow-md" onClick={() => handleDeleteClick(product.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-bold text-sm line-clamp-2 mb-3 h-10">{product.name}</h3>
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-primary font-black">{product.price.toLocaleString()} DH</p>
                                </div>
                                <Badge variant={product.stockQuantity > 0 ? "secondary" : "destructive"} className="font-medium">
                                  {product.stockQuantity > 0 ? `Stock: ${product.stockQuantity}` : 'Épuisé'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

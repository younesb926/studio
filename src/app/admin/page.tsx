
'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '10',
    imageUrl: 'https://images.pexels.com/photos/14683691/pexels-photo-14683691.jpeg'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setLoading(true);
    const productsRef = collection(db, 'products');
    const dataToSave = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      createdAt: new Date()
    };

    addDoc(productsRef, dataToSave)
      .then(() => {
        toast({
          title: "تمت إضافة المنتج",
          description: "تمت إضافة المنتج الجديد إلى قاعدة البيانات بنجاح.",
        });
        setFormData({
          name: '',
          description: '',
          price: '',
          categoryId: '',
          stock: '10',
          imageUrl: 'https://images.pexels.com/photos/14683691/pexels-photo-14683691.jpeg'
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: productsRef.path,
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black">إضافة منتج جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="مثال: Samsung Galaxy S24" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">الفئة</Label>
                  <Select onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">الثمن (DH)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">الكمية</Label>
                    <Input 
                      id="stock" 
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      placeholder="10" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف المنتج</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="اكتب تفاصيل المنتج هنا..." 
                    className="min-h-[120px]"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">رابط الصورة</Label>
                  <Input 
                    id="imageUrl" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://..." 
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-secondary font-black text-lg gap-2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  إضافة المنتج
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

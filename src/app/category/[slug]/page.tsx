
"use client"

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { products, categories } from '@/lib/data';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find(c => c.slug === slug);
  const categoryProducts = products.filter(p => p.categoryId === category?.id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">الفئة غير موجودة</h1>
          <Link href="/">
            <Button className="bg-primary text-secondary font-bold">العودة للرئيسية</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs & Title */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">الرئيسية</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-bold">{category.name}</span>
          </div>

          <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border shadow-sm">
            <h1 className="text-xl md:text-2xl font-black">{category.name}</h1>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> تصفية
            </Button>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
              <p className="text-muted-foreground mb-4">لا توجد منتجات حالياً في هذه الفئة.</p>
              <Link href="/">
                <Button variant="link" className="text-primary font-bold">تصفح أقسام أخرى</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


"use client"

import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function CategoryGrid() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Nos Catégories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const placeholder = PlaceHolderImages.find(img => img.id === cat.iconId);
            return (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center p-4 bg-white rounded-2xl border hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="relative w-16 h-16 mb-3 rounded-full overflow-hidden bg-muted group-hover:scale-110 transition-transform">
                  {placeholder && (
                    <Image
                      src={placeholder.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="text-xs font-semibold text-center leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

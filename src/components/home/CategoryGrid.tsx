"use client"

import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function CategoryGrid() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-medium mb-12 text-center md:text-left">Découvrir nos catégories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
          {categories.map((cat) => {
            const placeholder = PlaceHolderImages.find(img => img.id === cat.iconId);
            return (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center group"
              >
                <div className="relative w-32 h-32 mb-4 transition-transform group-hover:scale-105">
                  {placeholder && (
                    <Image
                      src={placeholder.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-center text-gray-700 leading-tight px-2 group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
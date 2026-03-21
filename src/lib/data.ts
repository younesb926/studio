
import { Category, Product } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Petit électroménager', slug: 'petit-electromenager', iconId: 'cat-petit-electro' },
  { id: '2', name: 'Gros électroménager', slug: 'gros-electromenager', iconId: 'cat-gros-electro' },
  { id: '3', name: 'Informatique', slug: 'informatique', iconId: 'cat-informatique' },
  { id: '4', name: 'Télévisions', slug: 'televisions', iconId: 'cat-televisions' },
  { id: '5', name: 'Climatiseurs', slug: 'climatiseurs', iconId: 'cat-climatiseurs' },
  { id: '6', name: 'Chauffe-eau', slug: 'chauffe-eau', iconId: 'cat-chauffe-eau' },
  { id: '7', name: 'Robot', slug: 'robot', iconId: 'cat-robot' },
  { id: '8', name: 'Scooter', slug: 'scooter', iconId: 'cat-scooter' },
  { id: '9', name: 'Monitor', slug: 'monitor', iconId: 'cat-monitor' },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Samsung TV 65" QLED 4K Smart',
    slug: 'samsung-qled-65',
    description: 'Une qualité d\'image exceptionnelle with des couleurs éclatantes.',
    price: 8990,
    originalPrice: 10500,
    categorySlug: 'televisions',
    imageUrls: ['https://electromall.ma/wp-content/uploads/2024/09/Tv-SAMSUNG-QLED-QA85Q60DAU-85P.webp'],
    stockQuantity: 8,
    isFeatured: true
  },
  {
    id: 'p2',
    name: 'Nespresso Vertuo Pop Black',
    slug: 'nespresso-vertuo-pop',
    description: 'Le café parfait en une seule touche, design moderne et compact.',
    price: 1290,
    originalPrice: 1590,
    categorySlug: 'petit-electromenager',
    imageUrls: ['https://images.unsplash.com/photo-1637029436347-e33bf98a5412?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBtYWNoaW5lfGVufDB8fHx8MTc3MTg5MTYzMHww&ixlib=rb-4.1.0&q=80&w=1080'],
    stockQuantity: 25,
    isFeatured: true
  },
  {
    id: 'p3',
    name: 'LG InstaView Door-in-Door 635L',
    slug: 'lg-instaview-fridge',
    description: 'Toquez deux fois et voyez l\'intérieur sans ouvrir la porte.',
    price: 18500,
    categorySlug: 'gros-electromenager',
    imageUrls: ['https://picsum.photos/seed/fridge-lg-98/500/500'],
    stockQuantity: 3,
    isFeatured: true
  },
  {
    id: 'p4',
    name: 'Climatiseur Samsung WindFree 12K',
    slug: 'samsung-windfree-12k',
    description: 'Rafraîchissement sans courants d\'air froids désagréables.',
    price: 5490,
    categorySlug: 'climatiseurs',
    imageUrls: ['https://picsum.photos/seed/ac-samsung-87/500/500'],
    stockQuantity: 15,
    isFeatured: true
  }
];

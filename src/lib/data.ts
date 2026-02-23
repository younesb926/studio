import { Category, Product } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Petit électroménager', slug: 'petit-electromenager', iconId: 'cat-petit-electro' },
  { id: '2', name: 'Gros électroménager', slug: 'gros-electromenager', iconId: 'cat-gros-electro' },
  { id: '3', name: 'Informatique', slug: 'informatique', iconId: 'cat-informatique' },
  { id: '4', name: 'Télévisions', slug: 'televisions', iconId: 'cat-televisions' },
  { id: '5', name: 'Climatiseurs', slug: 'climatiseurs', iconId: 'cat-climatiseurs' },
  { id: '6', name: 'Chauffe-eau', slug: 'chauffe-eau', iconId: 'cat-chauffe-eau' },
];

export const products: Product[] = [
  {
    id: 'p2',
    name: 'MacBook Air 13" M3 8GB 256GB',
    slug: 'macbook-air-m3',
    description: 'La puissance de la puce M3 dans un design ultra-fin et léger.',
    price: 12900,
    categoryId: '3',
    imageId: 'prod-2',
    stock: 5,
    isFeatured: true
  },
  {
    id: 'p3',
    name: 'Samsung TV 65" QLED 4K Smart',
    slug: 'samsung-qled-65',
    description: 'Une qualité d\'image exceptionnelle avec des couleurs éclatantes.',
    price: 8990,
    originalPrice: 10500,
    categoryId: '4',
    imageId: 'prod-3',
    stock: 8,
    isFeatured: true
  },
  {
    id: 'p4',
    name: 'Nespresso Vertuo Pop Black',
    slug: 'nespresso-vertuo-pop',
    description: 'Le café parfait en une seule touche, design moderne et compact.',
    price: 1290,
    originalPrice: 1590,
    categoryId: '1',
    imageId: 'prod-4',
    stock: 25,
    isFeatured: true
  },
  {
    id: 'p5',
    name: 'LG InstaView Door-in-Door 635L',
    slug: 'lg-instaview-fridge',
    description: 'Toquez deux fois et voyez l\'intérieur sans ouvrir la porte.',
    price: 18500,
    categoryId: '2',
    imageId: 'prod-5',
    stock: 3,
    isFeatured: true
  },
  {
    id: 'p6',
    name: 'Climatiseur Samsung WindFree 12K',
    slug: 'samsung-windfree-12k',
    description: 'Rafraîchissement sans courants d\'air froids désagréables.',
    price: 5490,
    categoryId: '5',
    imageId: 'prod-6',
    stock: 15,
    isFeatured: true
  },
];

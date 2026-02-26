
export interface Category {
  id: string;
  name: string;
  slug: string;
  iconId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  imageUrl?: string;
  imageUrls: string[];
  stock: number;
  isFeatured?: boolean;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
}


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
  imageId: string;
  stock: number;
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

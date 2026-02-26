
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
  descriptionShort?: string;
  descriptionDetailed?: string;
  price: number;
  originalPrice?: number;
  categoryId?: string;
  categorySlug: string; // الحقل الأساسي للربط
  imageUrl?: string;
  imageUrls: string[];
  stockQuantity: number;
  stock?: number; // للتوافق مع البطاقات القديمة
  isFeatured?: boolean;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
}

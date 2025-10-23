
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId?: string; // optional yaptık
  description: string;
  imageFiles?: File[]; // optional
  images?: ExistingProductImage[];
  imageUrl?: string;
  taxRate?: number; // optional
  discountRate?: number;
  discountStart?: Date;
  discountEnd?: Date;
}

export interface ProductTest {
  id: string;
  name: string;
  price: number;
}


export interface ExistingProductImage {
  id: string;
  fileUrl: string;
  fileName: string;
  fileDescription?: string;
  type?: number;
}

export interface CreateProduct {
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  description: string;
  imageFiles: File[];  
  images?: ExistingProductImage[];
  deletedImageIds?: string[];
  taxRate: number;
  discountRate?: number;
  discountStart?: Date;
  discountEnd?: Date;
}
export interface UpdateProduct extends CreateProduct {
  id: string;
}

export interface ProductDetail{
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  description: string;
  attributes: ProductAttributes[];
  comments: ProductComments[];
  images: ExistingProductImage[];
  taxRate: number;
  discountRate?: number;
  discountStart?: Date;
  discountEnd?: Date;
}

export interface ProductAttributes{
  id: string;
  name: string;
  key: string;
  value: string;
}

export interface ProductComments{
  id: string;
  userId: string;
  userName: string;
  content: string;
  createDate: Date;
}
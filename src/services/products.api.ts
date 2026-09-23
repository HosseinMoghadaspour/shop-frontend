import { apiClient } from "./api/client";

export interface ProductPricing {
    salePrice: number;
    consumerPrice: number;
    discountPrice: number | null;
    finalPrice: number;
    hasDiscount: boolean;
    discountPercent:number | null;
    branchId: number | null;
    priceType: string | null;
}

export interface ProductImage {
    id?: number;
    url: string;
    alt: string | null;
    isDefault: boolean
}

export interface ProductStockInfo {
  barcode: string | null;
  productName: string | null;
  latinProductName: string | null;
  productNickName: string | null;
  quantity: number;
  warehouseId: number | null;
  financialYearId: number | null;
  financialId: number | null;
  warehouse: string | null;
  smallestUnit: string | null;
  categoryName: string | null;
  branchId: number | null;
  specialCategory: boolean | null;
  image: string | null;
  taxCode: string | null;
  taxName: string | null;
  taxPercent: number | null;
  taxPercentGroup: number | null;
  taxGroupGoodId: number | null;
  freeSalePrice: number | null;
  mid: number | null;
  mid2: number | null;
  maxPoint: number | null;
  minOrder: number | null;
  weight: number | null;
  quantityInBox: string | null;
  width: number | null;
  height: number | null;
  length: number | null;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  nameEn: string | null;
  alias: string;

  categoryId: number | null;
  brandId: number | null;
  producerId: number | null;
  salePrice: number;
  discountPrice: number | null;
  consumerPrice: number;

  isActive: boolean;
  isShowIsOnlineShop: boolean;

  briefDescription: string | null;
  fullDescription: string | null;
  description: string;

  isSpecialSale: boolean;
  amazingSale: boolean;

  minOrder: number | null;
  maxOrder: number | null;
  minShow: number | null;

  stock: number;
  orderPoint: number | null;

  isHasSize: boolean;

  width: number | null;
  height: number | null;
  length: number | null;
  weight: number | null;

  mainMeasureUnitId: number;
  measureUnitId: number;

  showInCofferMenu: boolean;

  createdAt: string;
  updatedAt: string | null;

  pricing: ProductPricing;

  stockInfo: ProductStockInfo[],

  images: ProductImage[];
}

export interface ProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export interface ProductsResult {
  products: Product[];
  pagination: ProductsPagination;
}

interface ProductsApiResponse {
  success: boolean;
  data: Product[];
  pagination: ProductsPagination;
}

export async function getProducts(
  params?: GetProductsParams,
): Promise<ProductsResult> {
  const response = await apiClient.get<ProductsApiResponse>(
    "/products",
    {
      params,
    },
  );

   console.log("PRODUCT API RESPONSE:", response.data);

  return {
    products: response.data.data,
    pagination: response.data.pagination,
  };
}

interface ProductApiResponse {
    success : boolean;
    data: Product;
}

export async function getProduct(productId:number):Promise<Product> {
    const response = await apiClient.get<ProductApiResponse>(
        `/products/${productId}`,
    );

    return response.data.data;
}

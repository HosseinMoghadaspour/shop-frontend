import { apiClient } from "./api/client";

export interface Product {
  id: number;
  code: string;
  name: string;
  nameEn: string;
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

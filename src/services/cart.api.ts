import { apiClient } from "./api/client";

export interface CartItem {
    goodId : number;
    rowCode : string;
    rowName: string;
    imageUrl : string | null;
    quantity : number;
    unitPrice : number;
    totalPrice : number;
    minOrder: number | null;
    maxOrder: number | null;
    isActive: boolean;
    isShowInOnlineShop: boolean;
}

export interface Cart {
    peronId : number;
    items: CartItem[];
    itemsCount: number;
    totalQuantity: number;
    subtotal: number;
}

export interface Cart {
    personId: number;
    items: CartItem[];
    itemsCount: number;
    totalQuantity: number;
    subtotal : number;
}
export interface CartApiResponse {
    success: boolean;
    message?: string;
    cart: Cart;
}

export async function getCart(): Promise<Cart> {
    const response = await apiClient.get<CartApiResponse>("/cart");
    return response.data.cart;
}

export async function addToCart(
    goodId : number,
    quantity: number,
): Promise<Cart> {
    const response = await apiClient.post<CartApiResponse>(
        "/cart/items",
        {
            goodId,
            quantity
        }
    );
    return response.data.cart;
}

export async function updateCartItem(
    goodId: number,
    quantity: number,
): Promise<Cart> {
    const response = await apiClient.patch<CartApiResponse>(
        `/cart/items/${goodId}`,
        {
            quantity
        }
    );
    return response.data.cart;
}

export async function removeFromCart(goodId:number): Promise<Cart> {
    const response = await apiClient.delete<CartApiResponse>(
        `/cart/items/${goodId}`
    );

    return response.data.cart;
}

export async function clearCart(): Promise<Cart> {
    const response = await apiClient.delete<CartApiResponse>(
        "/cart"
    );
    return response.data.cart;
}

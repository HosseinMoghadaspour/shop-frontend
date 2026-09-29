export interface PendingCartAction {
  goodId: number;
  quantity: number;
}

const PENDIN_CART_KEY = "pending-cart-action";

export function setPendingCartAction(action: PendingCartAction): void {
  sessionStorage.setItem(PENDIN_CART_KEY, JSON.stringify(action));
}

export function consumePendingCartAction(): PendingCartAction | null {
  const raw = sessionStorage.getItem(PENDIN_CART_KEY);

  if (!raw) {
    return null;
  }

  sessionStorage.removeItem(PENDIN_CART_KEY);

  try {
    const action = JSON.parse(raw) as PendingCartAction;

    if (
      !Number.isInteger(action.goodId) ||
      action.goodId <= 0 ||
      !Number.isFinite(action.quantity) ||
      action.quantity <= 0
    ) {
      return null;
    }

    return action;
  } catch {
    return null;
  }
}

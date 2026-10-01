export interface PendingCartAction {
  goodId: number;
  quantity: number;
}

const PENDING_CART_KEY = "pending-cart-action";

function isValidPendingCartAction(
  action: unknown,
): action is PendingCartAction {
  if (!action || typeof action !== "object") {
    return false;
  }

  const value = action as Record<string, unknown>;

  return (
    Number.isInteger(value.goodId) &&
    Number(value.goodId) > 0 &&
    Number.isFinite(value.quantity) &&
    Number(value.quantity) > 0
  );
}

export function setPendingCartAction(
  action: PendingCartAction,
): void {
  sessionStorage.setItem(
    PENDING_CART_KEY,
    JSON.stringify(action),
  );
}

export function getPendingCartAction(): PendingCartAction | null {
  const raw = sessionStorage.getItem(PENDING_CART_KEY);

  if (!raw) {
    return null;
  }

  try {
    const action: unknown = JSON.parse(raw);

    if (!isValidPendingCartAction(action)) {
      sessionStorage.removeItem(PENDING_CART_KEY);
      return null;
    }

    return {
      goodId: action.goodId,
      quantity: action.quantity,
    };
  } catch {
    sessionStorage.removeItem(PENDING_CART_KEY);
    return null;
  }
}

export function clearPendingCartAction(): void {
  sessionStorage.removeItem(PENDING_CART_KEY);
}

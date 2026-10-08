const WEIGHT_QUANTITY_STEP = 0.5;
const AMOUNT_QUANTITY_STEP = 1;

export function getQuantityStep(weightOrAmount: number | null | undefined): number {
  return weightOrAmount === 2
    ? AMOUNT_QUANTITY_STEP
    : WEIGHT_QUANTITY_STEP;
}

export function getMinimumQuantity(
  weightOrAmount: number | null | undefined,
  minOrder: number | null | undefined,
): number {
  const step = getQuantityStep(weightOrAmount);

  return minOrder !== null && minOrder !== undefined && minOrder > step
    ? minOrder
    : step;
}

export function getInitialQuantity(
  minOrder: number | null | undefined,
): number {
  return minOrder !== null && minOrder !== undefined && minOrder > 1
    ? minOrder
    : 1;
}

export const QUANTITY_STEP = 0.5;
export const MIN_QUANTITY = 0.5;

export function getQuantityStep(): number {
  return QUANTITY_STEP;
}
export function allowsDecimalQuantity(
  weightOrAmount: number | null | undefined,
): boolean {
  return weightOrAmount !== 2;
}

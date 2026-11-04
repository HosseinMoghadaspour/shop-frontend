const BRANCH_STORAGE_KEY = "store:selected-branch-id";
const ADDRESS_STORAGE_KEY = "store:selected-address-id";

export function getSelectedBranchId(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const value = Number(window.localStorage.getItem(BRANCH_STORAGE_KEY));
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

export function setSelectedBranchId(branchId: number | null) {
  if (typeof window === "undefined") return;
  if (branchId === null) window.localStorage.removeItem(BRANCH_STORAGE_KEY);
  else window.localStorage.setItem(BRANCH_STORAGE_KEY, String(branchId));
  window.dispatchEvent(new Event("store-branch-change"));
}

export function getSelectedAddressId(): number | undefined {
  if (typeof window === "undefined") return undefined;
  const value = Number(window.localStorage.getItem(ADDRESS_STORAGE_KEY));
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

export function setSelectedAddressId(addressId: number | null) {
  if (typeof window === "undefined") return;
  if (addressId === null) window.localStorage.removeItem(ADDRESS_STORAGE_KEY);
  else window.localStorage.setItem(ADDRESS_STORAGE_KEY, String(addressId));
  window.dispatchEvent(new Event("store-address-change"));
}

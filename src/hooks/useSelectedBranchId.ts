import { useEffect, useState } from "react";
import { getSelectedBranchId } from "@/lib/store-branch";

export function useSelectedBranchId() {
  const [branchId, setBranchId] = useState<number | undefined>(getSelectedBranchId);

  useEffect(() => {
    const sync = () => setBranchId(getSelectedBranchId());
    window.addEventListener("store-branch-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("store-branch-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return branchId;
}

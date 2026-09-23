import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function ProductSearch({
  value,
  onChange,
  onClear,
}: ProductSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="جستجوی محصول..."
        className="pr-10 pl-10"
      />

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2"
          aria-label="پاک کردن جستجو"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

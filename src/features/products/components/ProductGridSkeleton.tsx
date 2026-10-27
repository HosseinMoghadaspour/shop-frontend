import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridSkeletonProps {
  count?: number;
  horizontal?: boolean;
}

export function ProductGridSkeleton({
  count = 8,
  horizontal = false,
}: ProductGridSkeletonProps) {
  return (
    <div className={horizontal ? "flex snap-x gap-3 overflow-hidden pb-3 @sm:gap-4" : "grid grid-cols-2 gap-3 @sm:grid-cols-3 @sm:gap-4 @lg:grid-cols-4"}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={`overflow-hidden rounded-2xl border-0 shadow-sm ring-1 ring-slate-900/5 ${horizontal ? "w-[168px] shrink-0 @sm:w-[205px]" : ""}`}>
          <Skeleton className={horizontal ? "h-36 rounded-none @sm:h-44" : "aspect-square rounded-none"} />

          <CardContent className="space-y-3 p-3 @sm:p-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>

          <CardFooter className="p-3 pt-0 @sm:p-4 @sm:pt-0">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

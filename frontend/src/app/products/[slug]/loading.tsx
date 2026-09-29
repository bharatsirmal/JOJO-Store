import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery Skeleton */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0">
            <Skeleton className="w-20 h-24 md:w-24 md:h-32 rounded-md shrink-0" />
            <Skeleton className="w-20 h-24 md:w-24 md:h-32 rounded-md shrink-0" />
            <Skeleton className="w-20 h-24 md:w-24 md:h-32 rounded-md shrink-0" />
          </div>
          <Skeleton className="flex-1 rounded-xl aspect-[3/4]" />
        </div>

        {/* Info Skeleton */}
        <div className="flex flex-col">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          
          <div className="space-y-2 mb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="mb-8">
            <Skeleton className="h-4 w-16 mb-4" />
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-md" />
              <Skeleton className="w-12 h-12 rounded-md" />
              <Skeleton className="w-12 h-12 rounded-md" />
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <Skeleton className="flex-1 h-12 rounded-md" />
            <Skeleton className="w-32 h-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

import Skeleton from "./Skeleton";

export default function HomeSkeleton() {
  return (
    <div className="w-full pb-20">
      {/* Hero Banner Skeleton */}
      <div className="relative h-[85vh] w-full overflow-hidden mb-12">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-32 left-10 w-full max-w-2xl px-6 md:px-12 z-10">
          <Skeleton className="h-8 w-32 mb-4 bg-white/10" />
          <Skeleton className="h-16 w-3/4 mb-6 bg-white/10" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-36 rounded-full bg-[#00F0FF]/20" />
            <Skeleton className="h-12 w-36 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="space-y-16">
        {[1, 2, 3].map((row) => (
          <div key={row} className="pl-6 md:pl-12">
            <Skeleton className="h-8 w-48 mb-6 bg-white/10" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div key={card} className="w-40 flex-shrink-0 sm:w-48 lg:w-56">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/5" />
                  <Skeleton className="mt-3 h-5 w-3/4 bg-white/10" />
                  <Skeleton className="mt-2 h-4 w-1/2 bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

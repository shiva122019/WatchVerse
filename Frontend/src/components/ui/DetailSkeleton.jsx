import Skeleton from "./Skeleton";

export default function DetailSkeleton() {
  return (
    <div className="pb-24 w-full">
      {/* Backdrop Skeleton */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <Skeleton className="h-full w-full rounded-none bg-white/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/30" />
      </div>

      <div className="mx-auto -mt-48 max-w-6xl px-6 md:px-10">
        <div className="relative flex flex-col gap-8 md:flex-row">
          {/* Poster Skeleton */}
          <div className="w-48 shrink-0 md:w-64">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl shadow-2xl border-2 border-neutral-800 bg-white/10" />
          </div>

          {/* Meta Skeleton */}
          <div className="flex-1 pt-4">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
              <Skeleton className="h-4 w-12 bg-white/5" />
              <Skeleton className="h-4 w-16 bg-white/5" />
            </div>

            <Skeleton className="mb-4 h-12 w-3/4 bg-white/10" />
            
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 w-32 rounded-full bg-[#00F0FF]/20" />
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            </div>

            <div className="space-y-3 max-w-2xl">
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-5/6 bg-white/5" />
              <Skeleton className="h-4 w-4/6 bg-white/5" />
            </div>
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="mt-16 max-w-4xl">
          <Skeleton className="h-8 w-40 mb-8 bg-white/10" />
          
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-12 rounded-full shrink-0 bg-white/10" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-32 bg-white/10" />
                  <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

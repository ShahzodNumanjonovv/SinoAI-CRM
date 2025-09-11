export default function Loading() {
  return (
    <div className="p-6">
      {/* Sarlavha skeleton */}
      <div className="h-6 w-40 bg-slate-200 animate-pulse rounded mb-4" />

      {/* Jadval satrlarini skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-slate-200 animate-pulse rounded"
          />
        ))}
      </div>
    </div>
  );
}
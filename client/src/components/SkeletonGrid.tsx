interface SkeletonGridProps {
  count: number;
}

export default function SkeletonGrid({ count }: SkeletonGridProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`skeleton-${i}`} className="aspect-[3/4] bg-muted rounded-xl shadow-md animate-pulse" />
      ))}
    </>
  );
}

export default function PageLoading() {
  return (
    <div className="grid grid-cols-12 gap-4">
      {Array(10)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="col-span-full h-48 animate-pulse rounded-lg bg-gray-700 md:col-span-4"
          />
        ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500 uppercase tracking-widest animate-pulse">Loading...</p>
    </div>
  );
}


export default function Loading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-900">
      <div className="flex flex-col items-center gap-4">
        
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-neutral-700 border-t-white rounded-full animate-spin" />

        {/* Text */}
        <p className="text-neutral-400 text-sm tracking-wide">
          Loading map...
        </p>

      </div>
    </div>
  );
}
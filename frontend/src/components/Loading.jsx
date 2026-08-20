// frontend/src/components/Loading.jsx

export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-ualg-blue border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-500 text-sm font-medium">{text}</p>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-ualg-blue border-t-transparent animate-spin"></div>
        </div>
        <p className="text-ualg-navy font-semibold text-lg">UNITY A LIVE GROUP</p>
        <p className="text-gray-400 text-sm mt-1">Loading...</p>
      </div>
    </div>
  );
}

export function ButtonLoading({ text = 'Processing...' }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      {text}
    </span>
  );
}

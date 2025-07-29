// app/unauthorized/page.tsx
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-lg text-center mb-8">
        You do not have permission to view this page.
      </p>
      <Link href="/" className="text-blue-600 hover:underline">
        Go back to home
      </Link>
    </div>
  );
}
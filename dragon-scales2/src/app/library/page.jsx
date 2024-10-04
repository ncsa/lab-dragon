"use client";
import { useSearchParams } from 'next/navigation';  // Use useSearchParams instead of useRouter

export default function Library() {
  const searchParams = useSearchParams();  // Get access to the query parameters
  const user = searchParams.get('user');  // Extract the 'user' query parameter

  return (
    <div className='main-content'>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1>Library Page</h1>
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            {user && <p>Welcome, {user}!</p>}  {/* Display the username if it's present */}
          </div>
        </main>
      </div>
    </div>

  );
}

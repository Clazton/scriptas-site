import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-red-800 p-4 flex justify-between items-center">
      <Link href="/"><a className="text-2xl font-bold">Scriptas</a></Link>
      <div className="space-x-4">
        <Link href="/products"><a className="hover:underline">Products</a></Link>
        {session ? (
          <>
            <Link href="/invoices"><a className="hover:underline">Invoices</a></Link>
            <button
              onClick={() => signOut()}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/auth/signin"><a className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Login</a></Link>
        )}
      </div>
    </nav>
  );
}

import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  return (
    <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Thank You for Your Purchase!</h1>
      <p className="mb-6">Your payment was successful.</p>
      <p>Your Invoice ID: <span className="font-mono bg-red-700 px-2 py-1 rounded">{session_id}</span></p>
      <button
        className="mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        onClick={() => router.push("/invoices")}
      >
        View Invoices
      </button>
    </div>
  );
}

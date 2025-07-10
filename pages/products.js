import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const products = [
  { id: "1", name: "Custom Discord Bot", description: "Tailored Discord bots for your server.", price: 50 },
  { id: "2", name: "Custom Website", description: "Responsive websites to showcase your brand.", price: 100 },
];

export default function Products() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy(productId) {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.id) {
        const stripe = await (await import("@stripe/stripe-js")).loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.id });
      }
    } catch (error) {
      alert("Failed to initiate purchase");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-red-900 text-white p-8">
      <h1 className="text-4xl mb-8 font-bold text-center">Our Products</h1>
      <div className="grid gap-6 max-w-4xl mx-auto sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.id} className="bg-red-800 rounded p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
              <p className="mb-4">{product.description}</p>
              <p className="text-xl font-bold">${product.price}</p>
            </div>
            <button
              onClick={() => handleBuy(product.id)}
              disabled={loading}
              className="mt-4 bg-red-600 hover:bg-red-700 py-2 rounded font-bold transition"
            >
              {loading ? "Processing..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

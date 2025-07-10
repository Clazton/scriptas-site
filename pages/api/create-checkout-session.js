import Stripe from "stripe";
import { getSession } from "next-auth/react";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { productId } = req.body;

  // TODO: Fetch product details from database or hardcoded list
  const products = {
    "1": { name: "Custom Discord Bot", price: 5000 },
    "2": { name: "Custom Website", price: 10000 },
  };

  const product = products[productId];
  if (!product) {
    return res.status(400).json({ error: "Invalid product" });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/products`,
    });

    res.status(200).json({ id: checkoutSession.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

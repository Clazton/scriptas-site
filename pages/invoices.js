import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function Invoices({ invoices }) {
  return (
    <div className="min-h-screen bg-red-900 text-white p-8">
      <h1 className="text-4xl mb-8 font-bold text-center">Your Invoices</h1>
      <div className="max-w-4xl mx-auto space-y-6">
        {invoices.length === 0 && <p>You have no invoices yet.</p>}
        {invoices.map(inv => (
          <div key={inv.invoiceId} className="bg-red-800 p-6 rounded shadow">
            <h2 className="text-2xl font-semibold">{inv.product.name}</h2>
            <p>Invoice ID: {inv.invoiceId}</p>
            <p>Amount Paid: ${(inv.amount / 100).toFixed(2)}</p>
            <p>Date: {new Date(inv.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: "/auth/signin", permanent: false } };
  }

  const invoices = await prisma.invoice.findMany({
    where: { user: { email: session.user.email } },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    props: { invoices: JSON.parse(JSON.stringify(invoices)) },
  };
}

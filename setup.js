// setup.js
const fs = require('fs');
const path = require('path');

const files = {
  'prisma/schema.prisma': `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id       Int      @id @default(autoincrement())
  name     String?
  email    String   @unique
  password String?
  invoices Invoice[]
}

model Invoice {
  id         Int      @id @default(autoincrement())
  invoiceId  String   @unique
  userId     Int
  productId  String
  productName String
  amount     Int
  createdAt  DateTime @default(now())
}
`,
  // NextAuth config (login & signup)
  'pages/api/auth/[...nextauth].js': `import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export default NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token; },
    async session({ session, token }) { session.user.id = token.id; return session; }
  },
  secret: process.env.NEXTAUTH_SECRET,
});
`,
  // Stripe session API
  'pages/api/create-checkout-session.js': `import Stripe from "stripe";
import { getSession } from "next-auth/react";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const { productId, productName, price } = req.body;
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{ price_data: { currency: "usd", product_data: { name: productName }, unit_amount: price }, quantity: 1 }],
    success_url: \`\${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&pid=\${productId}&amt=\${price}\`,
    cancel_url: \`\${req.headers.origin}/products\`,
  });
  res.status(200).json({ id: checkoutSession.id });
}
`,
  // Success page
  'pages/success.js': `import { useRouter } from "next/router";
export default function Success() {
  const { session_id, pid, amt } = useRouter().query;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-black px-4 text-white">
      <h1 className="text-5xl font-bold mb-4 glow">Payment Successful!</h1>
      <p>Invoice ID: <span className="font-mono">{session_id}</span></p>
      <p>Product ID: {pid}, Amount: ${(amt/100).toFixed(2)}</p>
      <button onClick={() => location.href='/invoices'} className="btn mt-6 animate-pulse">View Invoices</button>
    </div>
  );
}
`,
  // Products page
  'pages/products.js': `import { useSession } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const products = [
  { id: "1", name:"Discord Bot Pro", price:5000, desc:"Moderation, commands, ovations" },
  { id: "2", name:"Website Premium", price:12000, desc:"Fully responsive brand site" }
];

export default function Products(){ 
  const { data: s } = useSession(), [loading,set]=useState(false);
  async function buy(p){
    if(!s) return location.href="/auth/signin";
    set(true);
    const res = await fetch("/api/create-checkout-session",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ productId:p.id, productName:p.name, price:p.price })
    });
    const { id } = await res.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: id });
  }
  return (
    <div className="min-h-screen bg-black px-6 py-12 text-white space-y-8">
      <h1 className="text-4xl font-bold glow-lined">Our Products</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {products.map(p=>(
          <div key={p.id} className="bg-red-900 p-6 rounded-lg shadow-lg animate-fadeup flex flex-col">
            <h2 className="text-2xl font-semibold">{p.name}</h2>
            <p className="flex-grow mt-2">{p.desc}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xl">${(p.price/100).toFixed(2)}</span>
              <button onClick={()=>buy(p)} disabled={loading} className="btn-red py-2">{loading?"...": "Buy Now"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
  // Invoices page
  'pages/invoices.js': `import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default function Invoices({ invoices }) {
  return (
    <div className="min-h-screen px-6 py-8 bg-black text-white">
      <h1 className="text-4xl font-bold glow-lined mb-8">Your Invoices</h1>
      {invoices.length===0 && <p>No invoices yet.</p>}
      <div className="space-y-6">
        {invoices.map(inv=>(
          <div key={inv.invoiceId} className="bg-red-900 p-4 rounded-lg shadow-md animate-scaleup">
            <h2 className="text-2xl">{inv.productName}</h2>
            <p>ID: {inv.invoiceId}</p>
            <p>Amount: ${(inv.amount/100).toFixed(2)}</p>
            <p>Date: {new Date(inv.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(ctx){
  const session = await getSession(ctx);
  if(!session) return { redirect:{ destination:"/auth/signin", permanent:false }};
  const invoices = await prisma.invoice.findMany({
    where: { user:{ email: session.user.email } },
    orderBy: { createdAt:'desc' }
  });
  return { props: { invoices: JSON.parse(JSON.stringify(invoices)) }};
}
`,
  // Sign-in
  'pages/auth/signin.js': `import { signIn } from "next-auth/react";
import { useState } from "react";
export default function SignIn(){
  const [e,p,er]=useState(""),useState(""),useState("");
  async function submit(ev){
    ev.preventDefault();
    const res = await signIn("credentials",{redirect:false,email:e,password:p});
    if(res.error) er(res.error); else location.href="/";
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-900">
      <form onSubmit={submit} className="bg-red-800 p-8 rounded shadow-lg space-y-4 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white">Sign In</h1>
        {er && <p className="text-red-300">{er}</p>}
        <input type="email" placeholder="Email" onChange={a=>e(a.target.value)} className="input"/>
        <input type="password" placeholder="Password" onChange={a=>p(a.target.value)} className="input"/>
        <button className="btn-red w-full py-2">Sign In</button>
      </form>
    </div>
  );
}
`,
  // Layout + navbar
  'components/Layout.js': `import Navbar from "./Navbar";
export default function Layout({children}){
  return (<>
    <Navbar/>
    <div className="flex-grow">{children}</div>
  </>);
}
`,
  'components/Navbar.js': `import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
export default function Navbar(){
  const { data:s } = useSession();
  return (
    <nav className="bg-black p-4 flex justify-between items-center">
      <Link href="/"><a className="text-xl font-bold text-white">SCRIPTAS</a></Link>
      <div className="flex gap-4">
        <Link href="/products"><a className="link">Products</a></Link>
        {s?
          <>
            <Link href="/invoices"><a className="link">Invoices</a></Link>
            <button onClick={()=>signOut()} className="btn-red-light">Logout</button>
          </>:
          <Link href="/auth/signin"><a className="btn-red-light">Login</a></Link>
        }
      </div>
    </nav>
  );
}
`,
  // Global App
  'pages/_app.js': `import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import Layout from "../components/Layout";

export default function App({ Component, pageProps: { session, ...rest } }) {
  return (
    <SessionProvider session={session}>
      <Layout/>
      <Component {...rest} session={session}/>
    </SessionProvider>
  );
}
`,
  // CSS
  'styles/globals.css': `@tailwind base; @tailwind components; @tailwind utilities;

.btn { @apply px-6 rounded-full font-bold transition; }
.btn-red { @apply bg-red-600 hover:bg-red-700 text-white; }
.btn-red-light { @apply border border-red-600 text-red-300 hover:bg-red-700; }
.link { @apply text-red-400 hover:text-red-200; }
.input { @apply w-full p-2 rounded bg-red-700 text-white border border-red-600 focus:border-red-400; }
.glow { text-shadow: 0 0 20px #ff3333; }
.glow-lined { text-shadow: 0 0 12px #ff2222; }
.animate-fadeup { animation: fadeUp 0.6s ease; }
.animate-scaleup { animation: scaleUp 0.5s ease; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}`,
  'tailwind.config.js': `module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}`,
  'postcss.config.js': `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`,
  'README.md': `# Scriptas Store
Next.js + Tailwind + NextAuth + Stripe payment store

**Setup**:
\`\`\`
npm install next react react-dom next-auth @prisma/client prisma bcryptjs stripe @stripe/stripe-js tailwindcss postcss autoprefixer
npx prisma migrate dev --name init
\`\`\`

**Run**: 
\`\`\`
npm run dev
\`\`\`
`
};

function mkdirp(f) {
  const d = path.dirname(f);
  if (d === '.' || fs.existsSync(d)) return;
  mkdirp(d);
  fs.mkdirSync(d);
}

for (const [file, content] of Object.entries(files)) {
  mkdirp(file);
  fs.writeFileSync(file, content);
  console.log('➜', file);
}

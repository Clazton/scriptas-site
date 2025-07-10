import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res.error) {
      setError(res.error);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-900 text-white">
      <form onSubmit={handleSubmit} className="bg-red-800 p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-4 font-bold">Sign In</h2>
        {error && <p className="mb-4 text-red-400">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 mb-6 rounded text-black"
          required
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 w-full p-2 rounded font-bold">Sign In</button>
      </form>
    </div>
  );
}

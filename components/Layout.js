import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-red-900 text-white">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="bg-red-800 text-center py-4 text-sm">
        &copy; 2025 Scriptas. All rights reserved.
      </footer>
    </div>
  );
}

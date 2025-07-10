import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ backgroundColor: '#330000', padding: '1rem', textAlign: 'center' }}>
      <h1 style={{ margin: 0, color: '#ff4444' }}>Scriptas</h1>
      <nav style={{ marginTop: '0.5rem' }}>
        <Link href="/">
          <a style={{ margin: '0 1rem', color: '#fff0f0' }}>Home</a>
        </Link>
        <Link href="/products">
          <a style={{ margin: '0 1rem', color: '#fff0f0' }}>Products</a>
        </Link>
        <Link href="/login">
          <a style={{ margin: '0 1rem', color: '#fff0f0' }}>Login</a>
        </Link>
      </nav>
    </header>
  );
}

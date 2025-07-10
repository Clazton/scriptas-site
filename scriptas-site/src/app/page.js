export default function Home() {
  return (
    <section style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Scriptas</h1>
      <p>Your one-stop for custom Discord bots & websites</p>
      <a
        href="https://discord.gg/scriptas"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#ff0000',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          marginTop: '1rem',
          display: 'inline-block',
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#cc0000')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ff0000')}
      >
        Join Our Discord
      </a>
    </section>
  );
}

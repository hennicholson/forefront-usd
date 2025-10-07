import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(72px, 15vw, 200px)',
          fontWeight: 900,
          color: '#000',
          marginBottom: '20px'
        }}>
          404
        </h1>
        <p style={{
          fontSize: 'clamp(20px, 3vw, 36px)',
          color: '#666',
          marginBottom: '40px',
          textTransform: 'lowercase'
        }}>
          module not found
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: '#000',
            color: '#fff',
            padding: '20px 40px',
            fontSize: 'clamp(14px, 2vw, 18px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textDecoration: 'none',
            border: '3px solid #000',
            transition: 'all 0.2s ease'
          }}
          className="hover:bg-white hover:text-black"
        >
          ← back home
        </Link>
      </div>
    </div>
  )
}

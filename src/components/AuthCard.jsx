const pageStyle = { minHeight: '100vh', background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Segoe UI', sans-serif" }
const cardStyle = { background: '#2C2C2E', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }
const titleStyle = { fontSize: 22, fontWeight: 800, color: '#C9A96E', marginBottom: 20, textAlign: 'center' }
const footerStyle = { marginTop: 18, textAlign: 'center', fontSize: 13, color: '#888' }

export default function AuthCard({ title, children, footer }) {
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>{title}</div>
        {children}
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  )
}

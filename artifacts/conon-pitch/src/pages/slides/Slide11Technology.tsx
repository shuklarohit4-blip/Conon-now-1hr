export default function Slide11Technology() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>TECHNOLOGY</span><span>2026</span>
        </div>
      </div>

      <div style={{ marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Platform Architecture</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Technology &amp; Platform</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vh 2vw', flex: 1 }}>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vh' }}>
            <div style={{ width: '1.4vw', height: '1vw', border: '2px solid #0D9488', borderRadius: '0.3vw' }} />
          </div>
          <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.8vh' }}>Mobile-First PWA</div>
          <div style={{ fontSize: '0.95vw', color: '#64748B', lineHeight: 1.6 }}>iOS and Android native app with offline-capable order drafts for low-connectivity job sites. Works on 2G.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vh' }}>
            <div style={{ width: '1.4vw', height: '1.4vw', borderRadius: '50%', border: '2px solid #0D9488' }} />
          </div>
          <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.8vh' }}>Real-Time Inventory Sync</div>
          <div style={{ fontSize: '0.95vw', color: '#64748B', lineHeight: 1.6 }}>Supplier dashboard updates stock in under 2 seconds via WebSocket push. Live pricing across all catalogues.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vh' }}>
            <div style={{ width: '0', height: '0', borderLeft: '0.6vw solid transparent', borderRight: '0.6vw solid transparent', borderBottom: '1.1vw solid #0D9488' }} />
          </div>
          <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.8vh' }}>AI Demand Forecaster</div>
          <div style={{ fontSize: '0.95vw', color: '#64748B', lineHeight: 1.6 }}>Predicts material needs 72h ahead based on local building permit data and seasonal demand patterns.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vh' }}>
            <div style={{ width: '1.4vw', height: '1vw', background: '#0D9488', borderRadius: '0.2vw', opacity: 0.6 }} />
          </div>
          <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.8vh' }}>Smart Fleet Routing</div>
          <div style={{ fontSize: '0.95vw', color: '#64748B', lineHeight: 1.6 }}>Delivery fleet optimised using live traffic data and load weight constraints. Routes update in real time.</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0D5050 100%)', padding: '2.5vh 2.3vw', borderRadius: '1vw', color: 'white' }}>
          <div style={{ width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.3)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vh' }}>
            <div style={{ fontSize: '1.2vw', fontWeight: 800, color: '#5EEAD4' }}>K</div>
          </div>
          <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.8vh' }}>CONON Khata</div>
          <div style={{ fontSize: '0.95vw', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>Digital credit ledger for contractors. Buy materials now, pay on project milestone. Embedded B2B fintech.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5vh' }}>
            <div style={{ width: '1.4vw', height: '1.4vw', background: '#0D9488', borderRadius: '0.2vw' }} />
          </div>
          <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.8vh' }}>Tech Stack</div>
          <div style={{ fontSize: '0.9vw', color: '#64748B', lineHeight: 1.7 }}>Firebase OTP auth · Drizzle ORM · PostgreSQL · Socket.io real-time · WebSocket inventory push · React Native</div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 11 of 16</span></div>
      </div>
    </div>
  );
}

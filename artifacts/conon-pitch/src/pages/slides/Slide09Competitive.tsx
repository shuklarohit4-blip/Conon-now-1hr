export default function Slide09Competitive() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>COMPETITIVE LANDSCAPE</span><span>2026</span>
        </div>
      </div>

      <div style={{ marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Defensible Moat</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>No Scaled On-Demand Player Exists</h1>
      </div>

      {/* Comparison table */}
      <div style={{ flex: 1, background: '#FFFFFF', borderRadius: '1vw', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(30,58,95,0.06)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: '#1E3A5F', padding: '2vh 2.5vw', gap: '1vw' }}>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Player</div>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'center' }}>60-min</div>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'center' }}>App</div>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'center' }}>B2B Credit</div>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'center' }}>Infra SKUs</div>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'center' }}>Job Site</div>
        </div>

        {/* CONON row — highlighted */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '2.2vh 2.5vw', gap: '1vw', background: 'rgba(13,148,136,0.06)', borderBottom: '1px solid rgba(13,148,136,0.2)', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '2vw', height: '2vw', background: '#0D9488', borderRadius: '0.4vw', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '1.1vw', fontWeight: 700, color: '#0D9488' }}>CONON</div>
              <div style={{ fontSize: '0.85vw', color: '#64748B' }}>On-demand infra platform</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1.3vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.3vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.3vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.3vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.3vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
        </div>

        {/* Offline distributors */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '2vh 2.5vw', gap: '1vw', borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 600, color: '#1E3A5F' }}>Offline Distributors</div>
            <div style={{ fontSize: '0.85vw', color: '#94A3B8' }}>Shree Cement, UltraTech dealers</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#F59E0B', fontWeight: 700 }}>Some</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
        </div>

        {/* Infra marketplaces */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '2vh 2.5vw', gap: '1vw', borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 600, color: '#1E3A5F' }}>Infra Marketplaces</div>
            <div style={{ fontSize: '0.85vw', color: '#94A3B8' }}>OfBusiness, Moglix — B2B bulk</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#F59E0B', fontWeight: 700 }}>Some</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
        </div>

        {/* Quick commerce */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '2vh 2.5vw', gap: '1vw', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 600, color: '#1E3A5F' }}>Quick Commerce</div>
            <div style={{ fontSize: '0.85vw', color: '#94A3B8' }}>Blinkit, Zepto — consumer SKUs</div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#0D9488', fontWeight: 700 }}>Yes</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
          <div style={{ textAlign: 'center', fontSize: '1.2vw', color: '#EF4444', fontWeight: 700 }}>No</div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 9 of 16</span></div>
      </div>
    </div>
  );
}

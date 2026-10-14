export default function Slide07Traction() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>TRACTION</span><span>2026</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '3.5vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Pilot Results — Delhi NCR, Jaipur, Lucknow</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Early Signals Are Strong</h1>
      </div>

      {/* 6 KPI cards 3x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vh 2vw', flex: 1 }}>

        <div style={{ background: '#FFFFFF', padding: '2.8vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pilot GMV</div>
          <div>
            <div style={{ fontSize: '3.6vw', fontWeight: 800, color: '#1E3A5F', lineHeight: 1 }}>₹4.2 Cr</div>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', marginTop: '0.8vh' }}>Across 3 pilot cities</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.8vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Contractors</div>
          <div>
            <div style={{ fontSize: '3.6vw', fontWeight: 800, color: '#1E3A5F', lineHeight: 1 }}>620+</div>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', marginTop: '0.8vh' }}>Weekly repeat orders</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.8vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Suppliers</div>
          <div>
            <div style={{ fontSize: '3.6vw', fontWeight: 800, color: '#1E3A5F', lineHeight: 1 }}>214</div>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', marginTop: '0.8vh' }}>GST + Aadhaar verified</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.8vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Order Value</div>
          <div>
            <div style={{ fontSize: '3.6vw', fontWeight: 800, color: '#1E3A5F', lineHeight: 1 }}>₹18.4K</div>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', marginTop: '0.8vh' }}>68% reorder in 30 days</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.8vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>60-Min SLA</div>
          <div>
            <div style={{ fontSize: '3.6vw', fontWeight: 800, color: '#1E3A5F', lineHeight: 1 }}>94.2%</div>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', marginTop: '0.8vh' }}>Delivery success rate</div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', padding: '2.8vh 2.5vw', borderRadius: '1vw', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NPS Score</div>
          <div>
            <div style={{ fontSize: '3.6vw', fontWeight: 800, lineHeight: 1 }}>71</div>
            <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: '0.8vh' }}>Industry benchmark: 34</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 7 of 16</span></div>
      </div>
    </div>
  );
}

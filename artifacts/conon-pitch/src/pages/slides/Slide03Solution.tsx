export default function Slide03Solution() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr auto', gap: '3vh 4vw', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '0.02em' }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>THE SOLUTION</span><span>2026</span>
        </div>
      </div>

      {/* Left */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5vh' }}>Introducing CONON</div>
        <h1 style={{ fontSize: '3.8vw', fontWeight: 800, margin: '0 0 2.5vh 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>On-demand.<br />Verified.<br />60 minutes.</h1>
        <p style={{ fontSize: '1.3vw', color: '#475569', lineHeight: 1.6, margin: '0 0 3vh 0' }}>
          Cement, steel, tiles, paints, hardware, plumbing — delivered to any job site in India in under 60 minutes from verified local suppliers.
        </p>
        <div style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', color: 'white', padding: '3vh 2.5vw', borderRadius: '1vw' }}>
          <div style={{ fontSize: '1vw', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5vh' }}>Category Position</div>
          <div style={{ fontSize: '1.8vw', fontWeight: 800, lineHeight: 1.3 }}>Blinkit for<br />Construction</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.7)', marginTop: '1vh' }}>No direct competitor at scale in India</div>
        </div>
      </div>

      {/* Right — 4 pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', justifyContent: 'center' }}>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4vw', fontWeight: 700, color: '#0D9488' }}>1</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.5vh' }}>Customers</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>Builders, contractors, homeowners and project managers order via app with live pricing from verified catalogues.</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4vw', fontWeight: 700, color: '#0D9488' }}>2</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.5vh' }}>Suppliers</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>Verified local shops and dealers list inventory, receive digital orders and get instant T+1 settlements.</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4vw', fontWeight: 700, color: '#0D9488' }}>3</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.5vh' }}>Delivery</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>Dedicated fleet and dark-store network pre-positions high-velocity SKUs for guaranteed 60-minute fulfilment.</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '2.8vw', height: '2.8vw', background: 'rgba(13,148,136,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4vw', fontWeight: 700, color: '#0D9488' }}>4</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.5vh' }}>Data Layer</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>AI-powered demand forecasting keeps the right SKUs pre-positioned at every hub, 72h ahead of demand spikes.</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 3 of 16</span></div>
      </div>
    </div>
  );
}

export default function Slide12UnitEconomics() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr auto', gap: '3vh 4vw', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>UNIT ECONOMICS</span><span>2026</span>
        </div>
      </div>

      {/* Left: waterfall breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh', justifyContent: 'center' }}>
        <div style={{ marginBottom: '0.5vh' }}>
          <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Per Order Breakdown</div>
          <h2 style={{ fontSize: '2.6vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Unit Economics</h2>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.8vw', overflow: 'hidden' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.8vh 2vw', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '1vw', color: '#64748B' }}>Average Order Value (AOV)</div>
            <div style={{ fontSize: '1.3vw', fontWeight: 700, color: '#1E3A5F' }}>₹18,400</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.8vh 2vw', borderBottom: '1px solid #F1F5F9', background: 'rgba(13,148,136,0.04)' }}>
            <div style={{ fontSize: '1vw', color: '#0D9488', fontWeight: 600 }}>Platform Take Rate (10%)</div>
            <div style={{ fontSize: '1.3vw', fontWeight: 700, color: '#0D9488' }}>₹1,840</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.8vh 2vw', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '1vw', color: '#64748B' }}>Last-Mile Delivery Cost</div>
            <div style={{ fontSize: '1.3vw', fontWeight: 700, color: '#EF4444' }}>- ₹420</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.8vh 2vw', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '1vw', color: '#64748B' }}>Payment + Warehousing</div>
            <div style={{ fontSize: '1.3vw', fontWeight: 700, color: '#EF4444' }}>- ₹180</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.2vh 2vw', background: 'rgba(13,148,136,0.08)', borderTop: '2px solid #0D9488' }}>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, color: '#0D9488' }}>Contribution Margin</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#0D9488', background: 'rgba(13,148,136,0.15)', padding: '0.3vh 0.8vw', borderRadius: '2vw' }}>67%</div>
              <div style={{ fontSize: '1.5vw', fontWeight: 800, color: '#0D9488' }}>₹1,240</div>
            </div>
          </div>

        </div>
      </div>

      {/* Right: key ratios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh', justifyContent: 'center' }}>

        <div style={{ background: '#1E3A5F', padding: '3vh 2.8vw', borderRadius: '1vw', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>LTV : CAC Ratio</div>
          <div style={{ fontSize: '5vw', fontWeight: 900, color: '#5EEAD4', lineHeight: 1 }}>33×</div>
          <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.55)', marginTop: '0.8vh' }}>LTV ₹22,400 · CAC ₹680</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8vw' }}>
          <div style={{ background: '#FFFFFF', padding: '2.5vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.8vh' }}>CAC</div>
            <div style={{ fontSize: '2.2vw', fontWeight: 800, color: '#1E3A5F' }}>₹680</div>
            <div style={{ fontSize: '0.85vw', color: '#0D9488', marginTop: '0.5vh' }}>Dropping</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '2.5vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.8vh' }}>Payback</div>
            <div style={{ fontSize: '2.2vw', fontWeight: 800, color: '#1E3A5F' }}>&lt;1 mo</div>
            <div style={{ fontSize: '0.85vw', color: '#0D9488', marginTop: '0.5vh' }}>Best-in-class</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '2.5vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.8vh' }}>Gross Margin</div>
            <div style={{ fontSize: '2.2vw', fontWeight: 800, color: '#1E3A5F' }}>34%</div>
            <div style={{ fontSize: '0.85vw', color: '#0D9488', marginTop: '0.5vh' }}>At scale</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '2.5vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.8vh' }}>Repeat Rate</div>
            <div style={{ fontSize: '2.2vw', fontWeight: 800, color: '#1E3A5F' }}>68%</div>
            <div style={{ fontSize: '0.85vw', color: '#0D9488', marginTop: '0.5vh' }}>Within 30 days</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 12 of 16</span></div>
      </div>
    </div>
  );
}

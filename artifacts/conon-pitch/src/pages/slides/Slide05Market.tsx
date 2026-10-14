export default function Slide05Market() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>MARKET OPPORTUNITY</span><span>2026</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '3.5vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Category Size</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Market Opportunity</h1>
      </div>

      {/* TAM / SAM / SOM circles + cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vw', flex: '0 0 auto', marginBottom: '3vh' }}>

        <div style={{ background: '#1E3A5F', padding: '3.5vh 2.5vw', borderRadius: '1vw', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '-3vh', right: '-2vw', width: '12vw', height: '12vw', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5vh' }}>TAM</div>
          <div style={{ fontSize: '3.8vw', fontWeight: 900, marginBottom: '0.5vh', letterSpacing: '-0.02em' }}>$154B</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.5)', marginBottom: '2vh' }}>₹12.8 lakh crore</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Total Indian construction materials market</div>
        </div>

        <div style={{ background: '#0F766E', padding: '3.5vh 2.5vw', borderRadius: '1vw', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '-3vh', right: '-2vw', width: '10vw', height: '10vw', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5vh' }}>SAM</div>
          <div style={{ fontSize: '3.8vw', fontWeight: 900, marginBottom: '0.5vh', letterSpacing: '-0.02em' }}>$37B</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.5)', marginBottom: '2vh' }}>₹3.1 lakh crore</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Urban + peri-urban informal procurement addressable by rapid delivery</div>
        </div>

        <div style={{ background: '#0D9488', padding: '3.5vh 2.5vw', borderRadius: '1vw', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: '-3vh', right: '-2vw', width: '8vw', height: '8vw', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)' }} />
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5vh' }}>SOM</div>
          <div style={{ fontSize: '3.8vw', fontWeight: 900, marginBottom: '0.5vh', letterSpacing: '-0.02em' }}>$2.2B</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.5)', marginBottom: '2vh' }}>₹18,000 crore</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Top-20 cities, 60-min deliverable SKUs by 2028</div>
        </div>

      </div>

      {/* Context strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2vw', flex: 1 }}>
        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#0D9488' }}>9.8%</div>
            <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>CAGR</div>
          </div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.5 }}>Construction sector CAGR. Government infra spend up 33% YoY under PM Gati Shakti.</div>
        </div>
        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#1E3A5F' }}>0-to-1</div>
            <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Category</div>
          </div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.5 }}>No scaled on-demand construction materials player exists in India. CONON is creating the category.</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 5 of 16</span></div>
      </div>
    </div>
  );
}

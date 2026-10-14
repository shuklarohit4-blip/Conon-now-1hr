export default function Slide08GrowthChart() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>GMV GROWTH</span><span>2026</span>
        </div>
      </div>

      {/* Title + headline stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5vh', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Pilot Performance</div>
          <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Months 1–9 GMV Growth</h1>
        </div>
        <div style={{ display: 'flex', gap: '3vw' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5vw', fontWeight: 900, color: '#0D9488' }}>3.2×</div>
            <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>M1 to M6</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5vw', fontWeight: 900, color: '#1E3A5F' }}>₹1.1Cr</div>
            <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Month 9 GMV</div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1vw', padding: '3.5vh 3vw', flex: 1, boxShadow: '0 2px 12px rgba(30,58,95,0.06)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3vh', flexShrink: 0 }}>
          <div style={{ fontSize: '1.1vw', fontWeight: 600, color: '#1E3A5F' }}>Monthly GMV (Rupees Lakhs)</div>
          <div style={{ fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', background: 'rgba(13,148,136,0.1)', padding: '0.5vh 1.2vw', borderRadius: '2vw' }}>Tracking ₹15 Cr/mo by Q4 2026</div>
        </div>

        {/* Bars */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2vw', borderBottom: '2px solid #E2E8F0', paddingBottom: '1.5vh' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹8L</div>
            <div style={{ width: '100%', height: '7%', background: 'rgba(13,148,136,0.2)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M1</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹14L</div>
            <div style={{ width: '100%', height: '13%', background: 'rgba(13,148,136,0.28)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M2</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹22L</div>
            <div style={{ width: '100%', height: '20%', background: 'rgba(13,148,136,0.36)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M3</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹31L</div>
            <div style={{ width: '100%', height: '28%', background: 'rgba(13,148,136,0.44)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M4</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹44L</div>
            <div style={{ width: '100%', height: '40%', background: 'rgba(13,148,136,0.52)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M5</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹58L</div>
            <div style={{ width: '100%', height: '53%', background: 'rgba(13,148,136,0.60)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M6</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹72L</div>
            <div style={{ width: '100%', height: '65%', background: 'rgba(13,148,136,0.72)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M7</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B' }}>₹96L</div>
            <div style={{ width: '100%', height: '87%', background: 'rgba(13,148,136,0.86)', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 600, color: '#94A3B8' }}>M8</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2vh', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488' }}>₹1.1Cr</div>
            <div style={{ width: '100%', height: '100%', background: '#0D9488', borderRadius: '0.3vw 0.3vw 0 0' }} />
            <div style={{ fontSize: '1vw', fontWeight: 700, color: '#0D9488' }}>M9</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 8 of 16</span></div>
      </div>
    </div>
  );
}

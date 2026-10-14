export default function Slide14Financials() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>FINANCIAL PROJECTIONS</span><span>2026</span>
        </div>
      </div>

      <div style={{ marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>3-Year Outlook</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Financial Projections</h1>
      </div>

      {/* 3 year cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5vw', flex: '0 0 auto', marginBottom: '3vh' }}>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.8vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5vh' }}>
            <div style={{ fontSize: '1.2vw', fontWeight: 800, color: '#1E3A5F' }}>FY26</div>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '0.3vh 0.8vw', borderRadius: '2vw' }}>Investment Phase</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
            <div>
              <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.3vh' }}>GMV</div>
              <div style={{ fontSize: '2.4vw', fontWeight: 800, color: '#1E3A5F' }}>₹28 Cr</div>
            </div>
            <div style={{ height: '1px', background: '#F1F5F9' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75vw', color: '#94A3B8', textTransform: 'uppercase' }}>Net Revenue</div>
                <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#1E3A5F' }}>₹2.8 Cr</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75vw', color: '#94A3B8', textTransform: 'uppercase' }}>EBITDA</div>
                <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#EF4444' }}>-₹1.2 Cr</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#1E3A5F', padding: '3vh 2.8vw', borderRadius: '1vw', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5vh' }}>
            <div style={{ fontSize: '1.2vw', fontWeight: 800 }}>FY27</div>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#5EEAD4', background: 'rgba(13,148,136,0.25)', padding: '0.3vh 0.8vw', borderRadius: '2vw' }}>Breakeven</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
            <div>
              <div style={{ fontSize: '0.8vw', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: '0.3vh' }}>GMV</div>
              <div style={{ fontSize: '2.4vw', fontWeight: 800 }}>₹180 Cr</div>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75vw', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Net Revenue</div>
                <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>₹18 Cr</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75vw', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>EBITDA</div>
                <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#5EEAD4' }}>₹3.6 Cr</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#0D9488', padding: '3vh 2.8vw', borderRadius: '1vw', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5vh' }}>
            <div style={{ fontSize: '1.2vw', fontWeight: 800 }}>FY28</div>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.15)', padding: '0.3vh 0.8vw', borderRadius: '2vw' }}>Scale</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
            <div>
              <div style={{ fontSize: '0.8vw', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '0.3vh' }}>GMV</div>
              <div style={{ fontSize: '2.4vw', fontWeight: 800 }}>₹720 Cr</div>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75vw', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>Net Revenue</div>
                <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>₹79 Cr</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75vw', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>EBITDA</div>
                <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>₹24 Cr</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Assumptions strip */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1vw', padding: '2.2vh 2.5vw', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', flex: 1, display: 'flex', alignItems: 'center', gap: '4vw' }}>
        <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Key Assumptions</div>
        <div style={{ width: '1px', height: '4vh', background: '#E2E8F0', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: '3vw', flex: 1 }}>
          <div style={{ fontSize: '0.95vw', color: '#475569', lineHeight: 1.5 }}>12 cities by FY27</div>
          <div style={{ fontSize: '0.95vw', color: '#475569', lineHeight: 1.5 }}>4% GMV growth MoM</div>
          <div style={{ fontSize: '0.95vw', color: '#475569', lineHeight: 1.5 }}>Take rate stable at 10%</div>
          <div style={{ fontSize: '0.95vw', color: '#475569', lineHeight: 1.5 }}>78% fleet utilisation</div>
          <div style={{ fontSize: '0.95vw', color: '#0D9488', fontWeight: 600 }}>City-level EBITDA+ by Month 18</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 14 of 16</span></div>
      </div>
    </div>
  );
}

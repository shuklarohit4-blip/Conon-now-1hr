export default function Slide10GTM() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>GO-TO-MARKET</span><span>2026</span>
        </div>
      </div>

      <div style={{ marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Expansion Playbook</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Go-to-Market Strategy</h1>
      </div>

      {/* 3 phases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5vw', flex: '0 0 auto', marginBottom: '2.5vh' }}>

        <div style={{ background: '#1E3A5F', padding: '3vh 2.5vw', borderRadius: '1vw', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-2vh', right: '-1vw', fontSize: '9vw', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>1</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1vh' }}>Phase 1 · 2025–26</div>
          <div style={{ fontSize: '1.4vw', fontWeight: 800, marginBottom: '1.5vh', lineHeight: 1.2 }}>Dominate 3 Tier-1 Clusters</div>
          <div style={{ fontSize: '0.95vw', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>Delhi NCR, Jaipur, and Lucknow via contractor-led virality. Build supply-side density before expanding.</div>
          <div style={{ marginTop: '2vh', display: 'flex', gap: '0.8vw', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(13,148,136,0.3)', color: '#5EEAD4', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>Delhi NCR</span>
            <span style={{ background: 'rgba(13,148,136,0.3)', color: '#5EEAD4', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>Jaipur</span>
            <span style={{ background: 'rgba(13,148,136,0.3)', color: '#5EEAD4', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>Lucknow</span>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-2vh', right: '-1vw', fontSize: '9vw', fontWeight: 900, color: 'rgba(13,148,136,0.06)', lineHeight: 1 }}>2</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1vh' }}>Phase 2 · 2026–27</div>
          <div style={{ fontSize: '1.4vw', fontWeight: 800, marginBottom: '1.5vh', lineHeight: 1.2, color: '#1E3A5F' }}>12 Cities + Dark Stores</div>
          <div style={{ fontSize: '0.95vw', color: '#64748B', lineHeight: 1.6 }}>Launch CONON dark stores — pre-positioned material hubs in high-density construction zones across 12 cities.</div>
          <div style={{ marginTop: '2vh', display: 'flex', gap: '0.8vw', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(13,148,136,0.1)', color: '#0D9488', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>12 cities</span>
            <span style={{ background: 'rgba(13,148,136,0.1)', color: '#0D9488', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>Dark stores</span>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-2vh', right: '-1vw', fontSize: '9vw', fontWeight: 900, color: 'rgba(13,148,136,0.06)', lineHeight: 1 }}>3</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1vh' }}>Phase 3 · 2027–28</div>
          <div style={{ fontSize: '1.4vw', fontWeight: 800, marginBottom: '1.5vh', lineHeight: 1.2, color: '#1E3A5F' }}>40 Cities + GCC Expansion</div>
          <div style={{ fontSize: '0.95vw', color: '#64748B', lineHeight: 1.6 }}>Supplier SaaS as standalone product. International expansion into Gulf Cooperation Council construction markets.</div>
          <div style={{ marginTop: '2vh', display: 'flex', gap: '0.8vw', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(13,148,136,0.1)', color: '#0D9488', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>40 cities</span>
            <span style={{ background: 'rgba(13,148,136,0.1)', color: '#0D9488', padding: '0.4vh 0.8vw', borderRadius: '2vw', fontSize: '0.8vw', fontWeight: 600 }}>GCC</span>
          </div>
        </div>

      </div>

      {/* Acquisition + Retention */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2vw', flex: 1 }}>
        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8vh' }}>Acquisition</div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.6 }}>Job-site visits and mason/contractor referral programme — ₹500 credit per verified referral. CAC dropping as word-of-mouth dominates.</div>
        </div>
        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8vh' }}>Retention</div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.6 }}>CONON Pro membership, Khata credit line, and AI-driven reorder reminders tied to project timelines keep LTV:CAC at 33×.</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 10 of 16</span></div>
      </div>
    </div>
  );
}

export default function Slide13Team() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>THE TEAM</span><span>2026</span>
        </div>
      </div>

      <div style={{ marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>28 People Strong</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Builders Who Build</h1>
      </div>

      {/* Team stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2vw', marginBottom: '2.5vh', flexShrink: 0 }}>
        <div style={{ background: '#FFFFFF', padding: '2vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '2.4vw', fontWeight: 800, color: '#1E3A5F' }}>28</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Team size</div>
        </div>
        <div style={{ background: '#FFFFFF', padding: '2vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '2.4vw', fontWeight: 800, color: '#1E3A5F' }}>40+</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Years combined</div>
        </div>
        <div style={{ background: '#FFFFFF', padding: '2vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '2.4vw', fontWeight: 800, color: '#1E3A5F' }}>3</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Cities ops</div>
        </div>
        <div style={{ background: '#0D9488', padding: '2vh 2vw', borderRadius: '1vw', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2.4vw', fontWeight: 800 }}>Delhi</div>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>HQ</div>
        </div>
      </div>

      {/* Domain expertise */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vw', flex: '0 0 auto', marginBottom: '2.5vh' }}>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1vh' }}>Founders</div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.6 }}>Deep domain expertise in construction supply chain, last-mile logistics, and B2B fintech across India and GCC.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1vh' }}>Advisors</div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.6 }}>ex-IIT engineers and former senior executives from Blinkit, OfBusiness, and L&amp;T with category-building experience.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.3vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1vh' }}>Investors</div>
          <div style={{ fontSize: '1vw', color: '#475569', lineHeight: 1.6 }}>Backed by Delhi Angels and IAN. ₹3 Cr angel round fully deployed. Series A being raised now.</div>
        </div>

      </div>

      {/* Department strips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.8vw', flex: 1 }}>
        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '0.8vw', padding: '1.8vh 1.8vw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>Engineering</div>
          <div style={{ fontSize: '2vw', fontWeight: 800, color: '#1E3A5F' }}>8</div>
        </div>
        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '0.8vw', padding: '1.8vh 1.8vw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>Operations</div>
          <div style={{ fontSize: '2vw', fontWeight: 800, color: '#1E3A5F' }}>12</div>
        </div>
        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '0.8vw', padding: '1.8vh 1.8vw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>Product</div>
          <div style={{ fontSize: '2vw', fontWeight: 800, color: '#1E3A5F' }}>4</div>
        </div>
        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '0.8vw', padding: '1.8vh 1.8vw', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>City Leads</div>
          <div style={{ fontSize: '2vw', fontWeight: 800, color: '#1E3A5F' }}>4</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 13 of 16</span></div>
      </div>
    </div>
  );
}

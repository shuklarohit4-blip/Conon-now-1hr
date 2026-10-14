export default function Slide15Ask() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr auto', gap: '3vh 4vw', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>THE ASK</span><span>2026</span>
        </div>
      </div>

      {/* Left: raise details */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2.5vh' }}>
        <div>
          <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1vh' }}>Series A Round</div>
          <div style={{ fontSize: '6vw', fontWeight: 900, color: '#1E3A5F', lineHeight: 1, letterSpacing: '-0.03em' }}>₹25 Cr</div>
          <div style={{ fontSize: '1.4vw', color: '#64748B', marginTop: '0.8vh' }}>approx. $3M USD</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8vw' }}>
          <div style={{ background: '#FFFFFF', padding: '2.2vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5vh' }}>Post-money</div>
            <div style={{ fontSize: '1.6vw', fontWeight: 800, color: '#1E3A5F' }}>₹150 Cr</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '2.2vh 2vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)' }}>
            <div style={{ fontSize: '0.8vw', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5vh' }}>Previous raise</div>
            <div style={{ fontSize: '1.6vw', fontWeight: 800, color: '#1E3A5F' }}>₹3 Cr</div>
          </div>
        </div>
        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '1vw', padding: '2vh 2vw' }}>
          <div style={{ fontSize: '0.85vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', marginBottom: '0.5vh' }}>Angel Investors</div>
          <div style={{ fontSize: '1vw', color: '#475569' }}>Delhi Angels · Indian Angel Network — fully deployed</div>
        </div>
      </div>

      {/* Right: use of funds */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2vh' }}>
        <div style={{ fontSize: '1vw', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Use of Funds</div>

        <div style={{ background: '#1E3A5F', padding: '2.8vh 2.5vw', borderRadius: '1vw', color: 'white', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0, width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: 'rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5vw', fontWeight: 900, color: '#5EEAD4' }}>40%</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.4vh' }}>City Expansion</div>
            <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Full Delhi NCR coverage + Pune, Hyderabad, Chandigarh, Kota</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0, width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5vw', fontWeight: 900, color: '#0D9488' }}>25%</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.4vh', color: '#1E3A5F' }}>Dark Store Infrastructure</div>
            <div style={{ fontSize: '0.9vw', color: '#64748B', lineHeight: 1.5 }}>8 pre-positioned material hubs across 3 cities</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0, width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5vw', fontWeight: 900, color: '#0D9488' }}>20%</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.4vh', color: '#1E3A5F' }}>Technology</div>
            <div style={{ fontSize: '0.9vw', color: '#64748B', lineHeight: 1.5 }}>AI forecasting engine, Khata credit platform, Supplier SaaS v2</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0, width: '4.5vw', height: '4.5vw', borderRadius: '50%', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5vw', fontWeight: 900, color: '#0D9488' }}>15%</div>
          <div>
            <div style={{ fontSize: '1.15vw', fontWeight: 700, marginBottom: '0.4vh', color: '#1E3A5F' }}>Team</div>
            <div style={{ fontSize: '0.9vw', color: '#64748B', lineHeight: 1.5 }}>50 hires across operations, engineering, and city leads</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 15 of 16</span></div>
      </div>
    </div>
  );
}

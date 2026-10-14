export default function Slide06BusinessModel() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>BUSINESS MODEL</span><span>2026</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '3.5vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Revenue Architecture</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>4 Diversified Revenue Streams</h1>
      </div>

      {/* 4 revenue cards in 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5vh 2.5vw', flex: 1 }}>

        <div style={{ background: '#1E3A5F', padding: '3vh 2.8vw', borderRadius: '1vw', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5vh' }}>
              <div style={{ fontSize: '0.85vw', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary</div>
              <div style={{ fontSize: '1.2vw', fontWeight: 800, color: '#0D9488' }}>8–12%</div>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 800, marginBottom: '1vh' }}>Take Rate</div>
            <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>Commission on every GMV transaction processed through the platform. Revenue scales directly with volume.</div>
          </div>
          <div style={{ background: 'rgba(13,148,136,0.25)', borderRadius: '0.5vw', padding: '1vh 1.2vw', fontSize: '0.9vw', fontWeight: 600, color: '#5EEAD4', display: 'inline-block', alignSelf: 'flex-start', marginTop: '1.5vh' }}>Scales with GMV</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.8vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5vh' }}>
              <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subscription</div>
              <div style={{ fontSize: '1.2vw', fontWeight: 800, color: '#0D9488' }}>₹4,999/mo</div>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 800, marginBottom: '1vh', color: '#1E3A5F' }}>CONON Pro</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>Monthly subscription for contractors — priority delivery, credit line, and bulk pricing. High-margin recurring revenue.</div>
          </div>
          <div style={{ background: 'rgba(13,148,136,0.1)', borderRadius: '0.5vw', padding: '1vh 1.2vw', fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', display: 'inline-block', alignSelf: 'flex-start', marginTop: '1.5vh' }}>High-margin SaaS</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.8vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5vh' }}>
              <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>SaaS</div>
              <div style={{ fontSize: '1.2vw', fontWeight: 800, color: '#0D9488' }}>₹999–2,999/mo</div>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 800, marginBottom: '1vh', color: '#1E3A5F' }}>Supplier SaaS</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>Inventory management, demand alerts, and digital ledger (Khata) for supplier partners. Sticky tool revenue.</div>
          </div>
          <div style={{ background: 'rgba(13,148,136,0.1)', borderRadius: '0.5vw', padding: '1vh 1.2vw', fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', display: 'inline-block', alignSelf: 'flex-start', marginTop: '1.5vh' }}>Negative churn</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.8vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5vh' }}>
              <div style={{ fontSize: '0.85vw', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Logistics</div>
              <div style={{ fontSize: '1.2vw', fontWeight: 800, color: '#0D9488' }}>Off-peak</div>
            </div>
            <div style={{ fontSize: '1.5vw', fontWeight: 800, marginBottom: '1vh', color: '#1E3A5F' }}>Logistics-as-a-Service</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>White-label fleet utilisation during off-peak hours for FMCG and pharma. Fleet earns 24/7.</div>
          </div>
          <div style={{ background: 'rgba(13,148,136,0.1)', borderRadius: '0.5vw', padding: '1vh 1.2vw', fontSize: '0.9vw', fontWeight: 600, color: '#0D9488', display: 'inline-block', alignSelf: 'flex-start', marginTop: '1.5vh' }}>Asset utilisation</div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 6 of 16</span></div>
      </div>
    </div>
  );
}

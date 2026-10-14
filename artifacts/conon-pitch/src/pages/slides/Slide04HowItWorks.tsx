export default function Slide04HowItWorks() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700 }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>HOW IT WORKS</span><span>2026</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '3.5vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>The Flow</div>
        <h1 style={{ fontSize: '3.2vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>3 Taps, 60 Minutes</h1>
      </div>

      {/* 3 main steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2vw', flex: '0 0 auto', marginBottom: '2.5vh' }}>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0D9488', borderRadius: '1vw 1vw 0 0' }} />
          <div style={{ fontSize: '3vw', fontWeight: 900, color: 'rgba(13,148,136,0.15)', marginBottom: '1.5vh', lineHeight: 1 }}>01</div>
          <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '1vh', color: '#1E3A5F' }}>Order</div>
          <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.6 }}>Customer selects materials from verified local supplier catalogue with live, transparent pricing — no middlemen.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0D9488', borderRadius: '1vw 1vw 0 0' }} />
          <div style={{ fontSize: '3vw', fontWeight: 900, color: 'rgba(13,148,136,0.15)', marginBottom: '1.5vh', lineHeight: 1 }}>02</div>
          <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '1vh', color: '#1E3A5F' }}>Confirm</div>
          <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.6 }}>Supplier accepts the order in under 90 seconds. Fulfilment SLA clock starts automatically. No phone calls needed.</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '3vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 12px rgba(30,58,95,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0D9488', borderRadius: '1vw 1vw 0 0' }} />
          <div style={{ fontSize: '3vw', fontWeight: 900, color: 'rgba(13,148,136,0.15)', marginBottom: '1.5vh', lineHeight: 1 }}>03</div>
          <div style={{ fontSize: '1.3vw', fontWeight: 700, marginBottom: '1vh', color: '#1E3A5F' }}>Deliver</div>
          <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.6 }}>Driver partner picks up and delivers to the job site with real-time GPS tracking. Materials arrive in 60 minutes.</div>
        </div>

      </div>

      {/* 2 detail strips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2vw', flex: 1 }}>

        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', padding: '2.2vh 2.5vw', borderRadius: '1vw', display: 'flex', gap: '1.5vw', alignItems: 'center' }}>
          <div style={{ flexShrink: 0, width: '2.8vw', height: '2.8vw', background: '#0D9488', borderRadius: '0.5vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '1.4vw', height: '1.4vw', border: '2px solid white', borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, color: '#0D9488', marginBottom: '0.4vh' }}>1-Scan KYC Onboarding</div>
            <div style={{ fontSize: '0.95vw', color: '#475569', lineHeight: 1.5 }}>Vendors onboarded via 1-scan GST + Aadhaar verification in under 3 minutes. No paperwork, no branch visit.</div>
          </div>
        </div>

        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.2)', padding: '2.2vh 2.5vw', borderRadius: '1vw', display: 'flex', gap: '1.5vw', alignItems: 'center' }}>
          <div style={{ flexShrink: 0, width: '2.8vw', height: '2.8vw', background: '#0D9488', borderRadius: '0.5vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '0', height: '0', borderLeft: '0.7vw solid transparent', borderRight: '0.7vw solid transparent', borderBottom: '1.2vw solid white' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, color: '#0D9488', marginBottom: '0.4vh' }}>Flexible Payment — UPI, Khata, COD</div>
            <div style={{ fontSize: '0.95vw', color: '#475569', lineHeight: 1.5 }}>UPI, credit line (Khata), and COD — all settled T+1 to suppliers. No cash handling friction at delivery.</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2.5vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 4 of 16</span></div>
      </div>
    </div>
  );
}

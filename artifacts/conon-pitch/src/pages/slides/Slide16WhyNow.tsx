export default function Slide16WhyNow() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#1E3A5F', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: 'white' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '2vh', marginBottom: '3.5vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '0.02em' }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>
          <span>WHY NOW</span><span>2026</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '3.5vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#5EEAD4', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>The Moment Is Now</div>
        <h1 style={{ fontSize: '3.5vw', fontWeight: 900, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em', textWrap: 'balance' }}>Why Now — Why CONON</h1>
      </div>

      {/* 5 reason cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh', flex: 1 }}>

        <div style={{ display: 'flex', gap: '2vw', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.8vw', padding: '1.8vh 2.5vw' }}>
          <div style={{ flexShrink: 0, width: '4vw', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 900, color: '#5EEAD4', lineHeight: 1 }}>₹111</div>
            <div style={{ fontSize: '0.7vw', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>lakh cr</div>
          </div>
          <div style={{ width: '1px', height: '4vh', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>Infrastructure spending planned under PM Gati Shakti through 2030. Supply-side demand has never been higher.</div>
        </div>

        <div style={{ display: 'flex', gap: '2vw', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.8vw', padding: '1.8vh 2.5vw' }}>
          <div style={{ flexShrink: 0, width: '4vw', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 900, color: '#5EEAD4', lineHeight: 1 }}>72M</div>
            <div style={{ fontSize: '0.7vw', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>workers</div>
          </div>
          <div style={{ width: '1px', height: '4vh', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>Construction workers in India — the world's largest informal labour market is going digital for the first time.</div>
        </div>

        <div style={{ display: 'flex', gap: '2vw', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.8vw', padding: '1.8vh 2.5vw' }}>
          <div style={{ flexShrink: 0, width: '4vw', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 900, color: '#5EEAD4', lineHeight: 1 }}>UPI</div>
            <div style={{ fontSize: '0.7vw', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>+ ONDC</div>
          </div>
          <div style={{ width: '1px', height: '4vh', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>UPI and ONDC rails now make B2B digital commerce genuinely frictionless for the first time in India's history.</div>
        </div>

        <div style={{ display: 'flex', gap: '2vw', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.8vw', padding: '1.8vh 2.5vw' }}>
          <div style={{ flexShrink: 0, width: '4vw', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 900, color: '#5EEAD4', lineHeight: 1 }}>60</div>
            <div style={{ fontSize: '0.7vw', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>minutes</div>
          </div>
          <div style={{ width: '1px', height: '4vh', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>Quick commerce has trained urban India to expect speed. Construction workers now demand the same for job site materials.</div>
        </div>

      </div>

      {/* Closing statement */}
      <div style={{ background: '#0D9488', borderRadius: '1vw', padding: '2.8vh 3vw', marginTop: '2.5vh', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3vw' }}>
        <div>
          <div style={{ fontSize: '1.6vw', fontWeight: 900, lineHeight: 1.3, color: 'white' }}>Join us in building the infrastructure that builds India.</div>
          <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.7)', marginTop: '0.8vh' }}>CONON — the only team combining construction domain depth, logistics, and B2B fintech in one platform.</div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: '1vw', fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4vh' }}>Contact</div>
          <div style={{ fontSize: '1.1vw', fontWeight: 600, color: 'white' }}>confidential@conon.in</div>
          <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.55)' }}>Delhi NCR, India</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.5vh', marginTop: '2vh', fontSize: '0.9vw', color: 'rgba(255,255,255,0.35)', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 16 of 16</span></div>
      </div>
    </div>
  );
}

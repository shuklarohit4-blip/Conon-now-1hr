const base = import.meta.env.BASE_URL;

export default function Slide01Cover() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', sans-serif", color: '#1E3A5F' }}>
      {/* Full-bleed hero image */}
      <img src={`${base}cover-hero.jpg`} crossOrigin="anonymous" alt="Construction site" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,30,55,0.88) 0%, rgba(10,50,50,0.75) 100%)' }} />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', padding: '4vh 5vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
            <div style={{ width: '2.4vw', height: '2.4vw', backgroundColor: '#0D9488', borderRadius: '0.5vw' }} />
            <div style={{ fontSize: '1.4vw', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>CONON</div>
          </div>
          <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
            <span>INVESTOR PRESENTATION</span>
            <span>2026</span>
          </div>
        </div>

        {/* Main hero content */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '4vw' }}>
          {/* Left: headline */}
          <div style={{ flex: '0 0 52vw' }}>
            <div style={{ fontSize: '1.1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2vh' }}>
              Series A · ₹25 Crore
            </div>
            <h1 style={{ fontSize: '6.5vw', fontWeight: 900, color: 'white', margin: '0 0 2.5vh 0', lineHeight: 1.05, letterSpacing: '-0.03em', textWrap: 'balance' }}>
              Construction.<br />Delivered in<br />60 Minutes.
            </h1>
            <p style={{ fontSize: '1.5vw', fontWeight: 400, color: 'rgba(255,255,255,0.72)', margin: '0', lineHeight: 1.6, maxWidth: '44vw' }}>
              India's first on-demand infrastructure materials platform connecting builders, contractors and homeowners to verified local suppliers.
            </p>
          </div>

          {/* Right: KPI cards */}
          <div style={{ flex: '0 0 28vw', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '1vw', padding: '2.2vh 2vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '0.5vh' }}>Pilot GMV</div>
                <div style={{ fontSize: '2.4vw', fontWeight: 800, color: 'white' }}>₹4.2 Cr</div>
              </div>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#0D9488', background: 'rgba(13,148,136,0.25)', padding: '0.4vh 0.8vw', borderRadius: '2vw' }}>3 cities</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '1vw', padding: '2.2vh 2vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '0.5vh' }}>60-min SLA</div>
                <div style={{ fontSize: '2.4vw', fontWeight: 800, color: 'white' }}>94.2%</div>
              </div>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#0D9488', background: 'rgba(13,148,136,0.25)', padding: '0.4vh 0.8vw', borderRadius: '2vw' }}>success rate</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '1vw', padding: '2.2vh 2vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85vw', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: '0.5vh' }}>NPS Score</div>
                <div style={{ fontSize: '2.4vw', fontWeight: 800, color: 'white' }}>71</div>
              </div>
              <div style={{ fontSize: '0.9vw', fontWeight: 700, color: '#0D9488', background: 'rgba(13,148,136,0.25)', padding: '0.4vh 0.8vw', borderRadius: '2vw' }}>vs 34 avg</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.5vh', fontSize: '0.9vw', color: 'rgba(255,255,255,0.45)' }}>
          <span>CONON, Inc.</span>
          <span>Confidential &amp; Proprietary · confidential@conon.in</span>
        </div>
      </div>
    </div>
  );
}

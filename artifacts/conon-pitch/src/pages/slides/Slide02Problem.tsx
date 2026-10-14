export default function Slide02Problem() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FAFBFC', fontFamily: "'Inter', sans-serif", padding: '3.5vh 4vw', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#1E3A5F' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2vh', marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ width: '2vw', height: '2vw', backgroundColor: '#0D9488', borderRadius: '0.4vw' }} />
          <div style={{ fontSize: '1.2vw', fontWeight: 700, letterSpacing: '0.02em' }}>CONON</div>
        </div>
        <div style={{ display: 'flex', gap: '2vw', fontSize: '1vw', fontWeight: 500, color: '#64748B' }}>
          <span>THE PROBLEM</span><span>2026</span>
        </div>
      </div>

      {/* Section label + title */}
      <div style={{ marginBottom: '3vh', flexShrink: 0 }}>
        <div style={{ fontSize: '1vw', fontWeight: 600, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>Market Gap</div>
        <h1 style={{ fontSize: '3.4vw', fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em' }}>The $180B Problem We're Solving</h1>
      </div>

      {/* Problem cards — 2 columns, 3 left + 2 right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2vh 2vw', flex: 1 }}>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '3vw', height: '3vw', background: 'rgba(239,68,68,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '1.2vw', height: '1.2vw', borderRadius: '50%', background: '#EF4444' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.6vh', color: '#1E3A5F' }}>Completely Undigitized Last Mile</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>India's construction sector is the 2nd largest employer, yet zero digital infrastructure exists for material procurement at the job site.</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '3vw', height: '3vw', background: 'rgba(239,68,68,0.1)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '1.2vw', height: '1.2vw', borderRadius: '50%', background: '#EF4444' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.6vh', color: '#1E3A5F' }}>Cement at 7 AM, Supplier Opens at 10</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>A contractor needs cement at 7 AM — the nearest supplier opens at 10 AM, 12 km away, and accepts only cash. Work stops.</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '3vw', height: '3vw', background: 'rgba(245,158,11,0.12)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.4vw', fontWeight: 900, color: '#D97706' }}>63%</div>
          </div>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.6vh', color: '#1E3A5F' }}>Project Delays From Material Gaps</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>63% of project delays in India are caused by material unavailability or last-mile logistics failures — not labour, not design.</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '2.5vh 2.5vw', borderRadius: '1vw', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(30,58,95,0.05)', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: '3vw', height: '3vw', background: 'rgba(245,158,11,0.12)', borderRadius: '0.6vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.1vw', fontWeight: 900, color: '#D97706' }}>₹2.4L<br />Cr</div>
          </div>
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, marginBottom: '0.6vh', color: '#1E3A5F' }}>Informal Procurement With Zero Transparency</div>
            <div style={{ fontSize: '1vw', color: '#64748B', lineHeight: 1.5 }}>₹2.4 lakh crore in materials procured informally each year — no invoices, no price transparency, no reliability.</div>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: '2.2vh 2.5vw', borderRadius: '1vw', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '2vw' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: '3vw', fontWeight: 900, color: '#92400E' }}>18–35%</div>
          </div>
          <div style={{ width: '1px', height: '5vh', background: '#FCD34D' }} />
          <div>
            <div style={{ fontSize: '1.1vw', fontWeight: 700, color: '#92400E', marginBottom: '0.4vh' }}>Builders overpay every single time</div>
            <div style={{ fontSize: '1vw', color: '#78350F', lineHeight: 1.5 }}>Builders overpay by 18–35% buying through middlemen with zero market visibility. There is no Blinkit, no Amazon for infrastructure materials.</div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.5vh', marginTop: '2vh', fontSize: '0.9vw', color: '#94A3B8', fontWeight: 500, flexShrink: 0 }}>
        <span>CONON, Inc.</span>
        <div style={{ display: 'flex', gap: '1vw' }}><span>Confidential &amp; Proprietary</span><span>·</span><span>Slide 2 of 16</span></div>
      </div>
    </div>
  );
}

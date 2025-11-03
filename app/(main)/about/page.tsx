'use client'
import { useEffect } from 'react'
import { InteractiveFeatures } from '@/components/about/InteractiveFeatures'

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="bg-black text-white">
      {/* Hero */}
      <div className="section">
        <div className="content center-text">
          <div className="title-large">[forefront]</div>
          <div className="subtitle">student-led ai education network</div>
        </div>
      </div>

      {/* The Moment */}
      <div className="section white">
        <div className="content">
          <div className="section-label">the moment</div>
          <div className="title-medium" style={{ marginBottom: '30px' }}>
            AI is evolving faster than anyone can keep up—except students
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            lineHeight: 1.7,
            color: '#666',
            maxWidth: '800px',
            marginBottom: '24px'
          }}>
            We're living through a unique window in history. AI tools are dropping every week. Use cases
            are being discovered in real-time. Traditional education can't move fast enough. Experts are
            still catching up.
          </p>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            lineHeight: 1.7,
            color: '#666',
            maxWidth: '800px'
          }}>
            But students? We're already in the trenches—experimenting, breaking things, finding what works.
            We're building our careers while these tools are being built. That makes us uniquely positioned
            to master them.
          </p>
        </div>
      </div>

      {/* Our Mission */}
      <div className="section">
        <div className="content">
          <div className="section-label">our mission</div>
          <div className="title-medium" style={{ marginBottom: '30px' }}>
            Spread the sauce. No gatekeeping.
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            lineHeight: 1.7,
            color: '#ccc',
            maxWidth: '800px'
          }}>
            We believe AI knowledge should flow freely between students. If you figure out a killer
            workflow, a game-changing prompt technique, or a creative application—share it. Teach it.
            Build on what others discover. That's how we all stay on the forefront together.
          </p>
        </div>
      </div>

      {/* What We Do */}
      <div className="section white">
        <div className="content">
          <div className="section-label">what we do</div>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: '#999',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            click each card to explore
          </p>
          <InteractiveFeatures />
        </div>
      </div>

      {/* Who This Is For */}
      <div className="section">
        <div className="content">
          <div className="section-label">who this is for</div>
          <div className="title-medium" style={{ marginBottom: '40px' }}>
            Anyone serious about using AI, not just learning about it
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {[
              { title: 'marketers', desc: 'Launch campaigns 10x faster with AI workflows' },
              { title: 'creators', desc: 'Turn ideas into content in minutes, not days' },
              { title: 'developers', desc: 'Ship features faster with AI-assisted coding' },
              { title: 'musicians', desc: 'Explore new creative possibilities in production' },
              { title: 'entrepreneurs', desc: 'Build and validate ideas at AI speed' },
              { title: 'anyone curious', desc: 'No technical background required—just bring curiosity' }
            ].map((item, i) => (
              <div key={i} className="card-dark" style={{ padding: '28px' }}>
                <div style={{
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px'
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', color: '#999', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="section white">
        <div className="content">
          <div className="section-label">how it works</div>
          <div className="title-medium" style={{ marginBottom: '40px' }}>
            Students teaching students
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {[
              { title: 'Learn From Your Peers', desc: 'Students create modules based on real AI workflows they\'ve discovered and tested. Relatable, practical, no academic fluff.' },
              { title: 'Share What You Know', desc: 'Found something that works? Submit a course. Your discovery becomes a learning module for the entire network.' },
              { title: 'Stay Current', desc: 'New AI tools every week. New modules every week. We move at the speed of AI innovation, not academic cycles.' },
              { title: 'Build While Learning', desc: 'Every module is hands-on. You learn by doing, by building, by shipping—not by memorizing theory.' },
              { title: 'No Gatekeeping', desc: 'All knowledge is open and shared. No paywalls on essential AI skills. If you learn it, you can teach it.' }
            ].map((item, i) => (
              <div key={i} style={{
                borderLeft: '3px solid #000',
                paddingLeft: '28px',
                paddingTop: '4px',
                paddingBottom: '4px'
              }}>
                <div style={{
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px'
                }}>
                  {item.title}
                </div>
                <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#666', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The Window */}
      <div className="section">
        <div className="content center-text">
          <div className="title-medium" style={{ marginBottom: '30px' }}>
            This window won't stay open forever
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            lineHeight: 1.7,
            color: '#ccc',
            maxWidth: '800px',
            margin: '0 auto 40px auto'
          }}>
            Right now, students have a unique advantage. We're young enough to adapt quickly, curious
            enough to experiment constantly, and positioned perfectly at the intersection of learning
            and building our careers.
          </p>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            lineHeight: 1.7,
            color: '#ccc',
            maxWidth: '800px',
            margin: '0 auto 40px auto'
          }}>
            But this advantage is temporary. The longer we wait, the more we fall behind. The longer
            we gatekeep knowledge, the slower we all move.
          </p>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 26px)',
            lineHeight: 1.7,
            color: '#fff',
            maxWidth: '800px',
            margin: '0 auto',
            fontWeight: 600
          }}>
            That's why we're here. To stay on the forefront, together.
          </p>
        </div>
      </div>

      {/* Pilot Network */}
      <div className="section white">
        <div className="content center-text">
          <div className="section-label">where we started</div>
          <div className="title-medium" style={{ marginBottom: '30px' }}>
            University of San Diego
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 22px)',
            color: '#666',
            maxWidth: '700px',
            margin: '0 auto 40px auto',
            lineHeight: 1.7
          }}>
            Forefront started as a pilot network at the University of San Diego. What began as
            a small group of students sharing AI workflows has grown into a movement of peer-to-peer
            learning and knowledge sharing.
          </p>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#999',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            The vision: expand to universities nationwide. Every campus becomes a node in the network.
            Students teaching students. Knowledge flowing freely. Everyone staying on the forefront.
          </p>
        </div>
      </div>

      {/* Get Involved */}
      <div className="section">
        <div className="content center-text">
          <div className="section-label">get involved</div>
          <div className="title-medium" style={{ marginBottom: '40px' }}>
            Ready to join the forefront?
          </div>

          <div style={{
            display: 'grid',
            gap: '16px',
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: '#ccc',
            textAlign: 'left',
            maxWidth: '700px',
            margin: '0 auto 50px auto'
          }}>
            <div>→ Learn from student-created modules on cutting-edge AI tools</div>
            <div>→ Share your own AI discoveries by submitting a course</div>
            <div>→ Connect with other students figuring this out in real-time</div>
            <div>→ Stay updated on the latest AI breakthroughs and applications</div>
            <div>→ Build the future while learning how to use the tools shaping it</div>
          </div>

          <a href="/#modules" className="btn btn-primary">
            start learning now
          </a>
        </div>
      </div>

      {/* Contact */}
      <div className="section white">
        <div className="content center-text">
          <div className="section-label">contact us</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginTop: '40px',
            fontSize: 'clamp(14px, 2vw, 16px)'
          }}>
            <div>
              <div style={{ marginBottom: '8px', color: '#999' }}>Email</div>
              <div style={{ fontWeight: 700 }}>hello@forefront.network</div>
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#999' }}>Instagram</div>
              <div style={{ fontWeight: 700 }}>@forefront.network</div>
            </div>
            <div>
              <div style={{ marginBottom: '8px', color: '#999' }}>LinkedIn</div>
              <div style={{ fontWeight: 700 }}>Forefront Network</div>
            </div>
          </div>

          <div style={{
            marginTop: '80px',
            fontSize: 'clamp(14px, 2.5vw, 20px)',
            color: '#999',
            fontStyle: 'italic',
            letterSpacing: '1px'
          }}>
            spread the sauce. no gatekeeping.
          </div>
        </div>
      </div>
    </main>
  )
}

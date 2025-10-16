'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const features = [
  {
    title: 'Learn From Peers',
    description: 'Your instructors? Students who just learned this last month. They remember exactly where you\'re stuck because they were just there. No corporate jargon, just real talk.',
    image: '/forefront1.jpg'
  },
  {
    title: 'Move Fast',
    description: 'AI waits for no one. Our modules are bite-sized (10-30 min) so you can learn during lunch, between classes, or on your commute. Stack skills, not excuses.',
    image: '/forefront2.jpg'
  },
  {
    title: 'Join The Movement',
    description: 'Over 1,250 students worldwide are racing ahead. Connect, collaborate, and learn together. This isn\'t just a course platform—it\'s a community preparing for the AI era.',
    image: '/forefront3.jpg'
  }
]

export function InteractiveValueProps() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set z-index for images using data-index attribute
    document.querySelectorAll('.arch__right .img-wrapper').forEach((element) => {
      const order = element.getAttribute('data-index')
      if (order !== null) {
        ;(element as HTMLElement).style.zIndex = order
      }
    })

    // Mobile layout handler (interleave items using CSS order)
    function handleMobileLayout() {
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      const leftItems = gsap.utils.toArray('.arch__left .arch__info') as HTMLElement[]
      const rightItems = gsap.utils.toArray('.arch__right .img-wrapper') as HTMLElement[]

      if (isMobile) {
        // Interleave items using order property
        leftItems.forEach((item, i) => {
          item.style.order = String(i * 2)
        })
        rightItems.forEach((item, i) => {
          item.style.order = String(i * 2 + 1)
        })
      } else {
        // Clear order for desktop
        leftItems.forEach((item) => {
          item.style.order = ''
        })
        rightItems.forEach((item) => {
          item.style.order = ''
        })
      }
    }

    // Debounce resize for performance
    let resizeTimeout: NodeJS.Timeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleMobileLayout, 100)
    })

    // Run on initial load
    handleMobileLayout()

    const imgs = gsap.utils.toArray('.img-wrapper img') as HTMLElement[]

    // GSAP Animation with Media Query
    ScrollTrigger.matchMedia({
      '(min-width: 769px)': function() {
        const mainTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: '.arch',
            start: 'top top',
            end: 'bottom bottom',
            pin: '.arch__right',
            scrub: true
          }
        })

        gsap.set(imgs, {
          clipPath: 'inset(0)',
          objectPosition: '0px 0%'
        })

        imgs.forEach((_, index) => {
          const currentImage = imgs[index]
          const nextImage = imgs[index + 1] ? imgs[index + 1] : null

          const sectionTimeline = gsap.timeline()

          if (nextImage) {
            sectionTimeline
              .to(currentImage, {
                clipPath: 'inset(0px 0px 100%)',
                objectPosition: '0px 60%',
                duration: 1.5,
                ease: 'none'
              }, 0)
              .to(nextImage, {
                objectPosition: '0px 40%',
                duration: 1.5,
                ease: 'none'
              }, 0)
          }

          mainTimeline.add(sectionTimeline)
        })
      },
      '(max-width: 768px)': function() {
        const mbTimeline = gsap.timeline()
        gsap.set(imgs, {
          objectPosition: '0px 60%'
        })

        imgs.forEach((image, index) => {
          const innerTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: image,
              start: 'top-=70% top+=50%',
              end: 'bottom+=200% bottom',
              scrub: true
            }
          })

          innerTimeline
            .to(image, {
              objectPosition: '0px 30%',
              duration: 5,
              ease: 'none'
            })

          mbTimeline.add(innerTimeline)
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      <div className="spacer" style={{ width: '100%', height: '30vh' }}></div>

      <div className="container" style={{ maxWidth: '1440px', padding: '2rem', margin: '0 auto' }}>
        <div ref={containerRef} className="arch" style={{
          display: 'flex',
          gap: '60px',
          justifyContent: 'space-between',
          maxWidth: '1100px',
          marginInline: 'auto'
        }}>
          {/* Left side - text sections */}
          <div className="arch__left" style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '300px'
          }}>
            {/* Title section */}
            <div className="arch__info" style={{
              maxWidth: '356px',
              height: '100vh',
              display: 'grid',
              placeItems: 'center'
            }}>
              <div className="content">
                <h2 style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  letterSpacing: '-0.84px',
                  textTransform: 'uppercase'
                }}>
                  Why Forefront?
                </h2>
              </div>
            </div>

            {/* Feature sections */}
            {features.map((feature, index) => (
              <div
                key={index}
                className="arch__info"
                style={{
                  maxWidth: '356px',
                  height: '100vh',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <div className="content">
                  <h2 className="header" style={{
                    fontSize: '42px',
                    fontWeight: 800,
                    letterSpacing: '-0.84px',
                    textTransform: 'uppercase'
                  }}>
                    {feature.title}
                  </h2>
                  <p className="desc" style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '18px',
                    letterSpacing: '-0.54px',
                    marginBlock: '6px 28px',
                    lineHeight: 'normal'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - pinned images */}
          <div
            ref={rightRef}
            className="arch__right"
            style={{
              flexShrink: 1,
              height: '100vh',
              width: '100%',
              maxWidth: '540px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="img-wrapper"
                data-index={features.length - index}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  transform: 'translateY(-50%)',
                  height: '400px',
                  width: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="spacer" style={{ width: '100%', height: '10vh' }}></div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 900px) {
          .arch {
            gap: 30px !important;
          }
        }

        @media (max-width: 768px) {
          .arch {
            flex-direction: column !important;
            gap: 20px !important;
          }

          .arch__left,
          .arch__right {
            display: contents !important;
          }

          .arch__right {
            height: auto !important;
            max-width: 100% !important;
          }

          .arch__right .img-wrapper {
            position: static !important;
            transform: none !important;
            height: 360px !important;
            width: 100% !important;
            margin-bottom: 20px !important;
          }

          .arch__left .arch__info {
            height: auto !important;
            padding: 20px 0 !important;
          }
        }

        @media (max-width: 560px) {
          .arch {
            gap: 12px !important;
          }

          .container {
            padding: 10px !important;
          }

          .arch__right .img-wrapper {
            border-radius: 10px !important;
            height: 280px !important;
          }
        }
      `}</style>
    </>
  )
}
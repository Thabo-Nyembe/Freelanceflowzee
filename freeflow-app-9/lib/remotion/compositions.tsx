/**
 * Remotion Video Compositions
 *
 * Reusable video compositions for programmatic video generation
 */

import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  Easing,
} from 'remotion'

// ============================================================================
// Types
// ============================================================================

export interface TextSlideProps {
  title: string
  subtitle?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  animation?: 'fade' | 'slide' | 'scale' | 'typewriter'
}

export interface ImageSlideProps {
  src: string
  title?: string
  animation?: 'fade' | 'zoom' | 'pan' | 'kenBurns'
  overlayColor?: string
  overlayOpacity?: number
}

export interface VideoClipProps {
  src: string
  startFrom?: number
  endAt?: number
  volume?: number
  playbackRate?: number
}

export interface LogoRevealProps {
  logoSrc: string
  backgroundColor?: string
  animation?: 'fade' | 'scale' | 'rotate' | 'glitch'
}

export interface SocialProofProps {
  testimonial: string
  author: string
  authorTitle?: string
  avatarSrc?: string
  backgroundColor?: string
}

export interface CallToActionProps {
  headline: string
  subheadline?: string
  buttonText: string
  backgroundColor?: string
  accentColor?: string
}

export interface ProductShowcaseProps {
  productImage: string
  productName: string
  features: string[]
  price?: string
  backgroundColor?: string
}

export interface CountdownProps {
  targetDate: string
  title?: string
  backgroundColor?: string
}

export interface ProgressBarProps {
  progress: number
  label?: string
  color?: string
  backgroundColor?: string
}

export interface ParticleBackgroundProps {
  particleCount?: number
  particleColor?: string
  backgroundColor?: string
  children?: React.ReactNode
}

export interface GradientBackgroundProps {
  colors: string[]
  angle?: number
  animated?: boolean
  children?: React.ReactNode
}

// ============================================================================
// Utility Components
// ============================================================================

/**
 * Animated text with various effects
 */
export const AnimatedText: React.FC<{
  text: string
  animation: 'fade' | 'slide' | 'scale' | 'typewriter'
  delay?: number
  style?: React.CSSProperties
}> = ({ text, animation, delay = 0, style }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const delayedFrame = Math.max(0, frame - delay)

  let animationStyle: React.CSSProperties = {}

  switch (animation) {
    case 'fade':
      animationStyle = {
        opacity: interpolate(delayedFrame, [0, fps * 0.5], [0, 1], {
          extrapolateRight: 'clamp',
        }),
      }
      break
    case 'slide':
      animationStyle = {
        transform: `translateY(${interpolate(
          delayedFrame,
          [0, fps * 0.5],
          [50, 0],
          { extrapolateRight: 'clamp' }
        )}px)`,
        opacity: interpolate(delayedFrame, [0, fps * 0.3], [0, 1], {
          extrapolateRight: 'clamp',
        }),
      }
      break
    case 'scale':
      const scaleValue = spring({
        frame: delayedFrame,
        fps,
        config: { damping: 10, stiffness: 100 },
      })
      animationStyle = {
        transform: `scale(${scaleValue})`,
        opacity: interpolate(delayedFrame, [0, fps * 0.2], [0, 1], {
          extrapolateRight: 'clamp',
        }),
      }
      break
    case 'typewriter':
      const charsToShow = Math.floor(
        interpolate(delayedFrame, [0, fps * 2], [0, text.length], {
          extrapolateRight: 'clamp',
        })
      )
      return (
        <span style={style}>
          {text.substring(0, charsToShow)}
          {charsToShow < text.length && (
            <span style={{ opacity: frame % 30 < 15 ? 1 : 0 }}>|</span>
          )}
        </span>
      )
  }

  return <span style={{ ...style, ...animationStyle }}>{text}</span>
}

/**
 * Gradient background with optional animation
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors,
  angle = 45,
  animated = false,
  children,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const currentAngle = animated
    ? angle + interpolate(frame, [0, fps * 10], [0, 360], {
        extrapolateRight: 'extend',
      })
    : angle

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${currentAngle}deg, ${colors.join(', ')})`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

/**
 * Particle background effect
 */
export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 50,
  particleColor = 'rgba(255,255,255,0.5)',
  backgroundColor = '#000',
  children,
}) => {
  const frame = useCurrentFrame()
  const { width, height, fps } = useVideoConfig()

  // Generate stable particles based on index
  const particles = React.useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      x: (i * 137.5) % width,
      y: (i * 73.7) % height,
      size: 2 + (i % 5),
      speed: 0.5 + (i % 10) * 0.1,
      opacity: 0.3 + (i % 7) * 0.1,
    }))
  }, [particleCount, width, height])

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {particles.map((particle, i) => {
        const y = (particle.y + frame * particle.speed) % height
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: particle.x,
              top: y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: particleColor,
              opacity: particle.opacity,
            }}
          />
        )
      })}
      {children}
    </AbsoluteFill>
  )
}

// ============================================================================
// Main Compositions
// ============================================================================

/**
 * Text slide with customizable animations
 */
export const TextSlide: React.FC<TextSlideProps> = ({
  title,
  subtitle,
  backgroundColor = '#1a1a2e',
  textColor = '#ffffff',
  fontFamily = 'Inter, system-ui, sans-serif',
  animation = 'fade',
}) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
      }}
    >
      <AnimatedText
        text={title}
        animation={animation}
        style={{
          color: textColor,
          fontFamily,
          fontSize: 72,
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      />
      {subtitle && (
        <AnimatedText
          text={subtitle}
          animation={animation}
          delay={fps * 0.3}
          style={{
            color: textColor,
            fontFamily,
            fontSize: 36,
            fontWeight: 400,
            textAlign: 'center',
            marginTop: 24,
            opacity: 0.8,
          }}
        />
      )}
    </AbsoluteFill>
  )
}

/**
 * Image slide with Ken Burns and other effects
 */
export const ImageSlide: React.FC<ImageSlideProps> = ({
  src,
  title,
  animation = 'kenBurns',
  overlayColor = 'rgba(0,0,0,0.3)',
  overlayOpacity = 1,
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames, width, height } = useVideoConfig()

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }

  switch (animation) {
    case 'fade':
      imageStyle.opacity = interpolate(
        frame,
        [0, fps * 0.5, durationInFrames - fps * 0.5, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
      break
    case 'zoom':
      const zoomScale = interpolate(frame, [0, durationInFrames], [1, 1.3], {
        extrapolateRight: 'clamp',
      })
      imageStyle.transform = `scale(${zoomScale})`
      break
    case 'pan':
      const panX = interpolate(frame, [0, durationInFrames], [-10, 10], {
        extrapolateRight: 'clamp',
      })
      imageStyle.transform = `translateX(${panX}%) scale(1.2)`
      break
    case 'kenBurns':
      const kbScale = interpolate(frame, [0, durationInFrames], [1, 1.2])
      const kbX = interpolate(frame, [0, durationInFrames], [0, -5])
      const kbY = interpolate(frame, [0, durationInFrames], [0, -5])
      imageStyle.transform = `scale(${kbScale}) translate(${kbX}%, ${kbY}%)`
      break
  }

  return (
    <AbsoluteFill>
      <Img src={src} style={imageStyle} />
      <AbsoluteFill
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />
      {title && (
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            padding: 60,
          }}
        >
          <AnimatedText
            text={title}
            animation="slide"
            delay={fps * 0.5}
            style={{
              color: '#fff',
              fontSize: 48,
              fontWeight: 600,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}

/**
 * Logo reveal animation
 */
export const LogoReveal: React.FC<LogoRevealProps> = ({
  logoSrc,
  backgroundColor = '#000',
  animation = 'scale',
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const progress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  })

  const logoStyle: React.CSSProperties = {
    maxWidth: '60%',
    maxHeight: '60%',
  }

  switch (animation) {
    case 'fade':
      logoStyle.opacity = interpolate(frame, [0, fps], [0, 1], {
        extrapolateRight: 'clamp',
      })
      break
    case 'scale':
      logoStyle.transform = `scale(${progress})`
      logoStyle.opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
        extrapolateRight: 'clamp',
      })
      break
    case 'rotate':
      logoStyle.transform = `rotate(${interpolate(
        progress,
        [0, 1],
        [-180, 0]
      )}deg) scale(${progress})`
      logoStyle.opacity = progress
      break
    case 'glitch':
      const glitchOffset = frame % 10 < 2 ? Math.random() * 10 - 5 : 0
      logoStyle.transform = `translateX(${glitchOffset}px)`
      logoStyle.opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
        extrapolateRight: 'clamp',
      })
      break
  }

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  logoStyle.opacity = (logoStyle.opacity as number || 1) * fadeOut

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Img src={logoSrc} style={logoStyle} />
    </AbsoluteFill>
  )
}

/**
 * Social proof / testimonial slide
 */
export const SocialProof: React.FC<SocialProofProps> = ({
  testimonial,
  author,
  authorTitle,
  avatarSrc,
  backgroundColor = '#f8f9fa',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const quoteOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const authorOpacity = interpolate(frame, [fps * 0.5, fps], [0, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 100,
      }}
    >
      {/* Quote mark */}
      <div
        style={{
          fontSize: 120,
          color: 'rgba(0,0,0,0.1)',
          fontFamily: 'Georgia, serif',
          position: 'absolute',
          top: 80,
          left: 100,
          opacity: quoteOpacity,
        }}
      >
        "
      </div>

      {/* Testimonial */}
      <p
        style={{
          fontSize: 36,
          color: '#333',
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: 1.6,
          maxWidth: 900,
          opacity: quoteOpacity,
        }}
      >
        {testimonial}
      </p>

      {/* Author */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 48,
          opacity: authorOpacity,
        }}
      >
        {avatarSrc && (
          <Img
            src={avatarSrc}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              marginRight: 16,
              objectFit: 'cover',
            }}
          />
        )}
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#333' }}>
            {author}
          </div>
          {authorTitle && (
            <div style={{ fontSize: 18, color: '#666' }}>{authorTitle}</div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}

/**
 * Call to action slide
 */
export const CallToAction: React.FC<CallToActionProps> = ({
  headline,
  subheadline,
  buttonText,
  backgroundColor = '#6366f1',
  accentColor = '#fff',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headlineY = interpolate(frame, [0, fps * 0.5], [30, 0], {
    extrapolateRight: 'clamp',
  })

  const buttonScale = spring({
    frame: frame - fps * 0.8,
    fps,
    config: { damping: 8, stiffness: 100 },
  })

  const buttonPulse =
    1 +
    Math.sin(((frame - fps * 1.5) / fps) * Math.PI * 2) * 0.03 *
      (frame > fps * 1.5 ? 1 : 0)

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
      }}
    >
      <h1
        style={{
          color: accentColor,
          fontSize: 64,
          fontWeight: 700,
          textAlign: 'center',
          transform: `translateY(${headlineY}px)`,
          opacity: interpolate(frame, [0, fps * 0.3], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {headline}
      </h1>

      {subheadline && (
        <p
          style={{
            color: accentColor,
            fontSize: 28,
            textAlign: 'center',
            marginTop: 16,
            opacity: interpolate(frame, [fps * 0.3, fps * 0.6], [0, 0.8], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {subheadline}
        </p>
      )}

      <div
        style={{
          marginTop: 48,
          padding: '20px 48px',
          backgroundColor: accentColor,
          color: backgroundColor,
          fontSize: 24,
          fontWeight: 600,
          borderRadius: 12,
          transform: `scale(${Math.max(0, buttonScale) * buttonPulse})`,
        }}
      >
        {buttonText}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Product showcase slide
 */
export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  productImage,
  productName,
  features,
  price,
  backgroundColor = '#fff',
}) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()

  const imageX = interpolate(frame, [0, fps * 0.8], [-200, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'row',
        padding: 80,
      }}
    >
      {/* Product image */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateX(${imageX}px)`,
          opacity: interpolate(frame, [0, fps * 0.5], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Img
          src={productImage}
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Product info */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 40,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#333',
            marginBottom: 24,
            opacity: interpolate(frame, [fps * 0.3, fps * 0.6], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {productName}
        </h2>

        {features.map((feature, i) => {
          const featureDelay = fps * 0.5 + i * fps * 0.2
          const opacity = interpolate(
            frame,
            [featureDelay, featureDelay + fps * 0.3],
            [0, 1],
            { extrapolateRight: 'clamp' }
          )
          const x = interpolate(
            frame,
            [featureDelay, featureDelay + fps * 0.3],
            [20, 0],
            { extrapolateRight: 'clamp' }
          )

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 16,
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  marginRight: 12,
                }}
              />
              <span style={{ fontSize: 24, color: '#555' }}>{feature}</span>
            </div>
          )
        })}

        {price && (
          <div
            style={{
              marginTop: 32,
              fontSize: 36,
              fontWeight: 700,
              color: '#6366f1',
              opacity: interpolate(
                frame,
                [fps * 1.5, fps * 1.8],
                [0, 1],
                { extrapolateRight: 'clamp' }
              ),
            }}
          >
            {price}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Countdown timer
 */
export const Countdown: React.FC<CountdownProps> = ({
  targetDate,
  title = 'Coming Soon',
  backgroundColor = '#1a1a2e',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Calculate time remaining (simulated for video)
  const target = new Date(targetDate).getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ]

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AnimatedText
        text={title}
        animation="fade"
        style={{
          color: '#fff',
          fontSize: 48,
          fontWeight: 600,
          marginBottom: 48,
        }}
      />

      <div style={{ display: 'flex', gap: 24 }}>
        {units.map((unit, i) => {
          const delay = i * fps * 0.15
          const scale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, stiffness: 100 },
          })

          return (
            <div
              key={unit.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `scale(${Math.max(0, scale)})`,
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '24px 32px',
                  minWidth: 120,
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontSize: 56,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 16,
                  marginTop: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                }}
              >
                {unit.label}
              </span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Animated progress bar
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  color = '#6366f1',
  backgroundColor = '#f1f5f9',
}) => {
  const frame = useCurrentFrame()
  const { fps, width } = useVideoConfig()

  const animatedProgress = interpolate(frame, [0, fps * 1.5], [0, progress], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 80,
      }}
    >
      {label && (
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: '#333',
            marginBottom: 24,
            opacity: interpolate(frame, [0, fps * 0.3], [0, 1], {
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {label}
        </div>
      )}

      <div
        style={{
          width: '80%',
          height: 24,
          backgroundColor,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${animatedProgress}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 12,
          }}
        />
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color,
          marginTop: 24,
        }}
      >
        {Math.round(animatedProgress)}%
      </div>
    </AbsoluteFill>
  )
}

// ============================================================================
// Full Video Compositions
// ============================================================================

export interface IntroOutroVideoProps {
  logoSrc: string
  title: string
  subtitle?: string
  backgroundColor?: string
  accentColor?: string
}

/**
 * Complete intro/outro video composition
 */
export const IntroOutroVideo: React.FC<IntroOutroVideoProps> = ({
  logoSrc,
  title,
  subtitle,
  backgroundColor = '#1a1a2e',
  accentColor = '#6366f1',
}) => {
  const { fps, durationInFrames } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Logo reveal - first 2 seconds */}
      <Sequence from={0} durationInFrames={fps * 2}>
        <LogoReveal
          logoSrc={logoSrc}
          backgroundColor={backgroundColor}
          animation="scale"
        />
      </Sequence>

      {/* Title slide - next 3 seconds */}
      <Sequence from={fps * 2} durationInFrames={fps * 3}>
        <TextSlide
          title={title}
          subtitle={subtitle}
          backgroundColor={backgroundColor}
          animation="slide"
        />
      </Sequence>
    </AbsoluteFill>
  )
}

export interface SlideshowVideoProps {
  slides: Array<{
    type: 'text' | 'image'
    content: TextSlideProps | ImageSlideProps
    duration: number
  }>
  transitionDuration?: number
}

/**
 * Slideshow video composition
 */
export const SlideshowVideo: React.FC<SlideshowVideoProps> = ({
  slides,
  transitionDuration = 0.5,
}) => {
  const { fps } = useVideoConfig()

  let currentFrame = 0

  return (
    <AbsoluteFill>
      {slides.map((slide, index) => {
        const startFrame = currentFrame
        const slideDuration = slide.duration * fps
        currentFrame += slideDuration

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={slideDuration}
          >
            {slide.type === 'text' ? (
              <TextSlide {...(slide.content as TextSlideProps)} />
            ) : (
              <ImageSlide {...(slide.content as ImageSlideProps)} />
            )}
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}

export interface PromoVideoProps {
  logoSrc: string
  headline: string
  features: string[]
  testimonial?: {
    quote: string
    author: string
    title?: string
  }
  cta: {
    headline: string
    buttonText: string
  }
  backgroundColor?: string
  accentColor?: string
}

/**
 * Complete promotional video composition
 */
export const PromoVideo: React.FC<PromoVideoProps> = ({
  logoSrc,
  headline,
  features,
  testimonial,
  cta,
  backgroundColor = '#1a1a2e',
  accentColor = '#6366f1',
}) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Logo intro - 2 seconds */}
      <Sequence from={0} durationInFrames={fps * 2}>
        <LogoReveal
          logoSrc={logoSrc}
          backgroundColor={backgroundColor}
          animation="scale"
        />
      </Sequence>

      {/* Headline - 3 seconds */}
      <Sequence from={fps * 2} durationInFrames={fps * 3}>
        <TextSlide
          title={headline}
          backgroundColor={backgroundColor}
          animation="slide"
        />
      </Sequence>

      {/* Features - 4 seconds */}
      <Sequence from={fps * 5} durationInFrames={fps * 4}>
        <AbsoluteFill
          style={{
            backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 80,
          }}
        >
          {features.map((feature, i) => (
            <AnimatedText
              key={i}
              text={`✓ ${feature}`}
              animation="slide"
              delay={i * fps * 0.5}
              style={{
                color: '#fff',
                fontSize: 36,
                marginBottom: 24,
              }}
            />
          ))}
        </AbsoluteFill>
      </Sequence>

      {/* Testimonial - 4 seconds (if provided) */}
      {testimonial && (
        <Sequence from={fps * 9} durationInFrames={fps * 4}>
          <SocialProof
            testimonial={testimonial.quote}
            author={testimonial.author}
            authorTitle={testimonial.title}
            backgroundColor="#fff"
          />
        </Sequence>
      )}

      {/* CTA - 3 seconds */}
      <Sequence
        from={testimonial ? fps * 13 : fps * 9}
        durationInFrames={fps * 3}
      >
        <CallToAction
          headline={cta.headline}
          buttonText={cta.buttonText}
          backgroundColor={accentColor}
        />
      </Sequence>
    </AbsoluteFill>
  )
}

// Export all compositions for use
export const compositions = {
  TextSlide,
  ImageSlide,
  LogoReveal,
  SocialProof,
  CallToAction,
  ProductShowcase,
  Countdown,
  ProgressBar,
  IntroOutroVideo,
  SlideshowVideo,
  PromoVideo,
  GradientBackground,
  ParticleBackground,
  AnimatedText,
}

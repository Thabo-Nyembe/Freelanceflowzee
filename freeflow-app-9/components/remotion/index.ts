/**
 * Remotion Components
 *
 * Components for programmatic video generation
 */

export { RemotionPlayer } from './remotion-player'
export { default } from './remotion-player'

// Re-export compositions
export {
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
  compositions,
} from '@/lib/remotion/compositions'

// Re-export types
export type {
  TextSlideProps,
  ImageSlideProps,
  LogoRevealProps,
  SocialProofProps,
  CallToActionProps,
  ProductShowcaseProps,
  CountdownProps,
  ProgressBarProps,
  IntroOutroVideoProps,
  SlideshowVideoProps,
  PromoVideoProps,
  GradientBackgroundProps,
  ParticleBackgroundProps,
  VideoClipProps,
} from '@/lib/remotion/compositions'

// Re-export service
export {
  remotionService,
  renderTextSlide,
  renderLogoReveal,
  renderPromoVideo,
  renderSlideshow,
} from '@/lib/remotion/remotion-service'

export type {
  RenderJobConfig,
  RenderJob,
  RenderProgress,
  ProgressCallback,
} from '@/lib/remotion/remotion-service'

/**
 * Remotion Video Generation Library
 *
 * Programmatic video generation with Remotion
 */

// Export compositions
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
} from './compositions'

// Export types
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
} from './compositions'

// Export service
export {
  RemotionService,
  remotionService,
  renderTextSlide,
  renderLogoReveal,
  renderPromoVideo,
  renderSlideshow,
} from './remotion-service'

// Export service types
export type {
  RenderJobConfig,
  RenderJob,
  RenderProgress,
  ProgressCallback,
} from './remotion-service'

// CRM Components - Phase 7: CRM & Sales Pipeline
// Enterprise-grade CRM system for FreeFlow

// Pipeline Management
export { PipelineBoard } from './pipeline-board'
export type {
  PipelineBoardProps,
  Pipeline,
  PipelineStage,
  Deal as PipelineDeal
} from './pipeline-board'

// Deal Management
export { DealCard } from './deal-card'
export type {
  DealCardProps,
  Deal,
  DealStatus,
  DealPriority,
  DealType,
  DealStage,
  DealCompany,
  DealContact,
  DealOwner,
  DealActivity,
  DealProduct,
} from './deal-card'

// Contact Management
export { ContactProfile } from './contact-profile'
export type {
  ContactProfileProps,
  Contact,
  ContactStatus,
  LifecycleStage,
  ContactCompany,
  ContactDeal,
  ContactActivity,
  ContactTask,
  ContactEmail,
  ContactNote,
  ContactTag,
  LeadScore,
} from './contact-profile'

// Activity Timeline
export { ActivityTimeline } from './activity-timeline'
export type {
  ActivityTimelineProps,
  Activity,
  ActivityType,
  ActivityPriority,
  ActivityOutcome,
  ActivityUser,
  ActivityAssociation,
  ActivityAttachment,
  MeetingAttendee,
  CallDetails,
  EmailDetails,
  MeetingDetails,
  TaskDetails,
  DealDetails,
  ActivityGroup,
} from './activity-timeline'

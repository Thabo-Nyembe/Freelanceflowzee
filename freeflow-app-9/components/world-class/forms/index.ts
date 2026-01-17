/**
 * World-Class Form Components
 *
 * A comprehensive collection of reusable form components built on top of
 * React Hook Form and Zod validation patterns. All components integrate
 * seamlessly with shadcn/ui primitives and provide consistent styling,
 * accessibility, and validation support.
 *
 * @example
 * ```tsx
 * import { useForm } from 'react-hook-form'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * import { z } from 'zod'
 * import { Form } from '@/components/ui/form'
 * import {
 *   FormInput,
 *   FormSelect,
 *   FormTextarea,
 *   FormCheckbox,
 *   FormSwitch,
 *   FormDatePicker,
 *   FormFileUpload,
 *   inputValidationSchemas,
 * } from '@/components/world-class/forms'
 *
 * const schema = z.object({
 *   email: inputValidationSchemas.email,
 *   name: z.string().min(2),
 *   bio: z.string().max(500).optional(),
 *   newsletter: z.boolean(),
 *   notifications: z.boolean(),
 *   birthDate: z.date(),
 *   avatar: z.array(z.any()).optional(),
 * })
 *
 * function MyForm() {
 *   const form = useForm({
 *     resolver: zodResolver(schema),
 *     defaultValues: {
 *       email: '',
 *       name: '',
 *       bio: '',
 *       newsletter: false,
 *       notifications: true,
 *       birthDate: undefined,
 *       avatar: [],
 *     },
 *   })
 *
 *   return (
 *     <Form {...form}>
 *       <form onSubmit={form.handleSubmit(onSubmit)}>
 *         <FormInput name="email" label="Email" type="email" required />
 *         <FormInput name="name" label="Name" required />
 *         <FormTextarea name="bio" label="Bio" showCharacterCount maxLength={500} />
 *         <FormCheckbox name="newsletter" label="Subscribe to newsletter" />
 *         <FormSwitch name="notifications" label="Enable notifications" />
 *         <FormDatePicker name="birthDate" label="Birth Date" />
 *         <FormFileUpload name="avatar" label="Avatar" accept={{ 'image/*': [] }} />
 *         <button type="submit">Submit</button>
 *       </form>
 *     </Form>
 *   )
 * }
 * ```
 *
 * Standalone usage (without react-hook-form):
 * ```tsx
 * import { StandaloneInput, StandaloneSelect, StandaloneCheckbox } from '@/components/world-class/forms'
 *
 * function MyComponent() {
 *   const [value, setValue] = useState('')
 *   return <StandaloneInput value={value} onValueChange={setValue} />
 * }
 * ```
 */

// ============================================================================
// FORM FIELD WRAPPER
// ============================================================================
export {
  FormFieldWrapper,
  FieldWrapper,
  RequiredIndicator,
  HelpText,
  FieldError,
  FieldSuccess,
  FormSection,
  FormRow,
  FormGrid,
  type FormFieldWrapperProps,
  type FieldWrapperProps,
  type FormSectionProps,
  type FormRowProps,
  type FormGridProps,
} from './form-field'

// ============================================================================
// FORM INPUT
// ============================================================================
export {
  FormInput,
  StandaloneInput,
  inputValidationSchemas,
  type FormInputProps,
  type StandaloneInputProps,
} from './form-input'

// ============================================================================
// FORM SELECT
// ============================================================================
export {
  FormSelect,
  StandaloneSelect,
  type FormSelectProps,
  type StandaloneSelectProps,
  type SelectOption,
  type SelectGroup,
} from './form-select'

// ============================================================================
// FORM TEXTAREA
// ============================================================================
export {
  FormTextarea,
  StandaloneTextarea,
  TextDisplay,
  textareaValidationSchemas,
  type FormTextareaProps,
  type StandaloneTextareaProps,
  type TextDisplayProps,
} from './form-textarea'

// ============================================================================
// FORM CHECKBOX
// ============================================================================
export {
  FormCheckbox,
  FormCheckboxGroup,
  StandaloneCheckbox,
  TermsCheckbox,
  checkboxValidationSchemas,
  type FormCheckboxProps,
  type FormCheckboxGroupProps,
  type StandaloneCheckboxProps,
  type TermsCheckboxProps,
  type CheckboxGroupOption,
} from './form-checkbox'

// ============================================================================
// FORM SWITCH
// ============================================================================
export {
  FormSwitch,
  FormSwitchGroup,
  StandaloneSwitch,
  SettingSwitch,
  switchValidationSchemas,
  type FormSwitchProps,
  type FormSwitchGroupProps,
  type StandaloneSwitchProps,
  type SettingSwitchProps,
  type SwitchGroupOption,
} from './form-switch'

// ============================================================================
// FORM DATE PICKER
// ============================================================================
export {
  FormDatePicker,
  StandaloneDatePicker,
  dateValidationSchemas,
  type FormDatePickerProps,
  type StandaloneDatePickerProps,
  type DatePreset,
} from './form-date-picker'

// ============================================================================
// FORM FILE UPLOAD
// ============================================================================
export {
  FormFileUpload,
  StandaloneFileUpload,
  AvatarUpload,
  fileUploadValidationSchemas,
  type FormFileUploadProps,
  type StandaloneFileUploadProps,
  type AvatarUploadProps,
  type UploadedFileInfo,
} from './form-file-upload'

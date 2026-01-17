/**
 * World-Class Forms Components
 *
 * A comprehensive collection of enhanced form components with:
 * - React Hook Form integration
 * - Zod validation schemas
 * - Full TypeScript support
 * - Accessible and responsive design
 * - Standalone versions for use outside forms
 *
 * Usage with react-hook-form:
 * ```tsx
 * import { FormInput, FormSelect, FormTextarea, FormDatePicker } from '@/components/world-class/forms'
 *
 * const schema = z.object({
 *   name: z.string().min(2),
 *   category: z.string(),
 *   description: z.string().max(500),
 *   date: z.date(),
 * })
 *
 * function MyForm() {
 *   const form = useForm<z.infer<typeof schema>>({
 *     resolver: zodResolver(schema),
 *   })
 *
 *   return (
 *     <Form {...form}>
 *       <FormInput name="name" label="Name" required />
 *       <FormSelect name="category" label="Category" options={categories} searchable />
 *       <FormTextarea name="description" label="Description" showCharacterCount maxLength={500} />
 *       <FormDatePicker name="date" label="Date" showPresets />
 *     </Form>
 *   )
 * }
 * ```
 *
 * Standalone usage (without react-hook-form):
 * ```tsx
 * import { StandaloneInput, StandaloneSelect } from '@/components/world-class/forms'
 *
 * function MyComponent() {
 *   const [value, setValue] = useState('')
 *   return <StandaloneInput value={value} onValueChange={setValue} />
 * }
 * ```
 */

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

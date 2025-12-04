# Projects Hub CRUD - Quick Reference

## Key Functions Added

### 1. Edit Project Handler
```typescript
const handleEditProject = (project: Project) => {
  setSelectedProject(project)
  setEditFormData({
    name: project.title,
    description: project.description || '',
    client: project.client_name || '',
    budget: project.budget || 0,
    deadline: project.end_date || '',
    start_date: project.start_date || '',
    priority: project.priority || 'medium',
    category: project.category || 'general',
    status: /* convert UI status to DB status */
  })
  setShowEditModal(true)
}
```

### 2. Update Project Handler
```typescript
const handleUpdateProject = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validation
  if (!userId || !selectedProject) return
  if (!editFormData.name.trim()) return

  // Database Update
  const { data, error } = await updateProject(selectedProject.id, {
    name: editFormData.name,
    description: editFormData.description,
    client: editFormData.client,
    budget: editFormData.budget,
    deadline: editFormData.deadline,
    start_date: editFormData.start_date,
    priority: editFormData.priority,
    category: editFormData.category,
    status: editFormData.status,
    updated_at: new Date().toISOString()
  })

  // Update UI
  setProjects(projects.map(p =>
    p.id === selectedProject.id ? updatedUIProject : p
  ))

  // Feedback
  toast.success(`Project "${data.name}" updated!`)
  setShowEditModal(false)
}
```

### 3. Delete Project Handler
```typescript
const handleDeleteProject = (project: Project) => {
  setSelectedProject(project)
  setShowDeleteDialog(true)
}

const handleConfirmDelete = async () => {
  // Validation
  if (!userId || !selectedProject) return

  // Database Delete
  const { success, error } = await deleteProject(selectedProject.id)

  // Update UI
  setProjects(projects.filter(p => p.id !== selectedProject.id))

  // Feedback
  toast.success(`Project "${selectedProject.title}" deleted`)
  setShowDeleteDialog(false)
}
```

## Modal Components

### Edit Modal Structure
```typescript
{showEditModal && (
  <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Project</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleUpdateProject}>
        {/* Form fields */}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button type="submit">Update Project</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)}
```

### Delete Confirmation Structure
```typescript
{showDeleteDialog && (
  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogDescription>
          Are you sure? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <ul className="list-disc list-inside">
          <li>Project details and settings</li>
          <li>All associated tasks and milestones</li>
          <li>Project files and attachments</li>
          <li>Activity history and comments</li>
        </ul>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleConfirmDelete}>
          Delete Project
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

## State Variables

```typescript
// Modal visibility
const [showEditModal, setShowEditModal] = useState(false)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)

// Form data
const [editFormData, setEditFormData] = useState({
  name: '',
  description: '',
  client: '',
  budget: 0,
  deadline: '',
  start_date: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  category: 'general',
  status: 'Not Started' as 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'
})
```

## ProjectCard Updates

```typescript
// Updated interface
interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void  // NEW
  onUpdateStatus: (id: string, status: string) => void
}

// Delete button in card
<Button
  variant="outline"
  size="sm"
  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
  onClick={() => onDelete(project)}
  data-testid="delete-project-btn"
>
  <Trash2 className="h-3 w-3" />
  Delete
</Button>
```

## Database Operations

```typescript
// Import functions
import {
  updateProject,
  deleteProject
} from '@/lib/projects-hub-queries'

// Update project
const { data, error } = await updateProject(projectId, updates)

// Delete project
const { success, error } = await deleteProject(projectId)
```

## Error Handling Pattern

```typescript
try {
  logger.info('Operation starting', { projectId, userId })

  const { data, error } = await databaseOperation()

  if (error || !data) {
    logger.error('Operation failed', { error, projectId })
    toast.error('Operation failed', { description: error?.message })
    return
  }

  // Update UI state
  setProjects(/* updated state */)

  toast.success('Operation successful!')
  logger.info('Operation completed', { projectId })
  announce('Operation successful', 'polite')

} catch (err) {
  logger.error('Unexpected error', { error: err, projectId })
  toast.error('Unexpected error occurred')
  announce('Error occurred', 'assertive')
}
```

## Form Field Examples

```typescript
// Text Input
<Input
  id="edit-name"
  value={editFormData.name}
  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
  required
/>

// Textarea
<Textarea
  id="edit-description"
  value={editFormData.description}
  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
  rows={3}
/>

// Number Input
<Input
  id="edit-budget"
  type="number"
  min="0"
  step="100"
  value={editFormData.budget}
  onChange={(e) => setEditFormData(prev => ({
    ...prev,
    budget: parseFloat(e.target.value) || 0
  }))}
/>

// Date Input
<Input
  id="edit-deadline"
  type="date"
  value={editFormData.deadline ? new Date(editFormData.deadline).toISOString().split('T')[0] : ''}
  onChange={(e) => setEditFormData(prev => ({ ...prev, deadline: e.target.value }))}
/>

// Select Dropdown
<Select
  value={editFormData.priority}
  onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, priority: value }))}
>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="low">Low</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="urgent">Urgent</SelectItem>
  </SelectContent>
</Select>
```

## Testing

```typescript
// Test IDs for E2E tests
data-testid="edit-project-btn"
data-testid="delete-project-btn"

// Example Playwright test
test('should edit project', async ({ page }) => {
  await page.click('[data-testid="edit-project-btn"]')
  await page.fill('#edit-name', 'Updated Project Name')
  await page.click('button[type="submit"]')
  await expect(page.getByText('Project "Updated Project Name" updated!')).toBeVisible()
})
```

## Checklist for Similar Features

- [ ] Add modal state variables
- [ ] Create form data state
- [ ] Implement handler functions with validation
- [ ] Add database operations with error handling
- [ ] Update UI state optimistically
- [ ] Add modal JSX components
- [ ] Include accessibility announcements
- [ ] Add comprehensive logging
- [ ] Test all error scenarios
- [ ] Verify TypeScript types
- [ ] Test with real database

---

**Status:** ✅ Implementation Complete
**File:** `/app/(app)/dashboard/projects-hub/page.tsx`
**Lines:** 1,117 total

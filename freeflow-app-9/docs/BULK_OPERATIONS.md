# Bulk Video Operations

This document outlines the bulk video operations feature in the FreeFlow application.

## Overview

The bulk operations system allows users to perform actions on multiple videos simultaneously, improving workflow efficiency when managing large collections of videos.

## Features

- **Supported Operations**:
  - Delete multiple videos
  - Move videos to different projects
  - Add tags to videos
  - Update privacy settings
  - Update video status

- **Real-time Progress Tracking**:
  - Progress bar showing completion status
  - Success/failure counts
  - Error reporting for failed operations

## Technical Implementation

### Database Schema

The feature uses a `bulk_operations` table with the following structure:
- `id`: Unique identifier
- `user_id`: Reference to the user performing the operation
- `operation_type`: Type of bulk operation
- `status`: Current operation status
- `video_ids`: Array of video IDs to process
- `parameters`: JSON object containing operation-specific parameters
- `error_message`: Details of any errors encountered
- `created_at`, `updated_at`, `completed_at`: Timestamps
- `total_items`, `processed_items`, `failed_items`: Progress tracking

### Components

1. **BulkOperations Component**:
   - Operation type selection
   - Progress tracking
   - Real-time status updates
   - Error handling and display

2. **useBulkOperations Hook**:
   - Operation creation and management
   - Real-time subscription to updates
   - Error handling

### Security

- Row Level Security (RLS) policies ensure users can only:
  - View their own bulk operations
  - Create new operations
  - Update their own operations
- All operations verify user ownership of videos

## Usage

```typescript
// Example usage of bulk operations
const { createBulkOperation } = useBulkOperations();

// Create a bulk operation
await createBulkOperation({
  operation_type: 'move',
  video_ids: ['video1', 'video2'],
  parameters: {
    project_id: 'target-project'
  }
});
```

## Error Handling

- Individual video processing errors don't stop the entire operation
- Failed items are tracked separately
- Detailed error messages are stored for troubleshooting

## Performance Considerations

- Operations are processed asynchronously
- Progress updates are streamed in real-time
- Database indexes optimize query performance
- Batch processing reduces database load

## Future Improvements

1. Add support for:
   - Batch transcoding
   - Bulk metadata updates
   - Export operations
2. Enhanced error recovery
3. Operation scheduling
4. Bulk operation templates 
# Video Security Features

This document details the security features implemented in the FreeFlow application to protect video content and manage access.

## 1. Access Control

Our access control system is built on a foundation of role-based security (RLS) in Supabase and a dedicated permissions table.

### Database Schema
- **`video_permissions` table**: Stores explicit permissions for users on a per-video basis.
  - `video_id`, `user_id`, `permission_level` (`view`, `comment`, `edit`)
- **`secure_share_tokens` table**: Stores unique, expiring tokens for secure sharing.
  - `token`, `video_id`, `expires_at`, `max_usage`
- **Migration File**: `V13_video_security.sql`

### RLS Policies
- **Video Access**: Users can only view a video if it is public, they are the owner, or they have been granted explicit 'view' (or higher) permission.
- **Permission Management**: Only the owner of a video can grant or revoke permissions for it.
- **Token Management**: Only the owner of a video can create or manage share tokens for it.

## 2. Secure Sharing

Users can share videos using two primary methods:

### Direct Permissions
- Owners can grant access to specific registered users via email.
- Permissions are granular (`view`, `comment`, `edit`).

### Token-based Sharing
- Owners can generate secure, shareable links.
- These links can have constraints:
  - **Expiration Date**: The link will stop working after a set time.
  - **Usage Limits**: The link will stop working after being used a certain number of times.

## 3. API Endpoints

- `POST /api/video/[id]/permissions`: Grants a permission level to a user for a specific video.
- `DELETE /api/video/[id]/permissions/[permissionId]`: Revokes a user's permission (Not yet implemented).
- `POST /api/video/[id]/share`: Creates a new secure share token and returns the shareable URL.

## 4. Frontend Implementation

- **`useVideoSecurity` Hook**: A custom React hook that abstracts all security-related API calls and state management.
- **`VideoShareDialog` Component**: A UI component that allows video owners to:
  - Invite collaborators by email.
  - Set permission levels.
  - Generate secure share links.
  - Copy links to the clipboard.

## 5. DRM (Digital Rights Management)

DRM is a planned feature to provide the highest level of copy protection for video content.

### Proposed Integration (Mux)
1.  **Asset Creation**: When a video is uploaded, we will request a DRM-protected version from Mux by setting the `mp4_support` to `standard` and `max_resolution` to `1080p` and enabling `signed` URLs.
2.  **License Acquisition**: The video player will require a license to play DRM-protected content.
3.  **Backend Endpoint**: We will create a secure backend endpoint (e.g., `/api/video/[id]/license`) that verifies the user's permission to view the video.
4.  **Token Generation**: If the user is authorized, the backend will generate a short-lived, signed token (JWT) that can be used to construct the license URL for the player.
5.  **Player Integration**: The Mux player will be configured to use this license acquisition URL.

This ensures that only authenticated and authorized users can decrypt and play the video content.

## Future Security Enhancements
- Watermarking
- Geoblocking and IP restrictions
- Detailed audit logs for access and sharing events 
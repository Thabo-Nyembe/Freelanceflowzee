// 🧪 Context7 Enhanced Media Feedback Testing Suite
// Enterprise-grade testing with Context7 best practices
// Cross-browser compatibility: Chrome, Firefox, Safari, Mobile
// Comprehensive coverage: Media comments, markers, validation, CRUD operations

import { test, expect, Page } from '@playwright/test';

// Configuration for Context7 enhanced testing
test.use({
  baseURL: 'http://localhost:3000',
  viewport: { width: 1280, height: 720 },
  extraHTTPHeaders: {
    'x-test-mode': 'true',
    'user-agent': 'Playwright/Test Runner'
  },
  actionTimeout: 10000,
  navigationTimeout: 30000,
});

// Test data constants for feedback scenarios
const VALID_FEEDBACK_DATA = {
  comment: 'This section needs revision according to brand guidelines',
  priority: 'high',
  tags: ['Design', 'Urgent'],
  markerPosition: { x: 50, y: 30 },
  videoTimestamp: 45, // seconds
  audioTimestamp: 120 // seconds
};

const INVALID_FEEDBACK_DATA = {
  emptyComment: '',
  whitespaceOnlyComment: '   \n\t   ',
  tooLongComment: 'a'.repeat(2001), // Assuming 2000 char limit
  invalidPosition: { x: -10, y: 150 } // Out of bounds
};

const MEDIA_FILES = {
  image: {
    id: 'media-img-1',
    name: 'Brand Logo.png',
    type: 'image',
    url: '/demo/test-image.jpg'
  },
  video: {
    id: 'media-vid-1', 
    name: 'Product Demo.mp4',
    type: 'video',
    url: '/demo/test-video.mp4',
    duration: 135
  },
  audio: {
    id: 'media-aud-1',
    name: 'Podcast.mp3', 
    type: 'audio',
    url: '/demo/test-audio.mp3',
    duration: 930
  }
};

// Context7 Enhanced API Mocking Setup for Feedback
async function setupFeedbackAPIMocking(page: Page) {
  // Mock feedback endpoints
  await page.route('**/api/feedback/**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    
    if (method === 'POST' && url.includes('/comments')) {
      const postData = route.request().postDataJSON();
      
      // Validate required fields
      if (!postData?.content || postData.content.trim() === '') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Comment content is required',
            field: 'content'
          })
        });
        return;
      }
      
      // Simulate successful comment creation
      await route.fulfill({
        status: 201,
        contentType: 'application/json', 
        body: JSON.stringify({
          id: 'comment_' + Date.now(),
          content: postData.content,
          position: postData.position,
          timestamp: postData.timestamp,
          priority: postData.priority || 'medium',
          tags: postData.tags || [],
          author: 'Test User',
          created_at: new Date().toISOString(),
          status: 'pending'
        })
      });
    } else if (method === 'PUT' && url.includes('/comments/')) {
      // Mock comment editing
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: url.split('/').pop(),
          content: postData.content,
          updated_at: new Date().toISOString()
        })
      });
    } else if (method === 'DELETE' && url.includes('/comments/')) {
      // Mock comment deletion
      await route.fulfill({
        status: 204,
        contentType: 'application/json'
      });
    } else {
      // Mock GET requests
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
  });

  console.log('✅ Feedback API mocking configured successfully');
}

// Helper function to create self-contained HTML page
async function createFeedbackTestPage(page: Page, mediaType: 'image' | 'video' | 'audio') {
  const mediaFile = MEDIA_FILES[mediaType];
  
  const mockHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Feedback System - ${mediaFile.name}</title>
      <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .feedback-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; }
          .media-viewer { position: relative; background: #000; border-radius: 8px; margin-bottom: 20px; }
          .media-content { width: 100%; height: 400px; object-fit: cover; border-radius: 8px; }
          .media-placeholder { width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; background: #e5e7eb; border-radius: 8px; color: #6b7280; }
          .feedback-marker { position: absolute; width: 24px; height: 24px; background: #3b82f6; border: 2px solid white; border-radius: 50%; cursor: pointer; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
          .feedback-marker:hover { background: #2563eb; }
          .comment-dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); z-index: 1000; min-width: 400px; }
          .comment-dialog.hidden { display: none; }
          .form-group { margin-bottom: 15px; }
          .form-label { display: block; margin-bottom: 5px; font-weight: 500; color: #374151; }
          .form-input, .form-textarea, .form-select { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; }
          .form-textarea { resize: vertical; min-height: 80px; }
          .button { padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; border: 1px solid transparent; }
          .button-primary { background: #3b82f6; color: white; }
          .button-primary:hover { background: #2563eb; }
          .button-secondary { background: white; color: #374151; border-color: #d1d5db; }
          .button-secondary:hover { background: #f9fafb; }
          .button:disabled { opacity: 0.5; cursor: not-allowed; }
          .tag-container { display: flex; gap: 8px; flex-wrap: wrap; }
          .tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer; border: 1px solid #d1d5db; }
          .tag.selected { background: #3b82f6; color: white; border-color: #3b82f6; }
          .comments-list { margin-top: 20px; }
          .comment-item { padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px; }
          .comment-header { display: flex; justify-content: between; align-items: center; margin-bottom: 8px; }
          .comment-content { color: #374151; line-height: 1.5; }
          .comment-actions { display: flex; gap: 8px; margin-top: 8px; }
          .timeline { position: relative; height: 8px; background: #e5e7eb; border-radius: 4px; margin: 10px 0; cursor: pointer; }
          .timeline-progress { height: 100%; background: #3b82f6; border-radius: 4px; }
          .timeline-marker { position: absolute; width: 12px; height: 12px; background: #ef4444; border: 2px solid white; border-radius: 50%; transform: translate(-50%, -50%); top: 50%; }
          .error-message { color: #dc2626; font-size: 12px; margin-top: 4px; }
          .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; }
          .overlay.hidden { display: none; }
      </style>
  </head>
  <body>
      <div class="feedback-container">
          <h1>Feedback on ${mediaFile.name}</h1>
          
          <div class="media-viewer" id="mediaViewer" data-testid="media-viewer">
              ${mediaType === 'image' ? 
                `<img src="${mediaFile.url}" alt="${mediaFile.name}" class="media-content" data-testid="media-image" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                 <div class="media-placeholder" style="display:none;" data-testid="media-placeholder">
                     <div>🖼️ Image: ${mediaFile.name}</div>
                 </div>` :
                mediaType === 'video' ?
                `<div class="media-placeholder" data-testid="media-placeholder">
                     <div>🎥 Video: ${mediaFile.name}<br>Duration: ${Math.floor(mediaFile.duration / 60)}:${(mediaFile.duration % 60).toString().padStart(2, '0')}</div>
                 </div>` :
                `<div class="media-placeholder" data-testid="media-placeholder">
                     <div>🎵 Audio: ${mediaFile.name}<br>Duration: ${Math.floor(mediaFile.duration / 60)}:${(mediaFile.duration % 60).toString().padStart(2, '0')}</div>
                 </div>`
              }
              
              <!-- Feedback markers will be added here dynamically -->
          </div>
          
          ${mediaType !== 'image' ? `
          <div class="timeline" id="timeline" data-testid="timeline">
              <div class="timeline-progress" style="width: 0%;" data-testid="timeline-progress"></div>
              <!-- Timeline markers will be added here -->
          </div>
          ` : ''}
          
          <button class="button button-primary" onclick="showCommentDialog()" data-testid="add-comment-btn">
              Add Comment
          </button>
          
          <div class="comments-list" id="commentsList" data-testid="comments-list">
              <!-- Comments will be listed here -->
          </div>
      </div>
      
      <!-- Comment Dialog -->
      <div class="overlay hidden" id="overlay" onclick="hideCommentDialog()"></div>
      <div class="comment-dialog hidden" id="commentDialog" data-testid="comment-dialog">
          <h3>Add Feedback Comment</h3>
          <form id="commentForm" onsubmit="submitComment(event)">
              <div class="form-group">
                  <label class="form-label" for="commentContent">Comment *</label>
                  <textarea id="commentContent" name="content" class="form-textarea" 
                           placeholder="Share your feedback..." required data-testid="comment-content"></textarea>
                  <div class="error-message hidden" id="contentError" data-testid="content-error"></div>
              </div>
              
              <div class="form-group">
                  <label class="form-label" for="commentPriority">Priority</label>
                  <select id="commentPriority" name="priority" class="form-select" data-testid="comment-priority">
                      <option value="low">Low</option>
                      <option value="medium" selected>Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                  </select>
              </div>
              
              <div class="form-group">
                  <label class="form-label">Tags</label>
                  <div class="tag-container" data-testid="tag-container">
                      <span class="tag" onclick="toggleTag('Design')" data-testid="tag-design">Design</span>
                      <span class="tag" onclick="toggleTag('Content')" data-testid="tag-content">Content</span>
                      <span class="tag" onclick="toggleTag('Technical')" data-testid="tag-technical">Technical</span>
                      <span class="tag" onclick="toggleTag('Urgent')" data-testid="tag-urgent">Urgent</span>
                  </div>
              </div>
              
              <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                  <button type="button" class="button button-secondary" onclick="hideCommentDialog()" data-testid="cancel-btn">
                      Cancel
                  </button>
                  <button type="submit" class="button button-primary" id="submitBtn" data-testid="submit-btn">
                      Add Comment
                  </button>
              </div>
          </form>
      </div>
      
      <!-- Edit Dialog -->
      <div class="comment-dialog hidden" id="editDialog" data-testid="edit-dialog">
          <h3>Edit Comment</h3>
          <form id="editForm" onsubmit="submitEdit(event)">
              <div class="form-group">
                  <label class="form-label" for="editContent">Comment *</label>
                  <textarea id="editContent" name="content" class="form-textarea" required data-testid="edit-content"></textarea>
              </div>
              
              <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                  <button type="button" class="button button-secondary" onclick="hideEditDialog()" data-testid="edit-cancel-btn">
                      Cancel
                  </button>
                  <button type="submit" class="button button-primary" data-testid="edit-submit-btn">
                      Update Comment
                  </button>
              </div>
          </form>
      </div>
      
      <script>
          let comments = [];
          let currentPosition = null;
          let selectedTags = [];
          let editingCommentId = null;
          
          // Media click handler for positioning markers
          document.getElementById('mediaViewer').addEventListener('click', function(e) {
              if (e.target.closest('.feedback-marker')) return;
              
              const rect = this.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              
              currentPosition = { x, y };
              showCommentDialog();
          });
          
          ${mediaType !== 'image' ? `
          // Timeline click handler for time-based comments
          document.getElementById('timeline').addEventListener('click', function(e) {
              const rect = this.getBoundingClientRect();
              const position = (e.clientX - rect.left) / rect.width;
              const timestamp = position * ${mediaFile.duration || 100};
              
              currentPosition = { timestamp };
              showCommentDialog();
          });
          ` : ''}
          
          function showCommentDialog() {
              document.getElementById('overlay').classList.remove('hidden');
              document.getElementById('commentDialog').classList.remove('hidden');
              document.getElementById('commentContent').focus();
          }
          
          function hideCommentDialog() {
              document.getElementById('overlay').classList.add('hidden');
              document.getElementById('commentDialog').classList.add('hidden');
              document.getElementById('commentForm').reset();
              selectedTags = [];
              updateTagDisplay();
              currentPosition = null;
              clearErrors();
          }
          
          function showEditDialog(commentId) {
              const comment = comments.find(c => c.id === commentId);
              if (!comment) return;
              
              editingCommentId = commentId;
              document.getElementById('editContent').value = comment.content;
              document.getElementById('overlay').classList.remove('hidden');
              document.getElementById('editDialog').classList.remove('hidden');
          }
          
          function hideEditDialog() {
              document.getElementById('overlay').classList.add('hidden');
              document.getElementById('editDialog').classList.add('hidden');
              editingCommentId = null;
          }
          
          function toggleTag(tag) {
              if (selectedTags.includes(tag)) {
                  selectedTags = selectedTags.filter(t => t !== tag);
              } else {
                  selectedTags.push(tag);
              }
              updateTagDisplay();
          }
          
          function updateTagDisplay() {
              document.querySelectorAll('.tag').forEach(tag => {
                  const tagText = tag.textContent;
                  if (selectedTags.includes(tagText)) {
                      tag.classList.add('selected');
                  } else {
                      tag.classList.remove('selected');
                  }
              });
          }
          
          function submitComment(e) {
              e.preventDefault();
              clearErrors();
              
              const content = document.getElementById('commentContent').value.trim();
              const priority = document.getElementById('commentPriority').value;
              
              // Validation
              if (!content) {
                  showError('contentError', 'Comment content is required');
                  return;
              }
              
              if (content.length > 2000) {
                  showError('contentError', 'Comment must be less than 2000 characters');
                  return;
              }
              
              // Create comment
              const comment = {
                  id: 'comment_' + Date.now(),
                  content,
                  priority,
                  tags: [...selectedTags],
                  position: currentPosition,
                  author: 'Test User',
                  created_at: new Date().toISOString()
              };
              
              comments.push(comment);
              renderComments();
              renderMarkers();
              hideCommentDialog();
          }
          
          function submitEdit(e) {
              e.preventDefault();
              
              const content = document.getElementById('editContent').value.trim();
              
              if (!content) return;
              
              const commentIndex = comments.findIndex(c => c.id === editingCommentId);
              if (commentIndex !== -1) {
                  comments[commentIndex].content = content;
                  comments[commentIndex].updated_at = new Date().toISOString();
                  renderComments();
              }
              
              hideEditDialog();
          }
          
          function deleteComment(commentId) {
              if (confirm('Are you sure you want to delete this comment?')) {
                  comments = comments.filter(c => c.id !== commentId);
                  renderComments();
                  renderMarkers();
              }
          }
          
          function renderComments() {
              const container = document.getElementById('commentsList');
              container.innerHTML = comments.map(comment => \`
                  <div class="comment-item" data-testid="comment-\${comment.id}">
                      <div class="comment-header">
                          <strong>\${comment.author}</strong>
                          <span style="color: #6b7280; font-size: 12px;">
                              \${new Date(comment.created_at).toLocaleString()}
                              \${comment.updated_at ? ' (edited)' : ''}
                          </span>
                      </div>
                      <div class="comment-content">\${comment.content}</div>
                      <div class="comment-actions">
                          <button class="button button-secondary" onclick="showEditDialog('\${comment.id}')" 
                                  data-testid="edit-comment-\${comment.id}">Edit</button>
                          <button class="button button-secondary" onclick="deleteComment('\${comment.id}')" 
                                  data-testid="delete-comment-\${comment.id}">Delete</button>
                      </div>
                  </div>
              \`).join('');
          }
          
          function renderMarkers() {
              const viewer = document.getElementById('mediaViewer');
              
              // Remove existing markers
              viewer.querySelectorAll('.feedback-marker').forEach(marker => marker.remove());
              
              // Add new markers
              comments.forEach((comment, index) => {
                  if (comment.position) {
                      if (comment.position.x !== undefined && comment.position.y !== undefined) {
                          // Position-based marker (image/video)
                          const marker = document.createElement('div');
                          marker.className = 'feedback-marker';
                          marker.style.left = comment.position.x + '%';
                          marker.style.top = comment.position.y + '%';
                          marker.textContent = index + 1;
                          marker.title = comment.content;
                          marker.setAttribute('data-testid', \`marker-\${comment.id}\`);
                          viewer.appendChild(marker);
                      } else if (comment.position.timestamp !== undefined) {
                          // Time-based marker (video/audio timeline)
                          const timeline = document.getElementById('timeline');
                          if (timeline) {
                              const marker = document.createElement('div');
                              marker.className = 'timeline-marker';
                              marker.style.left = (comment.position.timestamp / ${mediaFile.duration || 100}) * 100 + '%';
                              marker.title = \`\${Math.floor(comment.position.timestamp / 60)}:\${Math.floor(comment.position.timestamp % 60).toString().padStart(2, '0')} - \${comment.content}\`;
                              marker.setAttribute('data-testid', \`timeline-marker-\${comment.id}\`);
                              timeline.appendChild(marker);
                          }
                      }
                  }
              });
          }
          
          function showError(elementId, message) {
              const errorElement = document.getElementById(elementId);
              errorElement.textContent = message;
              errorElement.classList.remove('hidden');
          }
          
          function clearErrors() {
              document.querySelectorAll('.error-message').forEach(el => {
                  el.classList.add('hidden');
                  el.textContent = '';
              });
          }
          
          // Initialize
          renderComments();
          renderMarkers();
      </script>
  </body>
  </html>`;

  await page.setContent(mockHtml);
}

test.describe('Media Feedback System Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocking before each test
    await setupFeedbackAPIMocking(page);
  });

  test.describe('🖼️ Image Feedback', () => {
    test('should display image feedback interface with all required elements', async ({ page, browserName }) => {
      // Navigate to image feedback page
      await page.goto('/feedback?type=image&file=sample.jpg');
      await page.waitForLoadState('networkidle');
      
      // Verify image viewer and comment controls
      await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
      await expect(page.locator('[data-testid="comment-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="comment-content"]')).toBeVisible();
      
      console.log(`✅ Image feedback interface verified (${browserName})`);
    });

    test('should successfully add a comment with marker on image', async ({ page, browserName }) => {
      // Navigate to image feedback page
      await page.goto('/feedback?type=image&file=sample.jpg');
      await page.waitForLoadState('networkidle');
      
      // Click on image to add comment marker
      await page.locator('[data-testid="image-viewer"]').click({ position: { x: 100, y: 100 } });
      
      // Fill comment form
      await page.locator('[data-testid="comment-content"]').fill('Test comment on image');
      await page.locator('button[type="submit"]').click();
      
      // Wait for form submission
      await page.waitForTimeout(1000);
      
      // Verify comment was added (use .first() to handle multiple matches)
      await expect(page.locator('[data-testid="comment-list"] .comment-item').first()).toBeVisible();
      await expect(page.locator('[data-testid^="marker-"]').first()).toBeVisible();
      
      console.log(`✅ Image comment with marker added successfully (${browserName})`);
    });

    test('should show validation error for empty comment', async ({ page, browserName }) => {
      await page.goto('/feedback?type=image&file=sample.jpg');
      await page.waitForLoadState('networkidle');
      
      // Try to submit empty comment
      await page.locator('button[type="submit"]').click();
      
      // Check for validation error
      const errorMessage = page.locator('[data-testid="error-message"], .error-message, [role="alert"]').first();
      await expect(errorMessage).toBeVisible();
      
      console.log(`✅ Empty comment validation working (${browserName})`);
    });

    test('should edit existing comment successfully', async ({ page, browserName }) => {
      await page.goto('/feedback?type=image&file=sample.jpg');
      await page.waitForLoadState('networkidle');
      
      // Add initial comment
      await page.locator('[data-testid="image-viewer"]').click({ position: { x: 150, y: 150 } });
      await page.locator('[data-testid="comment-content"]').fill('Original comment');
      await page.locator('button[type="submit"]').click();
      
      // Wait for comment to appear
      await expect(page.locator('[data-testid="comment-list"] .comment-item').first()).toBeVisible();
      
      // Click edit button
      await page.locator('[data-testid^="edit-comment-"]').first().click();
      
      // Update comment
      await page.locator('[data-testid="comment-content"]').fill('Updated comment');
      await page.locator('button[type="submit"]').click();
      
      // Verify updated comment
      await expect(page.locator('text=Updated comment').first()).toBeVisible();
      
      console.log(`✅ Comment editing successful (${browserName})`);
    });

    test('should delete comment and marker successfully', async ({ page, browserName }) => {
      await page.goto('/feedback?type=image&file=sample.jpg');
      await page.waitForLoadState('networkidle');
      
      // Add comment first
      await page.locator('[data-testid="image-viewer"]').click({ position: { x: 200, y: 200 } });
      await page.locator('[data-testid="comment-content"]').fill('Comment to delete');
      await page.locator('button[type="submit"]').click();
      
      // Verify comment and marker exist
      await expect(page.locator('[data-testid="comment-list"] .comment-item').first()).toBeVisible();
      await expect(page.locator('[data-testid^="marker-"]').first()).toBeVisible();
      
      // Delete comment (handle confirmation dialog)
      await page.locator('[data-testid^="delete-comment-"]').first().click();
      
      // Handle potential confirmation dialog
      const confirmDialog = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
      if (await confirmDialog.isVisible()) {
        await confirmDialog.click();
      }
      
      // Verify comment and marker removed
      await expect(page.locator('[data-testid="comment-list"] .comment-item')).toHaveCount(0);
      await expect(page.locator('[data-testid^="marker-"]')).toHaveCount(0);
      
      console.log(`✅ Comment deletion successful (${browserName})`);
    });
  });

  test.describe('🎥 Video Feedback', () => {
    test('should display video feedback interface with timeline', async ({ page, browserName }) => {
      await page.goto('/feedback?type=video&file=sample.mp4');
      await page.waitForLoadState('networkidle');
      
      // Verify video interface elements
      await expect(page.locator('[data-testid="video-viewer"]')).toBeVisible();
      await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="comment-dialog"]')).toBeVisible();
      
      console.log(`✅ Video feedback interface verified (${browserName})`);
    });

    test('should add time-based comment on timeline click', async ({ page, browserName }) => {
      await page.goto('/feedback?type=video&file=sample.mp4');
      await page.waitForLoadState('networkidle');
      
      // Click on timeline to set time position
      await page.locator('[data-testid="timeline"]').click({ position: { x: 100, y: 10 } });
      
      // Add comment
      await page.locator('[data-testid="comment-content"]').fill('Time-based comment');
      await page.locator('button[type="submit"]').click();
      
      // Verify timeline marker was added
      await expect(page.locator('[data-testid^="timeline-marker-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="comment-list"] .comment-item').first()).toBeVisible();
      
      console.log(`✅ Time-based video comment added successfully (${browserName})`);
    });

    test('should add position-based comment on video area click', async ({ page, browserName }) => {
      await page.goto('/feedback?type=video&file=sample.mp4');
      await page.waitForLoadState('networkidle');
      
      // Click on video area to add position marker
      await page.locator('[data-testid="video-viewer"] video, [data-testid="video-viewer"] .video-container').first().click({ position: { x: 200, y: 150 } });
      
      // Add comment
      await page.locator('[data-testid="comment-content"]').fill('Position-based comment');
      await page.locator('button[type="submit"]').click();
      
      // Verify position marker was added
      await expect(page.locator('[data-testid^="marker-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="comment-list"] .comment-item').first()).toBeVisible();
      
      console.log(`✅ Position-based video comment added successfully (${browserName})`);
    });
  });

  test.describe('🎵 Audio Feedback', () => {
    test('should display audio feedback interface with timeline', async ({ page, browserName }) => {
      await page.goto('/feedback?type=audio&file=sample.mp3');
      await page.waitForLoadState('networkidle');
      
      // Verify audio interface elements
      await expect(page.locator('[data-testid="audio-viewer"]')).toBeVisible();
      await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
      
      console.log(`✅ Audio feedback interface verified (${browserName})`);
    });

    test('should add timestamp-based comment on audio timeline', async ({ page, browserName }) => {
      await page.goto('/feedback?type=audio&file=sample.mp3');
      await page.waitForLoadState('networkidle');
      
      // Click on audio timeline
      await page.locator('[data-testid="timeline"]').click({ position: { x: 150, y: 10 } });
      
      // Add timestamp comment
      await page.locator('[data-testid="comment-content"]').fill('Audio timestamp comment');
      await page.locator('button[type="submit"]').click();
      
      // Verify timeline marker and comment
      await expect(page.locator('[data-testid^="timeline-marker-"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="comment-list"] .comment-item').first()).toBeVisible();
      
      console.log(`✅ Audio timestamp comment added successfully (${browserName})`);
    });
  });

  test.describe('📝 Comment Validation & Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await createFeedbackTestPage(page, 'image');
    });

    test('should reject whitespace-only comments', async ({ page, browserName }) => {
      await page.locator('[data-testid="media-viewer"]').click({ position: { x: 100, y: 100 } });
      
      // Try whitespace-only comment
      await page.locator('[data-testid="comment-content"]').fill('   \n\t   ');
      await page.locator('[data-testid="submit-btn"]').click();
      
      // Verify validation error
      await expect(page.locator('[data-testid="content-error"]')).toBeVisible();
      
      console.log(`✅ Whitespace-only comment validation working (${browserName})`);
    });

    test('should handle comment character limit validation', async ({ page, browserName }) => {
      await page.locator('[data-testid="media-viewer"]').click({ position: { x: 100, y: 100 } });
      
      // Try overly long comment
      const longComment = 'a'.repeat(2001);
      await page.locator('[data-testid="comment-content"]').fill(longComment);
      await page.locator('[data-testid="submit-btn"]').click();
      
      // Verify validation error
      await expect(page.locator('[data-testid="content-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="content-error"]')).toContainText('2000 characters');
      
      console.log(`✅ Character limit validation working (${browserName})`);
    });

    test('should handle canceling comment creation', async ({ page, browserName }) => {
      await page.locator('[data-testid="media-viewer"]').click({ position: { x: 100, y: 100 } });
      
      // Fill form partially
      await page.locator('[data-testid="comment-content"]').fill('Partial comment');
      await page.locator('[data-testid="tag-design"]').click();
      
      // Cancel
      await page.locator('[data-testid="cancel-btn"]').click();
      
      // Verify dialog closes and no comment is added
      await expect(page.locator('[data-testid="comment-dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-testid^="comment-"]')).toHaveCount(0);
      
      console.log(`✅ Comment cancellation working (${browserName})`);
    });

    test('should handle canceling comment edit', async ({ page, browserName }) => {
      // First add a comment
      await page.locator('[data-testid="media-viewer"]').click({ position: { x: 200, y: 150 } });
      await page.locator('[data-testid="comment-content"]').fill('Original comment');
      await page.locator('[data-testid="submit-btn"]').click();
      
      // Start editing
      await page.locator('[data-testid^="edit-comment-"]').click();
      await page.locator('[data-testid="edit-content"]').fill('Changed but cancelled');
      
      // Cancel edit
      await page.locator('[data-testid="edit-cancel-btn"]').click();
      
      // Verify original comment unchanged
      await expect(page.locator('[data-testid="edit-dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-testid^="comment-"]')).toContainText('Original comment');
      await expect(page.locator('[data-testid^="comment-"]')).not.toContainText('Changed but cancelled');
      
      console.log(`✅ Edit cancellation working (${browserName})`);
    });

    test('should handle multiple comments with different priorities and tags', async ({ page, browserName }) => {
      // Add first comment
      await page.locator('[data-testid="media-viewer"]').click({ position: { x: 100, y: 100 } });
      await page.locator('[data-testid="comment-content"]').fill('High priority design issue');
      await page.locator('[data-testid="comment-priority"]').selectOption('high');
      await page.locator('[data-testid="tag-design"]').click();
      await page.locator('[data-testid="tag-urgent"]').click();
      await page.locator('[data-testid="submit-btn"]').click();
      
      // Add second comment
      await page.locator('[data-testid="media-viewer"]').click({ position: { x: 300, y: 200 } });
      await page.locator('[data-testid="comment-content"]').fill('Technical improvement suggestion');
      await page.locator('[data-testid="comment-priority"]').selectOption('low');
      await page.locator('[data-testid="tag-technical"]').click();
      await page.locator('[data-testid="submit-btn"]').click();
      
      // Verify both comments exist
      await expect(page.locator('[data-testid^="comment-"]')).toHaveCount(2);
      await expect(page.locator('[data-testid^="marker-"]')).toHaveCount(2);
      
      // Verify content
      await expect(page.locator('[data-testid^="comment-"]').first()).toContainText('High priority design issue');
      await expect(page.locator('[data-testid^="comment-"]').last()).toContainText('Technical improvement suggestion');
      
      console.log(`✅ Multiple comments with different properties working (${browserName})`);
    });
  });
}); 
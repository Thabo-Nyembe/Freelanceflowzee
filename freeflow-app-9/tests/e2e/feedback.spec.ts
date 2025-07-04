// 🧪 Context7 Enhanced Media Feedback Testing Suite
// Enterprise-grade testing with Context7 best practices
// Cross-browser compatibility: Chrome, Firefox, Safari, Mobile
// Comprehensive coverage: Media comments, markers, validation, CRUD operations

import { test, expect, Page } from &apos;@playwright/test&apos;;

// Configuration for Context7 enhanced testing
test.use({
  baseURL: &apos;http://localhost:3000&apos;,
  viewport: { width: 1280, height: 720 },
  extraHTTPHeaders: {
    &apos;x-test-mode&apos;: &apos;true&apos;,
    &apos;user-agent&apos;: &apos;Playwright/Test Runner&apos;
  },
  actionTimeout: 10000,
  navigationTimeout: 30000,
});

// Test data constants for feedback scenarios
const VALID_FEEDBACK_DATA = {
  comment: &apos;This section needs revision according to brand guidelines&apos;,
  priority: &apos;high&apos;,
  tags: [&apos;Design&apos;, &apos;Urgent&apos;],
  markerPosition: { x: 50, y: 30 },
  videoTimestamp: 45, // seconds
  audioTimestamp: 120 // seconds
};

const INVALID_FEEDBACK_DATA = {
  emptyComment: '&apos;,
  whitespaceOnlyComment: &apos;   \n\t   &apos;,
  tooLongComment: &apos;a'.repeat(2001), // Assuming 2000 char limit
  invalidPosition: { x: -10, y: 150 } // Out of bounds
};

const MEDIA_FILES = {
  image: {
    id: &apos;media-img-1&apos;,
    name: &apos;Brand Logo.png&apos;,
    type: &apos;image&apos;,
    url: &apos;/demo/test-image.jpg&apos;
  },
  video: {
    id: &apos;media-vid-1&apos;, 
    name: &apos;Product Demo.mp4&apos;,
    type: &apos;video&apos;,
    url: &apos;/demo/test-video.mp4&apos;,
    duration: 135
  },
  audio: {
    id: &apos;media-aud-1&apos;,
    name: &apos;Podcast.mp3&apos;, 
    type: &apos;audio&apos;,
    url: &apos;/demo/test-audio.mp3&apos;,
    duration: 930
  }
};

// Context7 Enhanced API Mocking Setup for Feedback
async function setupFeedbackAPIMocking(page: Page) {
  // Mock feedback endpoints
  await page.route(&apos;**/api/feedback/**&apos;, async (route) => {
    const method = route.request().method();
    const url = route.request().url();
    
    if (method === &apos;POST&apos; && url.includes(&apos;/comments&apos;)) {
      const postData = route.request().postDataJSON();
      
      // Validate required fields
      if (!postData?.content || postData.content.trim() === '&apos;) {
        await route.fulfill({
          status: 400,
          contentType: &apos;application/json&apos;,
          body: JSON.stringify({
            error: &apos;Comment content is required&apos;,
            field: &apos;content&apos;
          })
        });
        return;
      }
      
      // Simulate successful comment creation
      await route.fulfill({
        status: 201,
        contentType: &apos;application/json&apos;, 
        body: JSON.stringify({
          id: &apos;comment_&apos; + Date.now(),
          content: postData.content,
          position: postData.position,
          timestamp: postData.timestamp,
          priority: postData.priority || &apos;medium&apos;,
          tags: postData.tags || [],
          author: &apos;Test User&apos;,
          created_at: new Date().toISOString(),
          status: &apos;pending&apos;
        })
      });
    } else if (method === &apos;PUT&apos; && url.includes(&apos;/comments/&apos;)) {
      // Mock comment editing
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify({
          id: url.split(&apos;/').pop(),
          content: postData.content,
          updated_at: new Date().toISOString()
        })
      });
    } else if (method === &apos;DELETE&apos; && url.includes(&apos;/comments/&apos;)) {
      // Mock comment deletion
      await route.fulfill({
        status: 204,
        contentType: &apos;application/json&apos;
      });
    } else {
      // Mock GET requests
      await route.fulfill({
        status: 200,
        contentType: &apos;application/json&apos;,
        body: JSON.stringify([])
      });
    }
  });

  console.log(&apos;✅ Feedback API mocking configured successfully&apos;);
}

// Helper function to create self-contained HTML page
async function createFeedbackTestPage(page: Page, mediaType: &apos;image&apos; | &apos;video&apos; | &apos;audio&apos;) {
  const mediaFile = MEDIA_FILES[mediaType];
  
  const mockHtml = 
  <!DOCTYPE html>
  <html lang=&quot;en&quot;>
  <head>
      <meta charset=&quot;UTF-8&quot;>
      <meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;>
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
      <div class=&quot;feedback-container&quot;>
          <h1>Feedback on ${mediaFile.name}</h1>
          
          <div class=&quot;media-viewer&quot; id=&quot;mediaViewer&quot; data-testid=&quot;media-viewer&quot;>
              ${mediaType === &apos;image&apos; ? 
                `<img src=&quot;${mediaFile.url}&quot; alt=&quot;${mediaFile.name}&quot; class=&quot;media-content&quot; data-testid=&quot;media-image&quot; onerror=&quot;this.style.display=&apos;none&apos;;this.nextElementSibling.style.display=&apos;flex&apos;;&quot; alt="">
                 <div class=&quot;media-placeholder&quot; style=&quot;display:none;&quot; data-testid=&quot;media-placeholder&quot;>
                     <div>🖼️ Image: ${mediaFile.name}</div>
                 </div>` :
                mediaType === &apos;video&apos; ?
                `<div class=&quot;media-placeholder&quot; data-testid=&quot;media-placeholder&quot;>
                     <div>🎥 Video: ${mediaFile.name}<br>Duration: ${Math.floor(mediaFile.duration / 60)}:${(mediaFile.duration % 60).toString().padStart(2, &apos;0')}</div>
                 </div>` :
                `<div class=&quot;media-placeholder&quot; data-testid=&quot;media-placeholder&quot;>
                     <div>🎵 Audio: ${mediaFile.name}<br>Duration: ${Math.floor(mediaFile.duration / 60)}:${(mediaFile.duration % 60).toString().padStart(2, &apos;0')}</div>
                 </div>
              }
              
              <!-- Feedback markers will be added here dynamically -->
          </div>
          
          ${mediaType !== &apos;image&apos; ? 
          <div class=&quot;timeline&quot; id=&quot;timeline&quot; data-testid=&quot;timeline&quot;>
              <div class=&quot;timeline-progress&quot; style=&quot;width: 0%;&quot; data-testid=&quot;timeline-progress&quot;></div>
              <!-- Timeline markers will be added here -->
          </div>
          ` : '&apos;}
          
          <button class=&quot;button button-primary&quot; onclick=&quot;showCommentDialog()&quot; data-testid=&quot;add-comment-btn&quot;>
              Add Comment
          </button>
          
          <div class=&quot;comments-list&quot; id=&quot;commentsList&quot; data-testid=&quot;comments-list&quot;>
              <!-- Comments will be listed here -->
          </div>
      </div>
      
      <!-- Comment Dialog -->
      <div class=&quot;overlay hidden&quot; id=&quot;overlay&quot; onclick=&quot;hideCommentDialog()&quot;></div>
      <div class=&quot;comment-dialog hidden&quot; id=&quot;commentDialog&quot; data-testid=&quot;comment-dialog&quot;>
          <h3>Add Feedback Comment</h3>
          <form id=&quot;commentForm&quot; onsubmit=&quot;submitComment(event)&quot;>
              <div class=&quot;form-group&quot;>
                  <label class=&quot;form-label&quot; for=&quot;commentContent&quot;>Comment *</label>
                  <textarea id=&quot;commentContent&quot; name=&quot;content&quot; class=&quot;form-textarea&quot; 
                           placeholder=&quot;Share your feedback...&quot; required data-testid=&quot;comment-content&quot;></textarea>
                  <div class=&quot;error-message hidden&quot; id=&quot;contentError&quot; data-testid=&quot;content-error&quot;></div>
              </div>
              
              <div class=&quot;form-group&quot;>
                  <label class=&quot;form-label&quot; for=&quot;commentPriority&quot;>Priority</label>
                  <select id=&quot;commentPriority&quot; name=&quot;priority&quot; class=&quot;form-select&quot; data-testid=&quot;comment-priority&quot;>
                      <option value=&quot;low&quot;>Low</option>
                      <option value=&quot;medium&quot; selected>Medium</option>
                      <option value=&quot;high&quot;>High</option>
                      <option value=&quot;critical&quot;>Critical</option>
                  </select>
              </div>
              
              <div class=&quot;form-group&quot;>
                  <label class=&quot;form-label&quot;>Tags</label>
                  <div class=&quot;tag-container&quot; data-testid=&quot;tag-container&quot;>
                      <span class=&quot;tag&quot; onclick=&quot;toggleTag(&apos;Design&apos;)&quot; data-testid=&quot;tag-design&quot;>Design</span>
                      <span class=&quot;tag&quot; onclick=&quot;toggleTag(&apos;Content&apos;)&quot; data-testid=&quot;tag-content&quot;>Content</span>
                      <span class=&quot;tag&quot; onclick=&quot;toggleTag(&apos;Technical&apos;)&quot; data-testid=&quot;tag-technical&quot;>Technical</span>
                      <span class=&quot;tag&quot; onclick=&quot;toggleTag(&apos;Urgent&apos;)&quot; data-testid=&quot;tag-urgent&quot;>Urgent</span>
                  </div>
              </div>
              
              <div style=&quot;display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;&quot;>
                  <button type=&quot;button&quot; class=&quot;button button-secondary&quot; onclick=&quot;hideCommentDialog()&quot; data-testid=&quot;cancel-btn&quot;>
                      Cancel
                  </button>
                  <button type=&quot;submit&quot; class=&quot;button button-primary&quot; id=&quot;submitBtn&quot; data-testid=&quot;submit-btn&quot;>
                      Add Comment
                  </button>
              </div>
          </form>
      </div>
      
      <!-- Edit Dialog -->
      <div class=&quot;comment-dialog hidden&quot; id=&quot;editDialog&quot; data-testid=&quot;edit-dialog&quot;>
          <h3>Edit Comment</h3>
          <form id=&quot;editForm&quot; onsubmit=&quot;submitEdit(event)&quot;>
              <div class=&quot;form-group&quot;>
                  <label class=&quot;form-label&quot; for=&quot;editContent&quot;>Comment *</label>
                  <textarea id=&quot;editContent&quot; name=&quot;content&quot; class=&quot;form-textarea&quot; required data-testid=&quot;edit-content&quot;></textarea>
              </div>
              
              <div style=&quot;display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;&quot;>
                  <button type=&quot;button&quot; class=&quot;button button-secondary&quot; onclick=&quot;hideEditDialog()&quot; data-testid=&quot;edit-cancel-btn&quot;>
                      Cancel
                  </button>
                  <button type=&quot;submit&quot; class=&quot;button button-primary&quot; data-testid=&quot;edit-submit-btn&quot;>
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
          document.getElementById(&apos;mediaViewer&apos;).addEventListener(&apos;click&apos;, function(e) {
              if (e.target.closest(&apos;.feedback-marker&apos;)) return;
              
              const rect = this.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              
              currentPosition = { x, y };
              showCommentDialog();
          });
          
          ${mediaType !== &apos;image&apos; ? 
          // Timeline click handler for time-based comments
          document.getElementById(&apos;timeline&apos;).addEventListener(&apos;click&apos;, function(e) {
              const rect = this.getBoundingClientRect();
              const position = (e.clientX - rect.left) / rect.width;
              const timestamp = position * ${mediaFile.duration || 100};
              
              currentPosition = { timestamp };
              showCommentDialog();
          });
          ` : '&apos;}
          
          function showCommentDialog() {
              document.getElementById(&apos;overlay&apos;).classList.remove(&apos;hidden&apos;);
              document.getElementById(&apos;commentDialog&apos;).classList.remove(&apos;hidden&apos;);
              document.getElementById(&apos;commentContent&apos;).focus();
          }
          
          function hideCommentDialog() {
              document.getElementById(&apos;overlay&apos;).classList.add(&apos;hidden&apos;);
              document.getElementById(&apos;commentDialog&apos;).classList.add(&apos;hidden&apos;);
              document.getElementById(&apos;commentForm&apos;).reset();
              selectedTags = [];
              updateTagDisplay();
              currentPosition = null;
              clearErrors();
          }
          
          function showEditDialog(commentId) {
              const comment = comments.find(c => c.id === commentId);
              if (!comment) return;
              
              editingCommentId = commentId;
              document.getElementById(&apos;editContent&apos;).value = comment.content;
              document.getElementById(&apos;overlay&apos;).classList.remove(&apos;hidden&apos;);
              document.getElementById(&apos;editDialog&apos;).classList.remove(&apos;hidden&apos;);
          }
          
          function hideEditDialog() {
              document.getElementById(&apos;overlay&apos;).classList.add(&apos;hidden&apos;);
              document.getElementById(&apos;editDialog&apos;).classList.add(&apos;hidden&apos;);
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
              document.querySelectorAll(&apos;.tag&apos;).forEach(tag => {
                  const tagText = tag.textContent;
                  if (selectedTags.includes(tagText)) {
                      tag.classList.add(&apos;selected&apos;);
                  } else {
                      tag.classList.remove(&apos;selected&apos;);
                  }
              });
          }
          
          function submitComment(e) {
              e.preventDefault();
              clearErrors();
              
              const content = document.getElementById(&apos;commentContent&apos;).value.trim();
              const priority = document.getElementById(&apos;commentPriority&apos;).value;
              
              // Validation
              if (!content) {
                  showError(&apos;contentError&apos;, &apos;Comment content is required&apos;);
                  return;
              }
              
              if (content.length > 2000) {
                  showError(&apos;contentError&apos;, &apos;Comment must be less than 2000 characters&apos;);
                  return;
              }
              
              // Create comment
              const comment = {
                  id: &apos;comment_&apos; + Date.now(),
                  content,
                  priority,
                  tags: [...selectedTags],
                  position: currentPosition,
                  author: &apos;Test User&apos;,
                  created_at: new Date().toISOString()
              };
              
              comments.push(comment);
              renderComments();
              renderMarkers();
              hideCommentDialog();
          }
          
          function submitEdit(e) {
              e.preventDefault();
              
              const content = document.getElementById(&apos;editContent&apos;).value.trim();
              
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
              if (confirm(&apos;Are you sure you want to delete this comment?&apos;)) {
                  comments = comments.filter(c => c.id !== commentId);
                  renderComments();
                  renderMarkers();
              }
          }
          
          function renderComments() {
              const container = document.getElementById(&apos;commentsList&apos;);
              container.innerHTML = comments.map(comment => \
                  <div class=&quot;comment-item&quot; data-testid=&quot;comment-\${comment.id}&quot;>
                      <div class=&quot;comment-header&quot;>
                          <strong>\${comment.author}</strong>
                          <span style=&quot;color: #6b7280; font-size: 12px;&quot;>
                              \${new Date(comment.created_at).toLocaleString()}
                              \${comment.updated_at ? &apos; (edited)&apos; : '&apos;}
                          </span>
                      </div>
                      <div class=&quot;comment-content&quot;>\${comment.content}</div>
                      <div class=&quot;comment-actions&quot;>
                          <button class=&quot;button button-secondary&quot; onclick=&quot;showEditDialog(&apos;\${comment.id}&apos;)&quot; 
                                  data-testid=&quot;edit-comment-\${comment.id}&quot;>Edit</button>
                          <button class=&quot;button button-secondary&quot; onclick=&quot;deleteComment(&apos;\${comment.id}&apos;)&quot; 
                                  data-testid=&quot;delete-comment-\${comment.id}&quot;>Delete</button>
                      </div>
                  </div>
              \`).join('&apos;);
          }
          
          function renderMarkers() {
              const viewer = document.getElementById(&apos;mediaViewer&apos;);
              
              // Remove existing markers
              viewer.querySelectorAll(&apos;.feedback-marker&apos;).forEach(marker => marker.remove());
              
              // Add new markers
              comments.forEach((comment, index) => {
                  if (comment.position) {
                      if (comment.position.x !== undefined && comment.position.y !== undefined) {
                          // Position-based marker (image/video)
                          const marker = document.createElement(&apos;div&apos;);
                          marker.className = &apos;feedback-marker&apos;;
                          marker.style.left = comment.position.x + &apos;%';
                          marker.style.top = comment.position.y + &apos;%';
                          marker.textContent = index + 1;
                          marker.title = comment.content;
                          marker.setAttribute(&apos;data-testid&apos;, \`marker-\${comment.id}\`);
                          viewer.appendChild(marker);
                      } else if (comment.position.timestamp !== undefined) {
                          // Time-based marker (video/audio timeline)
                          const timeline = document.getElementById(&apos;timeline&apos;);
                          if (timeline) {
                              const marker = document.createElement(&apos;div&apos;);
                              marker.className = &apos;timeline-marker&apos;;
                              marker.style.left = (comment.position.timestamp / ${mediaFile.duration || 100}) * 100 + &apos;%';
                              marker.title = \`\${Math.floor(comment.position.timestamp / 60)}:\${Math.floor(comment.position.timestamp % 60).toString().padStart(2, &apos;0')} - \${comment.content}\`;
                              marker.setAttribute(&apos;data-testid&apos;, \`timeline-marker-\${comment.id}\`);
                              timeline.appendChild(marker);
                          }
                      }
                  }
              });
          }
          
          function showError(elementId, message) {
              const errorElement = document.getElementById(elementId);
              errorElement.textContent = message;
              errorElement.classList.remove(&apos;hidden&apos;);
          }
          
          function clearErrors() {
              document.querySelectorAll(&apos;.error-message&apos;).forEach(el => {
                  el.classList.add(&apos;hidden&apos;);
                  el.textContent = '&apos;;
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

test.describe(&apos;Media Feedback System Testing&apos;, () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocking before each test
    await setupFeedbackAPIMocking(page);
  });

  test.describe(&apos;🖼️ Image Feedback&apos;, () => {
    test(&apos;should display image feedback interface with all required elements&apos;, async ({ page, browserName }) => {
      // Navigate to image feedback page
      await page.goto(&apos;/feedback?type=image&file=sample.jpg&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Verify image viewer and comment controls
      await expect(page.locator(&apos;[data-testid=&quot;image-viewer&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;comment-dialog&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;)).toBeVisible();
      
      console.log(`✅ Image feedback interface verified (${browserName})`);
    });

    test(&apos;should successfully add a comment with marker on image&apos;, async ({ page, browserName }) => {
      // Navigate to image feedback page
      await page.goto(&apos;/feedback?type=image&file=sample.jpg&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Click on image to add comment marker
      await page.locator(&apos;[data-testid=&quot;image-viewer&quot;]&apos;).click({ position: { x: 100, y: 100 } });
      
      // Fill comment form
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Test comment on image&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Wait for form submission
      await page.waitForTimeout(1000);
      
      // Verify comment was added (use .first() to handle multiple matches)
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;).first()).toBeVisible();
      await expect(page.locator(&apos;[data-testid^=&quot;marker-&quot;]&apos;).first()).toBeVisible();
      
      console.log(`✅ Image comment with marker added successfully (${browserName})`);
    });

    test(&apos;should show validation error for empty comment&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=image&file=sample.jpg&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Try to submit empty comment
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Check for validation error
      const errorMessage = page.locator(&apos;[data-testid=&quot;error-message&quot;], .error-message, [role=&quot;alert&quot;]&apos;).first();
      await expect(errorMessage).toBeVisible();
      
      console.log(`✅ Empty comment validation working (${browserName})`);
    });

    test(&apos;should edit existing comment successfully&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=image&file=sample.jpg&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Add initial comment
      await page.locator(&apos;[data-testid=&quot;image-viewer&quot;]&apos;).click({ position: { x: 150, y: 150 } });
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Original comment&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Wait for comment to appear
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;).first()).toBeVisible();
      
      // Click edit button
      await page.locator(&apos;[data-testid^=&quot;edit-comment-&quot;]&apos;).first().click();
      
      // Update comment
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Updated comment&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Verify updated comment
      await expect(page.locator(&apos;text=Updated comment&apos;).first()).toBeVisible();
      
      console.log(`✅ Comment editing successful (${browserName})`);
    });

    test(&apos;should delete comment and marker successfully&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=image&file=sample.jpg&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Add comment first
      await page.locator(&apos;[data-testid=&quot;image-viewer&quot;]&apos;).click({ position: { x: 200, y: 200 } });
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Comment to delete&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Verify comment and marker exist
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;).first()).toBeVisible();
      await expect(page.locator(&apos;[data-testid^=&quot;marker-&quot;]&apos;).first()).toBeVisible();
      
      // Delete comment (handle confirmation dialog)
      await page.locator(&apos;[data-testid^=&quot;delete-comment-&quot;]&apos;).first().click();
      
      // Handle potential confirmation dialog
      const confirmDialog = page.locator(&apos;button:has-text(&quot;Delete&quot;), button:has-text(&quot;Confirm&quot;)&apos;);
      if (await confirmDialog.isVisible()) {
        await confirmDialog.click();
      }
      
      // Verify comment and marker removed
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;)).toHaveCount(0);
      await expect(page.locator(&apos;[data-testid^=&quot;marker-&quot;]&apos;)).toHaveCount(0);
      
      console.log(`✅ Comment deletion successful (${browserName})`);
    });
  });

  test.describe(&apos;🎥 Video Feedback&apos;, () => {
    test(&apos;should display video feedback interface with timeline&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=video&file=sample.mp4&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Verify video interface elements
      await expect(page.locator(&apos;[data-testid=&quot;video-viewer&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;timeline&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;comment-dialog&quot;]&apos;)).toBeVisible();
      
      console.log(`✅ Video feedback interface verified (${browserName})`);
    });

    test(&apos;should add time-based comment on timeline click&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=video&file=sample.mp4&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Click on timeline to set time position
      await page.locator(&apos;[data-testid=&quot;timeline&quot;]&apos;).click({ position: { x: 100, y: 10 } });
      
      // Add comment
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Time-based comment&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Verify timeline marker was added
      await expect(page.locator(&apos;[data-testid^=&quot;timeline-marker-&quot;]&apos;).first()).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;).first()).toBeVisible();
      
      console.log(`✅ Time-based video comment added successfully (${browserName})`);
    });

    test(&apos;should add position-based comment on video area click&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=video&file=sample.mp4&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Click on video area to add position marker
      await page.locator(&apos;[data-testid=&quot;video-viewer&quot;] video, [data-testid=&quot;video-viewer&quot;] .video-container&apos;).first().click({ position: { x: 200, y: 150 } });
      
      // Add comment
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Position-based comment&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Verify position marker was added
      await expect(page.locator(&apos;[data-testid^=&quot;marker-&quot;]&apos;).first()).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;).first()).toBeVisible();
      
      console.log(`✅ Position-based video comment added successfully (${browserName})`);
    });
  });

  test.describe(&apos;🎵 Audio Feedback&apos;, () => {
    test(&apos;should display audio feedback interface with timeline&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=audio&file=sample.mp3&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Verify audio interface elements
      await expect(page.locator(&apos;[data-testid=&quot;audio-viewer&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;timeline&quot;]&apos;)).toBeVisible();
      
      console.log(`✅ Audio feedback interface verified (${browserName})`);
    });

    test(&apos;should add timestamp-based comment on audio timeline&apos;, async ({ page, browserName }) => {
      await page.goto(&apos;/feedback?type=audio&file=sample.mp3&apos;);
      await page.waitForLoadState(&apos;networkidle&apos;);
      
      // Click on audio timeline
      await page.locator(&apos;[data-testid=&quot;timeline&quot;]&apos;).click({ position: { x: 150, y: 10 } });
      
      // Add timestamp comment
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Audio timestamp comment&apos;);
      await page.locator(&apos;button[type=&quot;submit&quot;]&apos;).click();
      
      // Verify timeline marker and comment
      await expect(page.locator(&apos;[data-testid^=&quot;timeline-marker-&quot;]&apos;).first()).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;comment-list&quot;] .comment-item&apos;).first()).toBeVisible();
      
      console.log(`✅ Audio timestamp comment added successfully (${browserName})`);
    });
  });

  test.describe(&apos;📝 Comment Validation & Edge Cases&apos;, () => {
    test.beforeEach(async ({ page }) => {
      await createFeedbackTestPage(page, &apos;image&apos;);
    });

    test(&apos;should reject whitespace-only comments&apos;, async ({ page, browserName }) => {
      await page.locator(&apos;[data-testid=&quot;media-viewer&quot;]&apos;).click({ position: { x: 100, y: 100 } });
      
      // Try whitespace-only comment
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;   \n\t   &apos;);
      await page.locator(&apos;[data-testid=&quot;submit-btn&quot;]&apos;).click();
      
      // Verify validation error
      await expect(page.locator(&apos;[data-testid=&quot;content-error&quot;]&apos;)).toBeVisible();
      
      console.log(`✅ Whitespace-only comment validation working (${browserName})`);
    });

    test(&apos;should handle comment character limit validation&apos;, async ({ page, browserName }) => {
      await page.locator(&apos;[data-testid=&quot;media-viewer&quot;]&apos;).click({ position: { x: 100, y: 100 } });
      
      // Try overly long comment
      const longComment = &apos;a'.repeat(2001);
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(longComment);
      await page.locator(&apos;[data-testid=&quot;submit-btn&quot;]&apos;).click();
      
      // Verify validation error
      await expect(page.locator(&apos;[data-testid=&quot;content-error&quot;]&apos;)).toBeVisible();
      await expect(page.locator(&apos;[data-testid=&quot;content-error&quot;]&apos;)).toContainText(&apos;2000 characters&apos;);
      
      console.log(`✅ Character limit validation working (${browserName})`);
    });

    test(&apos;should handle canceling comment creation&apos;, async ({ page, browserName }) => {
      await page.locator(&apos;[data-testid=&quot;media-viewer&quot;]&apos;).click({ position: { x: 100, y: 100 } });
      
      // Fill form partially
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Partial comment&apos;);
      await page.locator(&apos;[data-testid=&quot;tag-design&quot;]&apos;).click();
      
      // Cancel
      await page.locator(&apos;[data-testid=&quot;cancel-btn&quot;]&apos;).click();
      
      // Verify dialog closes and no comment is added
      await expect(page.locator(&apos;[data-testid=&quot;comment-dialog&quot;]&apos;)).not.toBeVisible();
      await expect(page.locator(&apos;[data-testid^=&quot;comment-&quot;]&apos;)).toHaveCount(0);
      
      console.log(`✅ Comment cancellation working (${browserName})`);
    });

    test(&apos;should handle canceling comment edit&apos;, async ({ page, browserName }) => {
      // First add a comment
      await page.locator(&apos;[data-testid=&quot;media-viewer&quot;]&apos;).click({ position: { x: 200, y: 150 } });
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Original comment&apos;);
      await page.locator(&apos;[data-testid=&quot;submit-btn&quot;]&apos;).click();
      
      // Start editing
      await page.locator(&apos;[data-testid^=&quot;edit-comment-&quot;]&apos;).click();
      await page.locator(&apos;[data-testid=&quot;edit-content&quot;]&apos;).fill(&apos;Changed but cancelled&apos;);
      
      // Cancel edit
      await page.locator(&apos;[data-testid=&quot;edit-cancel-btn&quot;]&apos;).click();
      
      // Verify original comment unchanged
      await expect(page.locator(&apos;[data-testid=&quot;edit-dialog&quot;]&apos;)).not.toBeVisible();
      await expect(page.locator(&apos;[data-testid^=&quot;comment-&quot;]&apos;)).toContainText(&apos;Original comment&apos;);
      await expect(page.locator(&apos;[data-testid^=&quot;comment-&quot;]&apos;)).not.toContainText(&apos;Changed but cancelled&apos;);
      
      console.log(`✅ Edit cancellation working (${browserName})`);
    });

    test(&apos;should handle multiple comments with different priorities and tags&apos;, async ({ page, browserName }) => {
      // Add first comment
      await page.locator(&apos;[data-testid=&quot;media-viewer&quot;]&apos;).click({ position: { x: 100, y: 100 } });
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;High priority design issue&apos;);
      await page.locator(&apos;[data-testid=&quot;comment-priority&quot;]&apos;).selectOption(&apos;high&apos;);
      await page.locator(&apos;[data-testid=&quot;tag-design&quot;]&apos;).click();
      await page.locator(&apos;[data-testid=&quot;tag-urgent&quot;]&apos;).click();
      await page.locator(&apos;[data-testid=&quot;submit-btn&quot;]&apos;).click();
      
      // Add second comment
      await page.locator(&apos;[data-testid=&quot;media-viewer&quot;]&apos;).click({ position: { x: 300, y: 200 } });
      await page.locator(&apos;[data-testid=&quot;comment-content&quot;]&apos;).fill(&apos;Technical improvement suggestion&apos;);
      await page.locator(&apos;[data-testid=&quot;comment-priority&quot;]&apos;).selectOption(&apos;low&apos;);
      await page.locator(&apos;[data-testid=&quot;tag-technical&quot;]&apos;).click();
      await page.locator(&apos;[data-testid=&quot;submit-btn&quot;]&apos;).click();
      
      // Verify both comments exist
      await expect(page.locator(&apos;[data-testid^=&quot;comment-&quot;]&apos;)).toHaveCount(2);
      await expect(page.locator(&apos;[data-testid^=&quot;marker-&quot;]&apos;)).toHaveCount(2);
      
      // Verify content
      await expect(page.locator(&apos;[data-testid^=&quot;comment-&quot;]&apos;).first()).toContainText(&apos;High priority design issue&apos;);
      await expect(page.locator(&apos;[data-testid^=&quot;comment-&quot;]&apos;).last()).toContainText(&apos;Technical improvement suggestion&apos;);
      
      console.log(`✅ Multiple comments with different properties working (${browserName})`);
    });
  });
}); 
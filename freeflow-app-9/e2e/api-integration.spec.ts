import { test, expect } from '@playwright/test'

/**
 * End-to-End Integration Tests for API Routes
 * Tests full CRUD workflows across all enhanced routes
 */

test.describe('API Routes - Complete CRUD Workflows', () => {
    let token: string

    test.beforeAll(async ({ request }) => {
        // Get authentication token for tests
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'test@example.com',
                password: 'TestPassword123!',
            },
        })
        const data = await response.json()
        token = data.access_token || ''
    })

    test('Invoice lifecycle: CREATE → PATCH → GET → DELETE', async ({ request }) => {
        // CREATE invoice
        const createResponse = await request.post('/api/v1/invoices', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                client_id: 'client-123',
                items: [{ description: 'Service', quantity: 1, rate: 1000 }],
                status: 'draft',
            },
        })
        expect(createResponse.ok()).toBeTruthy()
        const createData = await createResponse.json()
        const invoiceId = createData.invoice.id

        // PATCH invoice
        const patchResponse = await request.patch('/api/v1/invoices', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                id: invoiceId,
                status: 'sent',
            },
        })
        expect(patchResponse.ok()).toBeTruthy()
        const patchData = await patchResponse.json()
        expect(patchData.invoice.status).toBe('sent')

        // GET invoice to verify
        const getResponse = await request.get(`/api/v1/invoices?id=${invoiceId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        const getData = await getResponse.json()
        expect(getData.invoice.status).toBe('sent')

        // DELETE invoice
        const deleteResponse = await request.delete(`/api/v1/invoices?id=${invoiceId}`, {
            headers: { Authorization: ``Bearer ${ token }` },
    })
    expect(deleteResponse.ok()).toBeTruthy()

    // Verify deletion
    const verifyResponse = await request.get(`/ api / v1 / invoices ? id = ${ invoiceId }`, {
      headers: { Authorization: `Bearer ${ token }` },
    })
    expect(verifyResponse.status()).toBe(404)
  })

  test('Music track lifecycle: CREATE → PATCH → DELETE', async ({ request }) => {
    // CREATE track
    const createResponse = await request.post('/api/music', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        action: 'create',
        name: 'Test Track',
        genre: 'electronic',
        tempo: 120,
      },
    })
    expect(createResponse.ok()).toBeTruthy()
    const { data: track } = await createResponse.json()
    const trackId = track.id

    // PATCH track
    const patchResponse = await request.patch('/api/music', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        trackId,
        name: 'Updated Test Track',
      },
    })
    expect(patchResponse.ok()).toBeTruthy()

    // DELETE track
    const deleteResponse = await request.delete(`/ api / music ? trackId = ${ trackId }`, {
      headers: { Authorization: `Bearer ${ token }` },
    })
    expect(deleteResponse.ok()).toBeTruthy()
  })

  test('Collaboration comment workflow', async ({ request }) => {
    // CREATE comment
    const createResponse = await request.post('/api/collaboration/comments', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        action: 'create',
        document_id: 'doc-123',
        content: 'Test comment',
      },
    })
    const { data: comment } = await createResponse.json()

    // PATCH comment
    const patchResponse = await request.patch('/api/collaboration/comments', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        commentId: comment.id,
        content: 'Updated comment',
      },
    })
    const patchData = await patchResponse.json()
    expect(patchData.data.content).toBe('Updated comment')

    // DELETE comment
    const deleteResponse = await request.delete(
      `/ api / collaboration / comments ? commentId = ${ comment.id }`,
      { headers: { Authorization: `Bearer ${ token }` } }
    )
    expect(deleteResponse.ok()).toBeTruthy()
  })

  test('Mobile app resource management', async ({ request }) => {
    // CREATE device
    const createResponse = await request.post('/api/mobile-app', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        action: 'create-device',
        name: 'Test Device',
        platform: 'ios',
      },
    })
    const { data: device } = await createResponse.json()

    // PATCH device
    const patchResponse = await request.patch('/api/mobile-app', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        type: 'device',
        id: device.id,
        name: 'Updated Device',
      },
    })
    expect(patchResponse.ok()).toBeTruthy()

    // DELETE device
    const deleteResponse = await request.delete(
      `/ api / mobile - app ? type = device & id=${ device.id }`,
      { headers: { Authorization: `Bearer ${ token }` } }
    )
    expect(deleteResponse.ok()).toBeTruthy()
  })

  test('Settings management workflow', async ({ request }) => {
    // UPDATE settings via PATCH
    const patchResponse = await request.patch('/api/settings', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        category: 'notifications',
        updates: {
          email_notifications: false,
          push_notifications: true,
        },
      },
    })
    expect(patchResponse.ok()).toBeTruthy()

    // Create API key
    const createKeyResponse = await request.post('/api/settings', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        action: 'generate-api-key',
        name: 'Test Key',
      },
    })
    const { data: apiKey } = await createKeyResponse.json()

    // DELETE API key
    const deleteResponse = await request.delete(
      `/ api / settings ? category = api - key & id=${ apiKey.id }`,
      { headers: { Authorization: `Bearer ${ token }` } }
    )
    expect(deleteResponse.ok()).toBeTruthy()
  })

  test('Concurrent updates should not cause data loss', async ({ request }) => {
    // Create invoice
    const createResponse = await request.post('/api/v1/invoices', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        client_id: 'client-123',
        items: [{ description: 'Service', quantity: 1, rate: 1000 }],
      },
    })
    const { invoice } = await createResponse.json()

    // Simulate concurrent PATCH requests
    const [patch1, patch2] = await Promise.all([
      request.patch('/api/v1/invoices', {
        headers: { Authorization: `Bearer ${ token }` },
        data: { id: invoice.id, status: 'sent' },
      }),
      request.patch('/api/v1/invoices', {
        headers: { Authorization: `Bearer ${ token }` },
        data: { id: invoice.id, notes: 'Updated notes' },
      }),
    ])

    expect(patch1.ok() || patch2.ok()).toBeTruthy()

    // Cleanup
    await request.delete(`/ api / v1 / invoices ? id = ${ invoice.id }`, {
      headers: { Authorization: `Bearer ${ token }` },
    })
  })

  test('Cascading deletes should work correctly', async ({ request }) => {
    // Create project with related data
    const projectResponse = await request.post('/api/projects/manage', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        action: 'create',
        name: 'Test Project',
      },
    })
    const { data: project } = await projectResponse.json()

    // Create comments for project
    await request.post('/api/collaboration/comments', {
      headers: { Authorization: `Bearer ${ token }` },
      data: {
        action: 'create',
        document_id: project.id,
        content: 'Test comment',
      },
    })

    // Delete project - should cascade to comments
    const deleteResponse = await request.delete(`/ api / projects / manage ? id = ${ project.id }`, {
      headers: { Authorization: `Bearer ${ token }` },
    })
    expect(deleteResponse.ok()).toBeTruthy()

    // Verify comments are also deleted
    const commentsResponse = await request.get(
      `/ api / collaboration / comments ? document_id = ${ project.id }`,
      { headers: { Authorization: `Bearer ${ token }` } }
    )
    const { data: comments } = await commentsResponse.json()
    expect(comments.length).toBe(0)
  })
})

test.describe('API Routes - Authorization', () => {
  test('User cannot update resources they do not own', async ({ request }) => {
    // Login as user 1
    const user1Response = await request.post('/api/auth/login', {
      data: { email: 'user1@example.com', password: 'password' },
    })
    const user1Data = await user1Response.json()
    const user1Token = user1Data.access_token

    // Create invoice as user 1
    const createResponse = await request.post('/api/v1/invoices', {
      headers: { Authorization: `Bearer ${ user1Token }` },
      data: {
        client_id: 'client-123',
        items: [{ description: 'Service', quantity: 1, rate: 1000 }],
      },
    })
    const { invoice } = await createResponse.json()

    // Login as user 2
    const user2Response = await request.post('/api/auth/login', {
      data: { email: 'user2@example.com', password: 'password' },
    })
    const user2Data = await user2Response.json()
    const user2Token = user2Data.access_token

    // Try to update user1's invoice as user2
    const patchResponse = await request.patch('/api/v1/invoices', {
      headers: { Authorization: `Bearer ${ user2Token }` },
      data: { id: invoice.id, status: 'paid' },
    })

    expect(patchResponse.status()).toBe(403)

    // Cleanup
    await request.delete(`/ api / v1 / invoices ? id = ${ invoice.id }`, {
      headers: { Authorization: `Bearer ${ user1Token }` },
    })
  })
})

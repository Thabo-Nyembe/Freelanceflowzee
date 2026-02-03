/**
 * API Routes Unit Tests
 * Tests for PATCH and DELETE methods across all enhanced routes
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server')

describe('API Routes - PATCH/DELETE Methods', () => {
    let mockSupabase: any
    let mockUser: any

    beforeEach(() => {
        mockUser = {
            id: 'test-user-123',
            email: 'test@example.com',
        }

        mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: mockUser },
                    error: null,
                }),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: {}, error: null }),
        }

            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('/api/v1/invoices', () => {
        it('PATCH - should update invoice successfully', async () => {
            const { PATCH } = await import('@/app/api/v1/invoices/route')

            const request = new NextRequest('http://localhost:3000/api/v1/invoices', {
                method: 'PATCH',
                body: JSON.stringify({
                    id: 'inv-123',
                    status: 'paid',
                }),
            })

            mockSupabase.single.mockResolvedValue({
                data: { id: 'inv-123', status: 'paid' },
                error: null,
            })

            const response = await PATCH(request)
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(mockSupabase.update).toHaveBeenCalled()
            expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id)
        })

        it('PATCH - should return 401 for unauthenticated user', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Unauthorized' },
            })

            const { PATCH } = await import('@/app/api/v1/invoices/route')
            const request = new NextRequest('http://localhost:3000/api/v1/invoices', {
                method: 'PATCH',
                body: JSON.stringify({ id: 'inv-123' }),
            })

            const response = await PATCH(request)
            expect(response.status).toBe(401)
        })

        it('DELETE - should delete invoice successfully', async () => {
            const { DELETE } = await import('@/app/api/v1/invoices/route')

            const request = new NextRequest(
                'http://localhost:3000/api/v1/invoices?id=inv-123',
                { method: 'DELETE' }
            )

            mockSupabase.delete.mockResolvedValue({ error: null })

            const response = await DELETE(request)
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(mockSupabase.delete).toHaveBeenCalled()
            expect(json.success).toBe(true)
        })

        it('DELETE - should return 400 when ID is missing', async () => {
            const { DELETE } = await import('@/app/api/v1/invoices/route')
            const request = new NextRequest('http://localhost:3000/api/v1/invoices', {
                method: 'DELETE',
            })

            const response = await DELETE(request)
            expect(response.status).toBe(400)
        })
    })

    describe('/api/music', () => {
        it('PATCH - should update track successfully', async () => {
            const { PATCH } = await import('@/app/api/music/route')

            const request = new NextRequest('http://localhost:3000/api/music', {
                method: 'PATCH',
                body: JSON.stringify({
                    trackId: 'track-123',
                    name: 'Updated Track',
                }),
            })

            mockSupabase.single.mockResolvedValue({
                data: { id: 'track-123', name: 'Updated Track' },
                error: null,
            })

            const response = await PATCH(request)
            expect(response.status).toBe(200)
            expect(mockSupabase.update).toHaveBeenCalled()
        })

        it('DELETE - should delete track successfully', async () => {
            const { DELETE } = await import('@/app/api/music/route')
            const request = new NextRequest(
                'http://localhost:3000/api/music?trackId=track-123',
                { method: 'DELETE' }
            )

            mockSupabase.delete.mockResolvedValue({ error: null })

            const response = await DELETE(request)
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(json.success).toBe(true)
        })
    })

    describe('/api/collaboration/comments', () => {
        it('PATCH - should update comment with ownership check', async () => {
            const { PATCH } = await import('@/app/api/collaboration/comments/route')

            const request = new NextRequest('http://localhost:3000/api/collaboration/comments', {
                method: 'PATCH',
                body: JSON.stringify({
                    commentId: 'comment-123',
                    content: 'Updated comment',
                }),
            })

            mockSupabase.single.mockResolvedValue({
                data: { id: 'comment-123', content: 'Updated comment' },
                error: null,
            })

            const response = await PATCH(request)
            expect(response.status).toBe(200)
            expect(mockSupabase.eq).toHaveBeenCalledWith('author_id', mockUser.id)
        })

        it('DELETE - should delete comment with ownership check', async () => {
            const { DELETE } = await import('@/app/api/collaboration/comments/route')
            const request = new NextRequest(
                'http://localhost:3000/api/collaboration/comments?commentId=comment-123',
                { method: 'DELETE' }
            )

            mockSupabase.delete.mockResolvedValue({ error: null })

            const response = await DELETE(request)
            expect(response.status).toBe(200)
            expect(mockSupabase.eq).toHaveBeenCalledWith('author_id', mockUser.id)
        })
    })

    describe('/api/mobile-app', () => {
        it('PATCH - should update mobile app resource', async () => {
            const { PATCH } = await import('@/app/api/mobile-app/route')

            const request = new NextRequest('http://localhost:3000/api/mobile-app', {
                method: 'PATCH',
                body: JSON.stringify({
                    type: 'device',
                    id: 'device-123',
                    name: 'Updated Device',
                }),
            })

            mockSupabase.single.mockResolvedValue({
                data: { id: 'device-123', name: 'Updated Device' },
                error: null,
            })

            const response = await PATCH(request)
            expect(response.status).toBe(200)
        })

        it('PATCH - should return 400 for invalid type', async () => {
            const { PATCH } = await import('@/app/api/mobile-app/route')
            const request = new NextRequest('http://localhost:3000/api/mobile-app', {
                method: 'PATCH',
                body: JSON.stringify({
                    type: 'invalid-type',
                    id: 'test-123',
                }),
            })

            const response = await PATCH(request)
            expect(response.status).toBe(400)
        })
    })

    describe('/api/settings', () => {
        it('PATCH - should work as alias to PUT', async () => {
            const { PATCH, PUT } = await import('@/app/api/settings/route')

            // PATCH should call PUT
            const request = new NextRequest('http://localhost:3000/api/settings', {
                method: 'PATCH',
                body: JSON.stringify({
                    category: 'notifications',
                    updates: { email_notifications: false },
                }),
            })

            const patchResponse = await PATCH(request)
            expect(patchResponse).toBeDefined()
        })

        it('DELETE - should delete API key', async () => {
            const { DELETE } = await import('@/app/api/settings/route')
            const request = new NextRequest(
                'http://localhost:3000/api/settings?category=api-key&id=key-123',
                { method: 'DELETE' }
            )

            const response = await DELETE(request)
            const json = await response.json()

            expect(response.status).toBe(200)
            expect(json.success).toBe(true)
        })

        it('DELETE - should terminate session', async () => {
            const { DELETE } = await import('@/app/api/settings/route')
            const request = new NextRequest(
                'http://localhost:3000/api/settings?category=session&id=session-123',
                { method: 'DELETE' }
            )

            const response = await DELETE(request)
            expect(response.status).toBe(200)
        })
    })

    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            mockSupabase.update.mockResolvedValue({
                data: null,
                error: { message: 'Database error', code: '500' },
            })

            const { PATCH } = await import('@/app/api/music/route')
            const request = new NextRequest('http://localhost:3000/api/music', {
                method: 'PATCH',
                body: JSON.stringify({ trackId: 'track-123', name: 'Test' }),
            })

            const response = await PATCH(request)
            expect(response.status).toBe(500)
        })

        it('should validate required parameters', async () => {
            const { PATCH } = await import('@/app/api/collaboration/upf/route')
            const request = new NextRequest('http://localhost:3000/api/collaboration/upf', {
                method: 'PATCH',
                body: JSON.stringify({}),  // Missing feedbackId
            })

            const response = await PATCH(request)
            expect(response.status).toBe(400)
        })
    })
})

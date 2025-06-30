"use client"

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { CommentDialog } from './comment-dialog'

interface CodeViewerProps {
  file: Record<string, unknown>
  comments: Record<string, unknown>[]
  onAddComment: (comments: Record<string, unknown>[]) => void
}

const sampleCode = `import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

import React, { useRef, useEffect, useReducer } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TemplateAnalysisService } from '@/lib/services/template-scoring-service'
import { CanvasState, Template } from './canvas-types'
import { canvasReducer } from './canvas-reducer'

interface AIEnhancedCanvasCollaborationProps {
  projectId: string
  className?: string
}

export function AIEnhancedCanvasCollaboration({
  projectId,
  className = 
}: AIEnhancedCanvasCollaborationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()
  const templateAnalysisService = new TemplateAnalysisService()

  const initialState: CanvasState = {
    objects: {},
    selectedObjects: [],
    activeTool: 'select',
    zoom: 1,
    pan: { x: 0, y: 0 },
    history: [],
    undoStack: [],
    redoStack: [],
    collaborators: [],
    aiAnalysisEnabled: true,
    selectedTemplate: null,
    templateAnalysis: null,
    cursors: []
  }

  const [state, dispatch] = useReducer(canvasReducer, initialState)

  useEffect(() => {
    if (state.selectedTemplate) {
      const analysis = templateAnalysisService.calculateTemplateScore(state.selectedTemplate)
      dispatch({ type: 'SET_TEMPLATE_ANALYSIS', analysis })
    }
  }, [state.selectedTemplate])

  const handleTemplateSelect = (template: Template) => {
    dispatch({ type: 'SET_TEMPLATE', template })
  }

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
      {state.templateAnalysis && (
        <div>
          <h3>Template Analysis</h3>
          <p>Score: {state.templateAnalysis.score}</p>
          <h4>Suggestions:</h4>
          <ul>
            {state.templateAnalysis.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
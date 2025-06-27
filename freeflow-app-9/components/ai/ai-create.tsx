"use client"

import { useState, useReducer } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import APIKeySettings from '../collaboration/simple-api-key-settings'

interface AssetGenerationState {
  userApiKeys: Record<string, string>
  selectedApiProvider: string
  showApiKeySettings: boolean
  userApiKeysValid: Record<string, boolean>
  costSavings: {
    monthly: number
    total: number
    freeCreditsUsed: number
    requestsThisMonth: number
  }
}

type Action =
  | { type: 'SET_USER_API_KEY'; payload: { provider: string; apiKey: string } }
  | { type: 'SET_API_PROVIDER'; payload: string }
  | { type: 'SET_API_KEY_VALID'; payload: { provider: string; isValid: boolean } }
  | { type: 'TOGGLE_API_KEY_SETTINGS'; payload: boolean }
  | { type: 'UPDATE_COST_SAVINGS'; payload: { monthly: number; freeCreditsUsed: number } }

const initialState: AssetGenerationState = {
  userApiKeys: {},
  selectedApiProvider: 'platform',
  showApiKeySettings: false,
  userApiKeysValid: {},
  costSavings: {
    monthly: 0,
    total: 0,
    freeCreditsUsed: 0,
    requestsThisMonth: 0
  }
}

function reducer(state: AssetGenerationState, action: Action): AssetGenerationState {
  switch (action.type) {
    case 'SET_USER_API_KEY':
      return {
        ...state,
        userApiKeys: {
          ...state.userApiKeys,
          [action.payload.provider]: action.payload.apiKey
        }
      }
    case 'SET_API_PROVIDER':
      return {
        ...state,
        selectedApiProvider: action.payload
      }
    case 'SET_API_KEY_VALID':
      return {
        ...state,
        userApiKeysValid: {
          ...state.userApiKeysValid,
          [action.payload.provider]: action.payload.isValid
        }
      }
    case 'TOGGLE_API_KEY_SETTINGS':
      return {
        ...state,
        showApiKeySettings: action.payload
      }
    case 'UPDATE_COST_SAVINGS':
      return {
        ...state,
        costSavings: {
          ...state.costSavings,
          monthly: action.payload.monthly,
          total: state.costSavings.total + action.payload.monthly,
          freeCreditsUsed: action.payload.freeCreditsUsed,
          requestsThisMonth: state.costSavings.requestsThisMonth + 1
        }
      }
    default:
      return state
  }
}

export default function AICreate() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <div data-testid="ai-create" className="container mx-auto px-4 py-8">
      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Assets</TabsTrigger>
          <TabsTrigger value="library">Asset Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate AI Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Generation form will go here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Asset Library</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Asset library will go here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Cost Savings Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Savings</p>
                    <p className="text-2xl font-bold">${state.costSavings.monthly}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Savings</p>
                    <p className="text-2xl font-bold">${state.costSavings.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Free Credits Used</p>
                    <p className="text-2xl font-bold">${state.costSavings.freeCreditsUsed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requests This Month</p>
                    <p className="text-2xl font-bold">{state.costSavings.requestsThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <APIKeySettings
              onApiKeyUpdate={(provider, apiKey, isValid) => {
                dispatch({ type: 'SET_USER_API_KEY', payload: { provider, apiKey } })
                dispatch({ type: 'SET_API_KEY_VALID', payload: { provider, isValid } })
                
                // Update cost savings based on provider
                const providerSavings = {
                  'openai': 12,
                  'anthropic': 15,
                  'google': 25,
                  'huggingface': 35
                }
                const newSavings = providerSavings[provider as keyof typeof providerSavings] || 10
                dispatch({
                  type: 'UPDATE_COST_SAVINGS',
                  payload: {
                    monthly: state.costSavings.monthly + newSavings,
                    freeCreditsUsed: state.costSavings.freeCreditsUsed + (isValid ? 5 : 0)
                  }
                })
              }}
              onProviderChange={(provider) => {
                dispatch({ type: 'SET_API_PROVIDER', payload: provider })
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

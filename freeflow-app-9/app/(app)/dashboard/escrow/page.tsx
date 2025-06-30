"use client"

import React, { useState, useReducer } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { DollarSign, CheckCircle, CreditCard, Shield, Clock, AlertCircle, User, Calendar, Unlock, Lock, Download, FileText } from 'lucide-react'


// Types
interface EscrowDeposit {
  id: string
  clientName: string
  clientEmail: string
  amount: number
  currency: string
  status: 'pending' | 'active' | 'completed' | 'disputed' | 'released'
  projectTitle: string
  projectId?: string
  createdAt: string
  releasedAt?: string
  completionPassword?: string
  progressPercentage: number
  milestones: EscrowMilestone[]
}

interface EscrowMilestone {
  id: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'completed'
  completedAt?: string
}

interface EscrowState {
  deposits: EscrowDeposit[]
  selectedDeposit: string | null
  loading: boolean
  error: string | null
}

type EscrowAction =
  | { type: 'SET_DEPOSITS'; deposits: EscrowDeposit[] }
  | { type: 'SELECT_DEPOSIT'; depositId: string }
  | { type: 'UPDATE_DEPOSIT'; depositId: string; updates: Partial<EscrowDeposit> }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RELEASE_FUNDS'; depositId: string; password: string }
  | { type: 'COMPLETE_MILESTONE'; depositId: string; milestoneId: string }

function escrowReducer(state: EscrowState, action: EscrowAction): EscrowState {
  switch (action.type) {
    case 'SET_DEPOSITS':
      return { ...state, deposits: action.deposits, loading: false }
    case 'SELECT_DEPOSIT':
      return { ...state, selectedDeposit: action.depositId }
    case 'UPDATE_DEPOSIT':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? { ...deposit, ...action.updates }
            : deposit
        )
      }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'RELEASE_FUNDS':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? { ...deposit, status: 'released', releasedAt: new Date().toISOString() }
            : deposit
        )
      }
    case 'COMPLETE_MILESTONE':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.id === action.depositId
            ? {
                ...deposit,
                milestones: deposit.milestones.map(milestone =>
                  milestone.id === action.milestoneId
                    ? { ...milestone, status: 'completed', completedAt: new Date().toISOString() }
                    : milestone
                ),
                progressPercentage: Math.round(
                  (deposit.milestones.filter(m => m.status === 'completed').length / deposit.milestones.length) * 100
                )
              }
            : deposit
        )
      }
    default:
      return state
  }
}

// Sample data
const initialDeposits: EscrowDeposit[] = [
  {
    id: 'esc_001',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@company.com',
    amount: 5000,
    currency: 'USD',
    status: 'active',
    projectTitle: 'Brand Identity & Website Design',
    projectId: 'proj_001',
    createdAt: '2024-01-15T10:00:00Z',
    completionPassword: 'BRD2024!',
    progressPercentage: 75,
    milestones: [
      {
        id: 'ms_001',
        title: 'Logo Design',
        description: 'Create brand logo and variations',
        amount: 1500,
        status: 'completed',
        completedAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 'ms_002',
        title: 'Brand Guidelines',
        description: 'Complete brand style guide',
        amount: 1000,
        status: 'completed',
        completedAt: '2024-01-25T16:00:00Z'
      },
      {
        id: 'ms_003',
        title: 'Website Design',
        description: 'Homepage and key pages design',
        amount: 2000,
        status: 'completed',
        completedAt: '2024-02-01T11:00:00Z'
      },
      {
        id: 'ms_004',
        title: 'Final Delivery',
        description: 'All files and documentation',
        amount: 500,
        status: 'pending'
      }
    ]
  },
  {
    id: 'esc_002',
    clientName: 'Tech Startup Inc.',
    clientEmail: 'projects@techstartup.io',
    amount: 8500,
    currency: 'USD',
    status: 'active',
    projectTitle: 'Mobile App UI/UX Design',
    projectId: 'proj_002',
    createdAt: '2024-02-01T09:00:00Z',
    progressPercentage: 40,
    milestones: [
      {
        id: 'ms_005',
        title: 'User Research',
        description: 'User interviews and personas',
        amount: 2000,
        status: 'completed',
        completedAt: '2024-02-05T13:00:00Z'
      },
      {
        id: 'ms_006',
        title: 'Wireframes',
        description: 'App wireframes and user flow',
        amount: 2500,
        status: 'completed',
        completedAt: '2024-02-12T15:30:00Z'
      },
      {
        id: 'ms_007',
        title: 'UI Design',
        description: 'High-fidelity UI screens',
        amount: 3000,
        status: 'pending'
      },
      {
        id: 'ms_008',
        title: 'Prototype',
        description: 'Interactive prototype',
        amount: 1000,
        status: 'pending'
      }
    ]
  }
]

export default function EscrowPage() {
  const [state, dispatch] = useReducer(escrowReducer, {
    deposits: initialDeposits,
    selectedDeposit: null,
    loading: false,
    error: null
  })

  const [releasePassword, setReleasePassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState<string | null>(null)

  const handleReleaseFunds = (depositId: string) => {
    const deposit = state.deposits.find(d => d.id === depositId)
    if (deposit && releasePassword === deposit.completionPassword) {
      dispatch({ type: 'RELEASE_FUNDS', depositId, password: releasePassword })
      setShowPasswordForm(null)
      setReleasePassword('')
    } else {
      dispatch({ type: 'SET_ERROR', error: 'Invalid password' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'disputed': return 'bg-red-100 text-red-800'
      case 'released': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalEscrowValue = state.deposits.reduce((sum, deposit) => sum + deposit.amount, 0)
  const activeDeposits = state.deposits.filter(d => d.status === 'active').length
  const completedProjects = state.deposits.filter(d => d.status === 'released').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            💰 Escrow Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure payment management for your freelance projects
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            data-testid="create-deposit-btn"
            variant="outline"
            onClick={() => {
              console.log('Create deposit clicked');
              alert('Create deposit dialog opened!');
            }}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Create Deposit
          </Button>
          <Button 
            data-testid="add-milestone-btn"
            variant="outline"
            onClick={() => {
              console.log('Add milestone clicked');
              alert('Add milestone dialog opened!');
            }}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
          <Button 
            data-testid="create-escrow-btn"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            onClick={() => {
              console.log('Create escrow clicked');
              alert('Create escrow dialog opened!');
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Create Escrow
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">Total Escrow Value</CardTitle>
                <DollarSign className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">${totalEscrowValue.toLocaleString()}</div>
                <p className="text-xs text-indigo-600 mt-1">Across all projects</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Active Deposits</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{activeDeposits}</div>
                <p className="text-xs text-blue-600 mt-1">Currently secured</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{completedProjects}</div>
                <p className="text-xs text-green-600 mt-1">Funds released</p>
              </CardContent>
            </Card>
          </div>

          {/* Escrow Deposits List */}
          <div className="grid gap-6">
            {state.deposits.map((deposit) => (
              <Card key={deposit.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">{deposit.projectTitle}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {deposit.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(deposit.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">${deposit.amount.toLocaleString()}</div>
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Project Progress</span>
                      <span>{deposit.progressPercentage}%</span>
                    </div>
                    <Progress value={deposit.progressPercentage} className="h-2" />
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Milestones</h4>
                    <div className="grid gap-3">
                      {deposit.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{milestone.title}</div>
                              <div className="text-sm text-gray-600">{milestone.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">${milestone.amount.toLocaleString()}</div>
                            {milestone.completedAt && (
                              <div className="text-xs text-gray-500">
                                {new Date(milestone.completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {deposit.status === 'active' && deposit.progressPercentage === 100 && (
                      <>
                        {showPasswordForm === deposit.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="password"
                              placeholder="Enter completion password"
                              value={releasePassword}
                              onChange={(e) => setReleasePassword(e.target.value)}
                              className="px-3 py-2 border rounded-md flex-1"
                            />
                            <Button 
                              data-testid="release-funds-btn"
                              onClick={() => handleReleaseFunds(deposit.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Release
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setShowPasswordForm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            data-testid="release-funds-btn"
                            onClick={() => setShowPasswordForm(deposit.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Release Funds
                          </Button>
                        )}
                      </>
                    )}
                    
                    {deposit.status === 'released' && (
                      <Button 
                        data-testid="download-receipt-btn"
                        variant="outline" 
                        className="text-green-600 border-green-600"
                        onClick={() => {
                          console.log('Download receipt clicked');
                          alert('Receipt downloaded!');
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                      </Button>
                    )}

                    <Button 
                      data-testid="view-details-btn"
                      variant="outline"
                      onClick={() => {
                        console.log('View details clicked');
                        alert('Project details opened!');
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5" />
              {state.error}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Completed Projects</h3>
            <p className="text-gray-600">Your completed projects with released funds will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pending Deposits</h3>
            <p className="text-gray-600">Deposits waiting for client confirmation will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Detailed analytics and reports coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cross-Feature Navigation - Temporarily commented out */}
      {/*
      <div className="mt-12 pt-8 border-t border-gray-200">
        <FeatureNavigation 
          currentFeature="escrow"
          variant="compact"
          title="Access Other Features"
          subtitle="Navigate to other platform features"
        />
      </div>
      */}
    </div>
  )
} 
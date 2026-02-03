'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Wrench, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

const orders = [{id:'WO-001',title:'Repair Office AC',priority:'high',status:'in-progress',assignee:'John M.',created:'2024-02-01'},{id:'WO-002',title:'Replace Printer Toner',priority:'low',status:'open',assignee:null,created:'2024-02-01'}]

export default function WorkOrdersClient(){return(<div className="flex-1 p-6 space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold flex items-center gap-2"><Wrench className="h-8 w-8"/>Work Orders</h1><p className="text-muted-foreground mt-1">Manage maintenance work orders</p></div><Button><Plus className="h-4 w-4 mr-2"/>Create Order</Button></div><CollapsibleInsightsPanel title="Work Orders Overview" insights={[{icon:Wrench,title:'45',description:'Total orders'},{icon:Clock,title:'18',description:'In progress'},{icon:CheckCircle,title:'25',description:'Completed'},{icon:AlertTriangle,title:'2',description:'Overdue'}]} defaultExpanded={true}/><div className="space-y-3">{orders.map(o=><Card key={o.id}><CardContent className="p-4"><div className="flex justify-between mb-2"><div><div className="flex items-center gap-2 mb-1"><Badge variant="outline">{o.id}</Badge><h4 className="font-semibold">{o.title}</h4></div><p className="text-sm text-muted-foreground">Created: {o.created}</p></div><div className="flex gap-2"><Badge className={o.priority==='high'?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}>{o.priority}</Badge><Badge className={o.status==='in-progress'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}>{o.status}</Badge></div></div><p className="text-sm">Assigned to: {o.assignee||'Unassigned'}</p></CardContent></Card>)}</div></div>)}

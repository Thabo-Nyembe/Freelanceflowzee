'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Truck, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

const shipments = [{id:'SHP-001',supplier:'Supplier A',status:'in-transit',items:45,eta:'2024-02-05'},{id:'SHP-002',supplier:'Supplier B',status:'delivered',items:120,eta:'2024-02-01'}]

export default function SupplyChainClient(){return(<div className="flex-1 p-6 space-y-6"><h1 className="text-3xl font-bold flex items-center gap-2"><Truck className="h-8 w-8"/>Supply Chain</h1><CollapsibleInsightsPanel title="Supply Chain Overview" insights={[{icon:Truck,title:'12',description:'Active shipments'},{icon:CheckCircle,title:'145',description:'Delivered this month'},{icon:AlertTriangle,title:'3',description:'Delayed'},{icon:TrendingUp,title:'98%',description:'On-time rate'}]} defaultExpanded={true}/><div className="space-y-3">{shipments.map(s=><Card key={s.id}><CardContent className="p-4"><div className="flex justify-between"><div><Badge variant="outline">{s.id}</Badge><h4 className="font-semibold mt-1">{s.supplier}</h4></div><Badge className={s.status==='delivered'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}>{s.status}</Badge></div><div className="grid grid-cols-2 gap-4 text-sm mt-2"><div><p className="text-muted-foreground">Items</p><p className="font-bold">{s.items}</p></div><div><p className="text-muted-foreground">ETA</p><p className="font-medium">{s.eta}</p></div></div></CardContent></Card>)}</div></div>)}

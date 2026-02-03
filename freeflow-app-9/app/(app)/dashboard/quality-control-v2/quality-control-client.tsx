'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { CheckCircle, AlertTriangle, TrendingUp, XCircle } from 'lucide-react'

const inspections = [{id:'QC-001',product:'Product A',result:'passed',defects:0,inspector:'John S.',date:'2024-02-01'},{id:'QC-002',product:'Product B',result:'failed',defects:3,inspector:'Sarah M.',date:'2024-02-01'}]

export default function QualityControlClient(){return(<div className="flex-1 p-6 space-y-6"><h1 className="text-3xl font-bold flex items-center gap-2"><CheckCircle className="h-8 w-8"/>Quality Control</h1><CollapsibleInsightsPanel title="QC Overview" insights={[{icon:CheckCircle,title:'245',description:'Inspections'},{icon:TrendingUp,title:'96%',description:'Pass rate'},{icon:AlertTriangle,title:'8',description:'Failed'},{icon:XCircle,title:'2',description:'Critical defects'}]} defaultExpanded={true}/><div className="space-y-3">{inspections.map(i=><Card key={i.id}><CardContent className="p-4"><div className="flex justify-between mb-2"><div><Badge variant="outline">{i.id}</Badge><h4 className="font-semibold mt-1">{i.product}</h4></div><Badge className={i.result==='passed'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}>{i.result}</Badge></div><div className="grid grid-cols-3 gap-4 text-sm"><div><p className="text-muted-foreground">Defects</p><p className="font-bold">{i.defects}</p></div><div><p className="text-muted-foreground">Inspector</p><p className="font-medium">{i.inspector}</p></div><div><p className="text-muted-foreground">Date</p><p className="font-medium">{i.date}</p></div></div></CardContent></Card>)}</div></div>)}

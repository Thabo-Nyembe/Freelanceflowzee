'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Calendar, Wrench, Clock, CheckCircle } from 'lucide-react'

const schedules = [{id:'MNT-001',asset:'Server Rack A',type:'Preventive',scheduled:'2024-02-05',status:'upcoming'},{id:'MNT-002',asset:'HVAC System',type:'Inspection',scheduled:'2024-02-03',status:'upcoming'}]

export default function MaintenanceSchedulesClient(){return(<div className="flex-1 p-6 space-y-6"><h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="h-8 w-8"/>Maintenance Schedules</h1><CollapsibleInsightsPanel title="Maintenance Overview" insights={[{icon:Calendar,title:'24',description:'Scheduled'},{icon:Clock,title:'8',description:'This week'},{icon:CheckCircle,title:'156',description:'Completed'},{icon:Wrench,title:'98%',description:'Completion rate'}]} defaultExpanded={true}/><div className="space-y-3">{schedules.map(s=><Card key={s.id}><CardContent className="p-4"><div className="flex justify-between mb-2"><div><Badge variant="outline">{s.id}</Badge><h4 className="font-semibold mt-1">{s.asset}</h4></div><Badge className="bg-blue-100 text-blue-700">{s.type}</Badge></div><div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Scheduled</p><p className="font-medium">{s.scheduled}</p></div><div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{s.status}</p></div></div></CardContent></Card>)}</div></div>)}

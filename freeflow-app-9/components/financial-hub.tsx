"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EscrowSystem } from "@/components/escrow-system"
import { InvoiceCreator } from "@/components/invoice-creator"
import { Shield, FileText } from "lucide-react"

interface FinancialHubProps {
  onNavigate: (screen: string, subTab?: string) => void
}

export function FinancialHub({ onNavigate }: FinancialHubProps) {
  const [activeTab, setActiveTab] = useState("escrow")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Financial Hub</h2>
          <p className="text-lg text-slate-500 mt-1">Manage payments, escrow, and invoicing</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "escrow" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("escrow")}
          className={activeTab === "escrow" ? "bg-white shadow-sm" : ""}
        >
          <Shield className="h-4 w-4 mr-2" />
          Escrow & Payments
        </Button>
        <Button
          variant={activeTab === "invoices" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("invoices")}
          className={activeTab === "invoices" ? "bg-white shadow-sm" : ""}
        >
          <FileText className="h-4 w-4 mr-2" />
          Invoices
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "escrow" && <EscrowSystem />}
      {activeTab === "invoices" && <InvoiceCreator />}
    </div>
  )
}

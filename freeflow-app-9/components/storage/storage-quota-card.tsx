'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { HardDrive, TrendingUp, Cloud } from 'lucide-react'
import { useStorageData } from '@/lib/hooks/use-storage-data'
import { NumberFlow } from '@/components/ui/number-flow'

export function StorageQuotaCard() {
  const { quota, connections, loading } = useStorageData()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return { value: 0, unit: 'GB' }
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    return {
      value: Math.round((bytes / Math.pow(k, i)) * 100) / 100,
      unit: sizes[i]
    }
  }

  const totalStorage = formatBytes(quota.total)
  const usedStorage = formatBytes(quota.used)
  const availableStorage = formatBytes(quota.available)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-500" />
          Storage Quota
        </h2>
        {connections.length > 0 && (
          <Cloud className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />
          <div className="h-4 bg-gray-100 animate-pulse rounded" />
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Connect a storage provider to see your quota
          </p>
        </div>
      ) : (
        <>
          {/* Circular Progress */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - quota.usagePercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-gray-900">
                <NumberFlow
                  value={Math.round(quota.usagePercentage)}
                  format={{
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }}
                />
                <span className="text-lg">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Used</p>
            </div>
          </div>

          {/* Storage Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-xs text-blue-600 font-medium">USED</p>
                <p className="text-lg font-semibold text-blue-900">
                  <NumberFlow
                    value={usedStorage.value}
                    format={{
                      style: 'decimal',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }}
                  />
                  {' '}
                  {usedStorage.unit}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-xs text-green-600 font-medium">AVAILABLE</p>
                <p className="text-lg font-semibold text-green-900">
                  <NumberFlow
                    value={availableStorage.value}
                    format={{
                      style: 'decimal',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }}
                  />
                  {' '}
                  {availableStorage.unit}
                </p>
              </div>
              <HardDrive className="w-5 h-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600 font-medium">TOTAL</p>
                <p className="text-lg font-semibold text-gray-900">
                  <NumberFlow
                    value={totalStorage.value}
                    format={{
                      style: 'decimal',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }}
                  />
                  {' '}
                  {totalStorage.unit}
                </p>
              </div>
              <Cloud className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Providers Count */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Across {connections.length} connected{' '}
              {connections.length === 1 ? 'provider' : 'providers'}
            </p>
          </div>
        </>
      )}
    </Card>
  )
}

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CollaborationUser } from '@/lib/types/collaboration'

interface PresenceProps {
  users: CollaborationUser[]
  maxDisplayed?: number
  showTooltip?: boolean
  className?: string
}

export function Presence({
  users,
  maxDisplayed = 5,
  showTooltip = true,
  className
}: PresenceProps) {
  const activeUsers = users.filter(user => user.status !== 'offline')
  const displayedUsers = activeUsers.slice(0, maxDisplayed)
  const remainingCount = Math.max(0, activeUsers.length - maxDisplayed)

  return (
    <div className={className}>
      <div className="flex items-center -space-x-2">
        <AnimatePresence>
          {displayedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback
                          style={{ backgroundColor: user.color }}
                          className="text-white"
                        >
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          user.status === 'online'
                            ? 'bg-green-500'
                            : user.status === 'away'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`}
                      />
                    </div>
                  </TooltipTrigger>
                  {showTooltip && (
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}

          {remainingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-white bg-gray-100">
                        <AvatarFallback className="text-sm text-gray-600">
                          +{remainingCount}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  {showTooltip && (
                    <TooltipContent>
                      <div className="text-sm">
                        <p>{remainingCount} more active users</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Users Count */}
      <div className="mt-2 text-sm text-gray-500">
        {activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
} 
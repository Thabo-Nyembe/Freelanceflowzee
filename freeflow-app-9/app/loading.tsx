'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background" role="main">
      {/* Animated KAZI Logo Loader */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo Animation */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-2xl font-bold text-white">K</span>
          </div>

          {/* Pulse ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-2xl bg-violet-500"
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-lg font-semibold text-foreground">KAZI</h2>
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </motion.div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-full w-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
          />
        </div>
      </motion.div>
    </main>
  )
}

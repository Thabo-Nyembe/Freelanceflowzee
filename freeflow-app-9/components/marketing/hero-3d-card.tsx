"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const Card3D = () => {
    return (
        <div className="relative group w-full h-full perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden aspect-video">
                {/* Top Bar Mockup */}
                <div className="h-6 w-full bg-slate-800/50 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>

                {/* Content - Replace with an actual dashboard screenshot or built-out UI */}
                <div className="p-8 grid grid-cols-12 gap-4 h-full relative">
                    {/* Sidebar */}
                    <div className="col-span-2 space-y-3">
                        <div className="h-8 w-8 bg-blue-500 rounded-lg mb-6" />
                        <div className="h-2 w-16 bg-slate-700 rounded" />
                        <div className="h-2 w-12 bg-slate-700 rounded" />
                        <div className="h-2 w-14 bg-slate-700 rounded" />
                    </div>

                    {/* Main */}
                    <div className="col-span-10 grid grid-cols-2 gap-4">
                        <div className="col-span-2 h-24 bg-slate-800/50 rounded-lg border border-white/5 p-4">
                            <div className="h-4 w-32 bg-slate-700 rounded mb-2" />
                            <div className="h-2 w-48 bg-slate-700/50 rounded" />
                        </div>
                        <div className="h-32 bg-slate-800/50 rounded-lg border border-white/5" />
                        <div className="h-32 bg-slate-800/50 rounded-lg border border-white/5" />
                    </div>

                    {/* Floating Element 1 - Notification */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute top-12 right-12 bg-slate-800 border border-blue-500/30 shadow-xl shadow-blue-500/10 p-3 rounded-lg flex items-center gap-3 w-48"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">AI</div>
                        <div>
                            <div className="h-2 w-20 bg-slate-600 rounded mb-1" />
                            <div className="h-2 w-12 bg-slate-700 rounded" />
                        </div>
                    </motion.div>

                    {/* Floating Element 2 - Payment Success */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="absolute bottom-12 left-24 bg-emerald-950/90 border border-emerald-500/30 shadow-xl shadow-emerald-500/10 p-3 rounded-lg flex items-center gap-3"
                    >
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</div>
                        <div className="text-emerald-400 text-xs font-semibold">
                            Payment Released: $2,400
                        </div>
                    </motion.div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
        </div>
    )
}

export const Hero3DCard = () => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="relative w-full h-full"
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full"
            >
                <Card3D />
            </div>
        </motion.div>
    );
};

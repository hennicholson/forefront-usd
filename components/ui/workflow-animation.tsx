"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowAnimationProps {
  className?: string;
  nodes?: {
    label: string;
    icon?: React.ReactNode;
  }[];
  title?: string;
  lightColor?: string;
}

const WorkflowAnimation = ({
  className,
  nodes,
  title,
  lightColor = "#8b5cf6",
}: WorkflowAnimationProps) => {
  const defaultNodes = [
    { label: "Prompt", icon: "💬" },
    { label: "AI Tool", icon: "🔧" },
    { label: "Action", icon: "⚡" },
    { label: "Result", icon: "✓" },
  ];

  const displayNodes = nodes || defaultNodes;

  return (
    <div
      className={cn(
        "relative flex h-[320px] w-full max-w-[500px] flex-col items-center",
        className
      )}
    >
      {/* SVG Paths  */}
      <svg
        className="h-full w-full text-zinc-700"
        width="100%"
        height="100%"
        viewBox="0 0 200 100"
      >
        <g
          stroke="currentColor"
          fill="none"
          strokeWidth="0.4"
          strokeDasharray="100 100"
          pathLength="100"
        >
          {/* Path 1 */}
          <path d="M 25 10 v 15 q 0 5 5 5 h 45 q 5 0 5 5 v 10" />
          {/* Path 2 */}
          <path d="M 62.5 10 v 10 q 0 5 5 5 h 8 q 5 0 5 5 v 10" />
          {/* Path 3 */}
          <path d="M 100 10 v 10 q 0 5 -5 5 h -10 q -5 0 -5 5 v 10" />
          {/* Path 4 */}
          <path d="M 137.5 10 v 10 q 0 5 5 5 h 8 q 5 0 5 5 v 10" />
          {/* Path 5 */}
          <path d="M 175 10 v 15 q 0 5 -5 5 h -45 q -5 0 -5 5 v 10" />
          {/* Animation For Path Starting */}
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1.2s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        </g>
        {/* Animated Lights */}
        <g mask="url(#wf-mask-1)">
          <circle
            className="workflow-light wf-light-1"
            cx="0"
            cy="0"
            r="10"
            fill="url(#wf-gradient)"
          />
        </g>
        <g mask="url(#wf-mask-2)">
          <circle
            className="workflow-light wf-light-2"
            cx="0"
            cy="0"
            r="10"
            fill="url(#wf-gradient)"
          />
        </g>
        <g mask="url(#wf-mask-3)">
          <circle
            className="workflow-light wf-light-3"
            cx="0"
            cy="0"
            r="10"
            fill="url(#wf-gradient)"
          />
        </g>
        <g mask="url(#wf-mask-4)">
          <circle
            className="workflow-light wf-light-4"
            cx="0"
            cy="0"
            r="10"
            fill="url(#wf-gradient)"
          />
        </g>
        <g mask="url(#wf-mask-5)">
          <circle
            className="workflow-light wf-light-5"
            cx="0"
            cy="0"
            r="10"
            fill="url(#wf-gradient)"
          />
        </g>

        {/* Node Badges */}
        <g stroke="currentColor" fill="none" strokeWidth="0.4">
          {displayNodes.map((node, idx) => {
            const xPos = 12 + idx * 37.5;
            return (
              <g key={idx}>
                <rect
                  fill="#18181b"
                  x={xPos}
                  y="5"
                  width="32"
                  height="10"
                  rx="5"
                  className="transition-all hover:fill-zinc-800"
                />
                <text
                  x={xPos + 16}
                  y="12"
                  fill="white"
                  stroke="none"
                  fontSize="5"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>

        <defs>
          {/* Masks for light paths */}
          <mask id="wf-mask-1">
            <path
              d="M 25 10 v 15 q 0 5 5 5 h 45 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="wf-mask-2">
            <path
              d="M 62.5 10 v 10 q 0 5 5 5 h 8 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="wf-mask-3">
            <path
              d="M 100 10 v 10 q 0 5 -5 5 h -10 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="wf-mask-4">
            <path
              d="M 137.5 10 v 10 q 0 5 5 5 h 8 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          <mask id="wf-mask-5">
            <path
              d="M 175 10 v 15 q 0 5 -5 5 h -45 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* Gradient */}
          <radialGradient id="wf-gradient" fx="1">
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Main Visualization Box */}
      <div className="absolute bottom-8 flex w-full flex-col items-center">
        {/* Bottom shadow */}
        <div className="absolute -bottom-4 h-[90px] w-[65%] rounded-lg bg-zinc-900/30 blur-xl" />

        {/* Title badge */}
        {title && (
          <div className="absolute -top-3 z-20 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5">
            <Sparkles className="size-3 text-purple-400" />
            <span className="ml-2 text-[10px] text-zinc-300">{title}</span>
          </div>
        )}

        {/* Center icon */}
        <div className="absolute -bottom-7 z-30 grid h-[55px] w-[55px] place-items-center rounded-full border border-zinc-800 bg-zinc-950 shadow-lg">
          <Zap className="size-5 text-purple-400" />
        </div>

        {/* Main content box */}
        <div className="relative z-10 flex h-[140px] w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50 shadow-xl backdrop-blur-sm">
          {/* Floating indicators */}
          <div className="absolute left-8 top-6 z-10 flex h-6 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[10px]">
            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-zinc-400">Active</span>
          </div>

          <div className="absolute right-8 top-6 z-10 hidden sm:flex h-6 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 text-[10px]">
            <ArrowRight className="size-3 text-zinc-500" />
            <span className="text-zinc-400">Flow</span>
          </div>

          {/* Animated circles */}
          <motion.div
            className="absolute -bottom-12 h-[90px] w-[90px] rounded-full border border-zinc-800/50"
            animate={{
              scale: [0.98, 1.02, 0.98],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-16 h-[130px] w-[130px] rounded-full border border-zinc-800/30"
            animate={{
              scale: [1, 1, 0.98, 1.02, 0.98],
              opacity: [0.2, 0.2, 0.4, 0.2, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-24 h-[170px] w-[170px] rounded-full border border-zinc-800/20"
            animate={{
              scale: [1, 1, 1, 0.98, 1.02, 0.98],
              opacity: [0.1, 0.1, 0.1, 0.3, 0.1, 0.1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowAnimation;

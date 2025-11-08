"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Animation variants for each grid item
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

/**
 * Props for the BentoDashboardGrid component.
 * Each prop represents a "slot" in the 4x5 grid.
 */
interface BentoDashboardGridProps {
  /** Slot 1: Progress Stats (tall left, spans 3 rows) */
  progressStats: React.ReactNode;
  /** Slot 2: Active Modules List */
  activeModules: React.ReactNode;
  /** Slot 3: Latest News */
  latestNews: React.ReactNode;
  /** Slot 4: My Submissions */
  mySubmissions: React.ReactNode;
  /** Slot 5: AI Portfolio */
  aiPortfolio: React.ReactNode;
  /** Slot 6: Student Network */
  studentNetwork: React.ReactNode;
  /** Slot 7: Submit Course */
  submitCourse: React.ReactNode;
  /** Slot 8: All Modules Grid (wide, spans 2 columns x 2 rows) */
  allModules: React.ReactNode;
  /** Slot 9: AI Workflows */
  aiWorkflows: React.ReactNode;
  /** Slot 10: Learning Analytics */
  learningAnalytics: React.ReactNode;
  /** Slot 11: Recent Activity (wide, spans 2 columns) */
  recentActivity: React.ReactNode;
  /** Optional class names for the grid container */
  className?: string;
}

/**
 * A responsive, animated bento grid layout component for the dashboard.
 * It arranges 11 content slots in a 4-column x 5-row grid layout.
 *
 * Grid Layout:
 * ┌─────────────┬─────────────┬─────────────┬─────────────┐
 * │  Progress   │   Active    │   Latest    │   My        │
 * │   Stats     │  Modules    │   News      │  Submissions│
 * │   (1x3)     │             │             │             │
 * │             ├─────────────┼─────────────┼─────────────┤
 * │             │    AI       │  Student    │   Submit    │
 * │             │  Portfolio  │  Network    │   Course    │
 * ├─────────────┼─────────────┼─────────────┼─────────────┤
 * │  All Modules (2x2)        │   AI        │  Learning   │
 * │                           │ Workflows   │  Analytics  │
 * │                           ├─────────────┴─────────────┤
 * │                           │  Recent Activity (2x1)    │
 * └───────────────────────────┴───────────────────────────┘
 */
export const BentoDashboardGrid = ({
  progressStats,
  activeModules,
  latestNews,
  mySubmissions,
  aiPortfolio,
  studentNetwork,
  submitCourse,
  allModules,
  aiWorkflows,
  learningAnalytics,
  recentActivity,
  className,
}: BentoDashboardGridProps) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        // Core grid layout: 1 col on mobile, 4 on desktop
        "grid w-full grid-cols-1 gap-6 md:grid-cols-4",
        // Defines 5 explicit rows on medium screens and up
        "md:grid-rows-5",
        // Use minmax to ensure cards can grow but have a minimum height
        "auto-rows-[minmax(180px,auto)]",
        className
      )}
    >
      {/* Slot 1: Progress Stats (Spans 3 rows) */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-3">
        {progressStats}
      </motion.div>

      {/* Slot 2: Active Modules */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {activeModules}
      </motion.div>

      {/* Slot 3: Latest News */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {latestNews}
      </motion.div>

      {/* Slot 4: My Submissions */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {mySubmissions}
      </motion.div>

      {/* Slot 5: AI Portfolio */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {aiPortfolio}
      </motion.div>

      {/* Slot 6: Student Network */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {studentNetwork}
      </motion.div>

      {/* Slot 7: Submit Course */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {submitCourse}
      </motion.div>

      {/* Slot 8: All Modules Grid (Spans 2 cols x 2 rows) */}
      <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
        {allModules}
      </motion.div>

      {/* Slot 9: AI Workflows */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {aiWorkflows}
      </motion.div>

      {/* Slot 10: Learning Analytics */}
      <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
        {learningAnalytics}
      </motion.div>

      {/* Slot 11: Recent Activity (Spans 2 cols) */}
      <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-1">
        {recentActivity}
      </motion.div>
    </motion.section>
  );
};

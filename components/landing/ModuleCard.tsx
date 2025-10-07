'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, User } from 'lucide-react'
import type { Module } from '@/lib/data/modules'

interface ModuleCardProps {
  module: Module
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Link href={`/modules/${module.slug}`}>
      <motion.div
        className="group relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-forefront-blue/50 transition-all"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={module.thumbnail}
            alt={module.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Category tag */}
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: module.categoryColor }}
          >
            {module.category.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-forefront-cyan transition-colors">
            {module.title}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {module.description}
          </p>

          {/* Instructor info */}
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={module.instructor.photo}
              alt={module.instructor.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-white">{module.instructor.name}</p>
              <p className="text-xs text-gray-500">{module.instructor.year} • {module.instructor.major}</p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{module.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{module.skillLevel}</span>
            </div>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 shadow-glow rounded-2xl" />
        </div>
      </motion.div>
    </Link>
  )
}

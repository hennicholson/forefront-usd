interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden max-w-xs">
        <div
          className="h-full bg-gradient-to-r from-forefront-blue to-forefront-cyan transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-400 font-medium">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}

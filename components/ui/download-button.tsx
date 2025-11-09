import { Button } from "@/components/ui/Button";
import { ChevronRight, Download } from "lucide-react";

interface DownloadButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isDownloading?: boolean;
}

export function DownloadButton({ onClick, disabled, isDownloading }: DownloadButtonProps) {
  return (
    <button
      className="group relative overflow-hidden bg-white text-black hover:bg-white h-14 px-8 text-lg font-semibold rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled || isDownloading}
    >
      {/* Main text that fades out */}
      <span className="relative z-20 mr-10 transition-opacity duration-500 group-hover:opacity-0 text-black">
        {isDownloading ? 'Preparing...' : 'Download Your Free Guide'}
      </span>

      {/* Text that fades in - positioned in the same place */}
      <span className="absolute inset-0 flex items-center pl-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100 text-black z-30">
        {isDownloading ? 'Preparing...' : 'Download Your Free Guide'}
      </span>

      {/* Sliding background with icon */}
      <i className="absolute right-1 top-1 bottom-1 rounded grid place-items-center transition-all duration-500 bg-gray-200 w-1/4 group-hover:w-[calc(100%-0.5rem)] group-hover:bg-gray-200 group-active:scale-95 z-10">
        {isDownloading ? (
          <div className="animate-spin h-4 w-4 border-2 border-gray-700 border-t-transparent rounded-full ml-auto mr-4" />
        ) : (
          <Download size={20} strokeWidth={2} aria-hidden="true" className="text-gray-700 ml-auto mr-4" />
        )}
      </i>
    </button>
  );
}
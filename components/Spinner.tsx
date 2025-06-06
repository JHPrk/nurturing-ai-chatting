import { UI_CONSTANTS } from "@/lib/constants";

export default function Spinner() {
  return (
    <div className="flex items-center space-x-2" data-testid="spinner">
      <div className="w-4 h-4 border-2 border-t-pink-500 border-gray-200 rounded-full animate-spin"></div>
      <span className="text-pink-900 text-sm">{UI_CONSTANTS.LOADING_MESSAGE}</span>
    </div>
  )
} 
"use client"

import { MapPin } from "lucide-react"

export function AnnouncementBar() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6">
      <div className="flex justify-start">
        <div className="relative">

          {/* Soft Glow */}
          <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>

          <div className="relative inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow">
            
            <MapPin className="size-4 text-emerald-600" />
            
            <span>
              Now available in <span className="font-semibold">Indore</span>
            </span>

          </div>
        </div>
      </div>
    </div>
  )
}
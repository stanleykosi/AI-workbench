"use client";

import React, { useState, useEffect } from "react";
import { MonitorIcon, SmartphoneIcon } from "lucide-react";

export function MobileNotice() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobileBreakpoint = 768; // md breakpoint
      const isMobileDevice = window.innerWidth < mobileBreakpoint;
      setIsMobile(isMobileDevice);
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return null; // Don't show on desktop
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-100 z-50 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Icon */}
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <MonitorIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="p-3 bg-gray-100 rounded-full">
            <SmartphoneIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Desktop Only
          </h1>
          <p className="text-gray-600 leading-relaxed">
            The AI Workbench is currently optimized for desktop computers.
            Please visit us on a larger screen to access all features and
            train your machine learning models.
          </p>
        </div>

        {/* Features list */}
        <div className="text-left space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Full dashboard experience</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Advanced model training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Real-time monitoring</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}

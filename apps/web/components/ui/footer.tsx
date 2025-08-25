import React from "react";
import Link from "next/link";
import { RocketIcon } from "@radix-ui/react-icons";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <RocketIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Workbench
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
              The enterprise-grade platform to streamline the creation, testing, and deployment of machine learning models for the Allora Network.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 AI Workbench. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-xs">
                Built with ❤️ for the Allora Network
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


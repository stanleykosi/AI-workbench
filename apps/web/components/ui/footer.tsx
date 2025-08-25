import React from "react";
import { RocketIcon, GitHubLogoIcon, ExternalLinkIcon } from "@radix-ui/react-icons";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Section - Branding and Copyright */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="flex items-center justify-center w-14 h-14">
              <img src="/icon.svg" alt="AI Workbench" className="h-12 w-12" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-700">
                AI Workbench
              </span>
              <p className="text-sm text-gray-500 mt-1">
                © 2025 AI Workbench. All rights reserved.
              </p>
            </div>
          </div>

          {/* Right Section - Icons and Attribution */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-400 mr-4">
              Built with ❤️ for the Allora Network
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <GitHubLogoIcon className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ExternalLinkIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


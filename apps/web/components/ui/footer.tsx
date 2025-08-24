import React from "react";
import Link from "next/link";
import { RocketIcon } from "@radix-ui/react-icons";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <RocketIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Workbench
              </span>
            </Link>
            <p className="text-gray-600 max-w-md">
              The enterprise-grade platform to streamline the creation, testing, and deployment of machine learning models for the Allora Network.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#help" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 AI Workbench. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#privacy" className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-gray-500 hover:text-gray-900 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

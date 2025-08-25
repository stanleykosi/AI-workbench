import React from "react";
import Link from "next/link";
import { RocketIcon } from "@radix-ui/react-icons";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center justify-center w-14 h-14">
              <img src="/icon.svg" alt="AI Workbench" className="h-12 w-12" />
            </div>
          </Link>


        </div>
      </div>
    </header>
  );
}


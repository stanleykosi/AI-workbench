import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RocketIcon, ArrowRightIcon } from "@radix-ui/react-icons";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.08)_1px,transparent_0)] bg-[length:24px_24px]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-6 shadow-lg">
            <RocketIcon className="h-10 w-10 text-blue-600" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl mb-6"
        >
          Welcome to the{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Workbench
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl leading-8 text-gray-600 max-w-3xl mx-auto mb-10"
        >
          The enterprise-grade platform to streamline the creation, testing, and deployment of machine learning models for the Allora Network.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          <Link
            href="/sign-in"
            className="px-8 py-4 text-gray-700 font-medium hover:text-gray-900 transition-colors duration-200 border border-gray-300 rounded-xl hover:border-gray-400"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 mb-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ML Model Development</h3>
            <p className="text-gray-600 text-sm">Build and train machine learning models with our comprehensive development tools and frameworks</p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧪</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Model Testing & Validation</h3>
            <p className="text-gray-600 text-sm">Comprehensive testing suite for model validation, performance analysis, and quality assurance</p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Allora Network Integration</h3>
            <p className="text-gray-600 text-sm">Seamlessly deploy and integrate your models with the Allora Network infrastructure</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


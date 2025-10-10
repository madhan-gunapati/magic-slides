'use client';
import AuthButton from "../components/AuthButton/page";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Magic Slides  Maker</h1>
        <p className="text-lg max-w-xl mx-auto">
          Create, modify, generate images, and download presentations effortlessly using AI prompts.
        </p>
      </header>

      {/* Login / Auth */}
      <div className="mb-12">
        <AuthButton />
      </div>

      {/* Features Section */}
      <section className="max-w-3xl text-center space-y-6">
        <h2 className="text-2xl font-semibold">Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Generate PPT slides from AI prompts</li>
          <li>Modify existing slides with AI</li>
          <li>Create AI-generated images for slides</li>
          <li>Download presentations instantly</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} AI PPT Maker. All rights reserved.
      </footer>
    </div>
  );
}

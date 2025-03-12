import FaceAnalysis from "./AnalyzeFace";
import { Brain, User, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-blue-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            AI Face Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced facial recognition powered by machine learning. Upload a photo or take one with your camera to analyze facial features, demographics, and more.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <User className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Facial Detection</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Accurate face detection and alignment for optimal analysis
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <Sparkles className="h-8 w-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get insights on age, gender, and ethnicity with confidence scores
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <Brain className="h-8 w-8 text-indigo-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Powered</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Utilizing advanced machine learning models for accurate results
            </p>
          </div>
        </div>

        {/* Main App Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <FaceAnalysis />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by advanced machine learning algorithms and neural networks.
          </p>
        </footer>
      </div>
    </main>
  );
}
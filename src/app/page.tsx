export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI Prompt Lab
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your intelligent prompt management system
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-block"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

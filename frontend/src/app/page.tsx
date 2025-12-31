'use client';

import { useState } from 'react';
import ModelComparison from '@/components/ModelComparison';
import LiveMetricsPanel from '@/components/LiveMetricsPanel';
import ThresholdSlider from '@/components/ThresholdSlider';

// Types for API response
interface PredictionResponse {
  error: any;
  fraud_probability: number;
  prediction: string;
  risk_level: string;
}

export default function Home() {
  // State management
  const [features, setFeatures] = useState<string>('');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Convert comma-separated string to array of numbers
      const featureArray = features
        .split(',')
        .map(f => parseFloat(f.trim()))
        .filter(f => !isNaN(f));

      console.log('Features count:', featureArray.length);
      console.log('Features array:', featureArray);

      if (featureArray.length === 0) {
        throw new Error('Please enter valid numeric features separated by commas');
      }
      
      if (featureArray.length !== 20) {
        throw new Error(`Please provide exactly 20 features. You provided ${featureArray.length}`);
      }

      // API call to FastAPI backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: featureArray,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      
      // Debug log to see what we're getting
      console.log('API Response:', data);
      
      if (data.error) {
        throw new Error(`Prediction error: ${data.error}`);
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeatures(e.target.value);
  };

  // Clear form
  const handleClear = () => {
    setFeatures('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🛡️ Fraud Detection System
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered transaction fraud analysis
          </p>
        </div>

        {/* Live Metrics Panel */}
        <div className="mb-8">
          <LiveMetricsPanel />
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="features"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Transaction Features
              </label>
              <textarea
                id="features"
                value={features}
                onChange={handleInputChange}
                placeholder="Enter 20 feature values separated by commas (e.g., 1.5, 2.3, 0.8, 4.2, -1.0, 0.3, 1.2, -0.5, 2.1, 0.9, -0.2, 1.8, 0.4, -1.2, 0.7, 1.1, -0.3, 2.0, 0.5, -0.8)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter exactly 20 numeric values separated by commas
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !features.trim()}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Check for Fraud'
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Analysis Result
                </h3>

                {/* Risk Level Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`inline-flex items-center px-8 py-4 rounded-full text-xl font-bold ${
                      result.risk_level === 'High Risk'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-300 dark:border-red-600'
                        : result.risk_level === 'Medium Risk'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-2 border-yellow-300 dark:border-yellow-600'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-300 dark:border-green-600'
                    }`}
                  >
                    {result.risk_level === 'High Risk' ? '🚨' : result.risk_level === 'Medium Risk' ? '⚠️' : '✅'} {result.risk_level}
                  </div>
                </div>

                {/* Risk Level Bands Info */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold text-green-800 dark:text-green-300">Low Risk</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">&lt; 30%</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Medium Risk</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">30–60%</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold text-red-800 dark:text-red-300">High Risk</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">&gt; 60%</div>
                  </div>
                </div>

                {/* Probability Display */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fraud Probability
                    </span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(result.fraud_probability * 100).toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden mb-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        result.fraud_probability > 0.6
                          ? 'bg-red-500'
                          : result.fraud_probability > 0.3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${result.fraud_probability * 100}%` }}
                    ></div>
                  </div>

                  {/* Risk Indicators */}
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                    <span>0%</span>
                    <span>30%</span>
                    <span>60%</span>
                    <span>100%</span>
                  </div>

                  {/* Band Markers */}
                  <div className="mt-3 relative h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
                  </div>
                  
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                    {result.risk_level === 'High Risk'
                      ? '🚨 High risk - Manual review recommended'
                      : result.risk_level === 'Medium Risk'
                      ? '⚠️ Medium risk - Proceed with caution'
                      : '✅ Low risk - Transaction appears legitimate'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Model Comparison Section */}
        {features.trim() && (
          <ModelComparison features={features} loading={loading} />
        )}

        {/* Threshold Slider Section */}
        <div className="mt-12">
          <ThresholdSlider />
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by FastAPI + Machine Learning</p>
          <p className="mt-1">Threshold: 0.41 (optimized)</p>
        </div>
      </div>
    </div>
  );
}

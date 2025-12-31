'use client';

import { useState, useEffect } from 'react';

interface MetricsData {
  threshold: number;
  recall: number;
  precision: number;
  f1_score: number;
  false_positives: number;
  false_positive_rate: number;
  true_positives: number;
  total_predicted_fraud: number;
  total_fraud_cases: number;
}

export default function ThresholdSlider() {
  const [threshold, setThreshold] = useState(0.41);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch metrics when threshold changes
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/threshold-metrics?threshold=${threshold}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(`Metrics error: ${data.error}`);
        }

        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the fetch
    const timer = setTimeout(fetchMetrics, 300);
    return () => clearTimeout(timer);
  }, [threshold]);

  // Get sensitivity label
  const getSensitivityLabel = (t: number): string => {
    if (t < 0.4) return 'Very High (Aggressive)';
    if (t < 0.45) return 'High';
    if (t < 0.55) return 'Balanced';
    if (t < 0.65) return 'Conservative';
    return 'Very Conservative';
  };

  // Get color based on recall
  const getRecallColor = (recall: number): string => {
    if (recall > 0.8) return 'text-green-600 dark:text-green-400';
    if (recall > 0.6) return 'text-blue-600 dark:text-blue-400';
    if (recall > 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get color based on false positives
  const getFPColor = (fp: number, total: number): string => {
    const fpRate = fp / total;
    if (fpRate > 0.15) return 'text-red-600 dark:text-red-400';
    if (fpRate > 0.1) return 'text-orange-600 dark:text-orange-400';
    if (fpRate > 0.05) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Fraud Sensitivity Threshold 🎚️
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Adjust the threshold to see how recall and false positives change in real-time
        </p>
      </div>

      {/* Slider Container */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-8 border border-blue-200 dark:border-blue-800">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white">
              Threshold Value
            </label>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {threshold.toFixed(2)}
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-300 rounded-full text-sm font-medium">
                {getSensitivityLabel(threshold)}
              </span>
            </div>
          </div>

          {/* Range Input */}
          <input
            type="range"
            min="0.3"
            max="0.7"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg appearance-none cursor-pointer slider"
            disabled={loading}
          />

          {/* Range Labels */}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>0.3 (More Frauds Caught)</span>
            <span>0.7 (Fewer False Alarms)</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Lower threshold (0.3):</strong> Catches more frauds but increases false alarms
            <br />
            <strong>Higher threshold (0.7):</strong> Fewer false alarms but misses more frauds
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recall Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recall (Hit Rate)</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className={`text-4xl font-bold ${getRecallColor(metrics.recall)} mb-2`}>
              {(metrics.recall * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metrics.true_positives} of {metrics.total_fraud_cases} frauds detected
            </p>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.recall * 100}%` }}
              ></div>
            </div>
          </div>

          {/* False Positives Card */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">False Positives</h3>
              <span className="text-2xl">⚠️</span>
            </div>
            <p className={`text-4xl font-bold ${getFPColor(metrics.false_positives, metrics.total_predicted_fraud || 1)} mb-2`}>
              {metrics.false_positives}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(metrics.false_positive_rate * 100).toFixed(1)}% of legitimate transactions
            </p>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(metrics.false_positive_rate * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Precision Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Precision (Reliability)</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {(metrics.precision * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confidence in fraud predictions
            </p>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-cyan-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.precision * 100}%` }}
              ></div>
            </div>
          </div>

          {/* F1 Score Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">F1 Score</h3>
              <span className="text-2xl">⚖️</span>
            </div>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {(metrics.f1_score * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Balance between recall and precision
            </p>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.f1_score * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Total Predicted Frauds */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Predicted Frauds</h3>
              <span className="text-2xl">🚨</span>
            </div>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {metrics.total_predicted_fraud}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Out of {metrics.total_fraud_cases} actual frauds
            </p>
          </div>

          {/* Actual Frauds */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-300 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Ground Truth</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {metrics.total_fraud_cases}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total fraud cases in dataset
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p className="font-semibold">Error Loading Metrics</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Insights Section */}
      {metrics && !error && (
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span>💡</span> Key Insights
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {threshold < 0.4 && (
              <li>
                ✓ <strong>Aggressive Detection:</strong> Your threshold is low, catching more fraud
                but expect higher false alarm rates.
              </li>
            )}
            {threshold >= 0.4 && threshold < 0.55 && (
              <li>
                ✓ <strong>Balanced Approach:</strong> Good trade-off between catching fraud and
                avoiding false alarms.
              </li>
            )}
            {threshold >= 0.55 && (
              <li>
                ✓ <strong>Conservative Mode:</strong> Your threshold is high, minimizing false
                alarms but may miss some frauds.
              </li>
            )}
            {metrics.recall > 0.85 && (
              <li>✓ Excellent recall rate - catching most fraudulent transactions.</li>
            )}
            {metrics.precision > 0.8 && (
              <li>✓ High precision - most flagged transactions are actually fraudulent.</li>
            )}
            {metrics.false_positives > 100 && (
              <li>
                ⚠️ Consider if {metrics.false_positives} false alarms per period is acceptable for your
                business.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* CSS for slider styling */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          border: 3px solid white;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
          border: 3px solid white;
        }

        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

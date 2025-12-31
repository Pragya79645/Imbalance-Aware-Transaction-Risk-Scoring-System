'use client';

import { useState } from 'react';
import AnomalyScoreMeter from './AnomalyScoreMeter';

interface ModelResult {
  fraud_probability: number;
  prediction: string;
  risk_level: string;
  threshold?: number;
  anomaly_score?: number;
  error?: string;
}

interface ComparisonResponse {
  random_forest: ModelResult | null;
  baseline: ModelResult | null;
  smote: ModelResult | null;
  isolation_forest: ModelResult | null;
  error?: string;
}

const MODEL_CONFIG = [
  {
    id: 'random_forest',
    label: 'Random Forest',
    color: 'orange',
    icon: '🌲',
    activeClass: 'bg-orange-500',
    inactiveClass: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
  },
  {
    id: 'baseline',
    label: 'Baseline Model',
    color: 'blue',
    icon: '📊',
    activeClass: 'bg-blue-500',
    inactiveClass: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200',
  },
  {
    id: 'smote',
    label: 'SMOTE Model',
    color: 'green',
    icon: '⚡',
    activeClass: 'bg-green-500',
    inactiveClass: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
  },
  {
    id: 'isolation_forest',
    label: 'Isolation Forest',
    color: 'red',
    icon: '🌳',
    activeClass: 'bg-red-500',
    inactiveClass: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
  },
];

interface ModelComparisonProps {
  features: string;
  loading: boolean;
}

export default function ModelComparison({ features, loading }: ModelComparisonProps) {
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [activeModel, setActiveModel] = useState<string>('random_forest');
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCompare = async () => {
    setComparing(true);
    setError('');
    setComparison(null);

    try {
      const featureArray = features
        .split(',')
        .map(f => parseFloat(f.trim()))
        .filter(f => !isNaN(f));

      if (featureArray.length !== 20) {
        throw new Error(`Please provide exactly 20 features. You provided ${featureArray.length}`);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/compare`, {
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

      const data: ComparisonResponse = await response.json();

      if (data.error) {
        throw new Error(`Comparison error: ${data.error}`);
      }

      setComparison(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setComparing(false);
    }
  };

  if (!comparison) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ⭐ Model Comparison
          </h2>
          <button
            onClick={handleCompare}
            disabled={comparing || loading || !features.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {comparing ? 'Comparing...' : 'Compare Models'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Compare predictions from different models using the same input features.
        </p>
      </div>
    );
  }

  const activeResult = comparison[activeModel as keyof ComparisonResponse];

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'text-green-600 dark:text-green-400';
      case 'Medium Risk':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'High Risk':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          ⭐ Model Comparison Results
        </h2>
        <button
          onClick={handleCompare}
          disabled={comparing || loading || !features.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {comparing ? 'Comparing...' : 'Re-Compare'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Model Toggle Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {MODEL_CONFIG.map(model => {
          const result = comparison[model.id as keyof ComparisonResponse];
          const isActive = activeModel === model.id;
          const hasError = result && typeof result === 'object' && 'error' in result;

          return (
            <button
              key={model.id}
              onClick={() => setActiveModel(model.id)}
              disabled={!result || Boolean(hasError)}
              className={`p-4 rounded-lg font-semibold transition-all duration-200 ${
                isActive
                  ? `${model.activeClass} text-white shadow-lg scale-105`
                  : hasError
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  : `${model.inactiveClass} hover:shadow-md`
              }`}
            >
              <div className="text-2xl mb-2">{model.icon}</div>
              <div>{model.label}</div>
            </button>
          );
        })}
      </div>

      {/* Active Model Result */}
      {activeResult && typeof activeResult === 'object' && !('error' in activeResult) && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {MODEL_CONFIG.find(m => m.id === activeModel)?.label} - Prediction
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fraud Probability */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Fraud Probability
              </p>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {(activeResult.fraud_probability * 100).toFixed(2)}%
                </div>
              </div>
              <div className="mt-3 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-2 rounded-full"
                  style={{
                    width: `${activeResult.fraud_probability * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Risk Level
              </p>
              <p className={`text-3xl font-bold ${getRiskColor(activeResult.risk_level)}`}>
                {activeResult.risk_level}
              </p>
            </div>

            {/* Prediction */}
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Prediction
              </p>
              <p
                className={`text-3xl font-bold ${
                  activeResult.prediction === 'Fraud'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {activeResult.prediction}
              </p>
            </div>
          </div>

          {/* Anomaly Score Meter - Isolation Forest */}
          {activeResult.anomaly_score !== undefined && (
            <div className="mt-6">
              <AnomalyScoreMeter
                anomalyScore={activeResult.anomaly_score}
                prediction={activeResult.prediction}
                fraudProbability={activeResult.fraud_probability}
              />
            </div>
          )}

          {/* Additional Info */}
          {activeResult.threshold && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Decision Threshold: <span className="font-semibold">{activeResult.threshold.toFixed(2)}</span></p>
            </div>
          )}
        </div>
      )}

      {activeResult && typeof activeResult === 'object' && 'error' in activeResult && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded">
          Model not available: {activeResult.error}
        </div>
      )}

      {/* Comparison Summary Table */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Comparison
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Model
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Fraud Probability
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Prediction
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Risk Level
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Anomaly Score
                </th>
              </tr>
            </thead>
            <tbody>
              {MODEL_CONFIG.map(model => {
                const result = comparison[model.id as keyof ComparisonResponse];
                return (
                  <tr
                    key={model.id}
                    className={`border-b border-gray-200 dark:border-gray-700 ${
                      activeModel === model.id
                        ? 'bg-purple-50 dark:bg-purple-900 bg-opacity-50'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setActiveModel(model.id)}
                        className="text-left font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                        disabled={!result || (typeof result === 'object' && 'error' in result)}
                      >
                        {model.icon} {model.label}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {result && typeof result === 'object' && !('error' in result) ? (
                        <span className="font-semibold">
                          {(result.fraud_probability * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {result && typeof result === 'object' && !('error' in result) ? (
                        <span
                          className={`font-semibold ${
                            result.prediction === 'Fraud'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {result.prediction}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {result && typeof result === 'object' && !('error' in result) ? (
                        <span className={getRiskColor(result.risk_level)}>
                          {result.risk_level}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {result && typeof result === 'object' && !('error' in result) && result.anomaly_score !== undefined ? (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {result.anomaly_score.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

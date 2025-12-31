'use client';

interface AnomalyScoreMeterProps {
  anomalyScore: number;
  prediction: string;
  fraudProbability: number;
}

export default function AnomalyScoreMeter({
  anomalyScore,
  prediction,
  fraudProbability,
}: AnomalyScoreMeterProps) {
  // Normalize anomaly score to 0-1 range
  // Typically Isolation Forest scores range from ~-0.5 to +0.5
  // Negative scores = anomalies, Positive scores = normal
  const normalizedScore = Math.max(0, Math.min(1, (anomalyScore + 0.5) * 1.5));
  
  // Determine anomaly intensity
  const getAnomalyIntensity = (score: number): string => {
    if (score > 0.8) return 'Extremely Unusual';
    if (score > 0.6) return 'Highly Unusual';
    if (score > 0.4) return 'Moderately Unusual';
    if (score > 0.2) return 'Slightly Unusual';
    return 'Normal Pattern';
  };

  const getAnomalyColor = (score: number): string => {
    if (score > 0.8) return 'from-red-600 to-red-500';
    if (score > 0.6) return 'from-orange-600 to-orange-500';
    if (score > 0.4) return 'from-yellow-600 to-yellow-500';
    if (score > 0.2) return 'from-blue-600 to-blue-500';
    return 'from-green-600 to-green-500';
  };

  const getAnomalyBgColor = (score: number): string => {
    if (score > 0.8) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (score > 0.6) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (score > 0.4) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (score > 0.2) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const getAnomalyTextColor = (score: number): string => {
    if (score > 0.8) return 'text-red-700 dark:text-red-300';
    if (score > 0.6) return 'text-orange-700 dark:text-orange-300';
    if (score > 0.4) return 'text-yellow-700 dark:text-yellow-300';
    if (score > 0.2) return 'text-blue-700 dark:text-blue-300';
    return 'text-green-700 dark:text-green-300';
  };

  const anomalyIntensity = getAnomalyIntensity(normalizedScore);

  return (
    <div className={`rounded-lg p-6 border-2 transition-all duration-500 ${getAnomalyBgColor(normalizedScore)}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          🔍 Anomaly Score Meter
          <span className="text-xs font-normal text-gray-600 dark:text-gray-400 ml-2">
            Unsupervised Learning (Isolation Forest)
          </span>
        </h4>
      </div>

      {/* Score Display */}
      <div className="flex items-baseline gap-2 mb-6">
        <div className={`text-4xl font-bold ${getAnomalyTextColor(normalizedScore)}`}>
          {normalizedScore.toFixed(2)}
        </div>
        <div className={`text-xl font-semibold ${getAnomalyTextColor(normalizedScore)}`}>
          ({anomalyIntensity})
        </div>
      </div>

      {/* Animated Meter Bar */}
      <div className="mb-4">
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 opacity-20"></div>
          
          {/* Animated fill */}
          <div
            className={`h-6 rounded-full bg-gradient-to-r ${getAnomalyColor(normalizedScore)} transition-all duration-700 ease-out shadow-lg flex items-center justify-end pr-2`}
            style={{ width: `${normalizedScore * 100}%` }}
          >
            {normalizedScore > 0.1 && (
              <span className="text-xs font-bold text-white opacity-80 animate-pulse">
                ⚠️
              </span>
            )}
          </div>
        </div>

        {/* Scale labels */}
        <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1 font-medium">
          <span>0.0 (Normal)</span>
          <span>0.25</span>
          <span>0.5</span>
          <span>0.75</span>
          <span>1.0 (Anomaly)</span>
        </div>
      </div>

      {/* Threshold zones */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        <div className="text-center">
          <div className="h-2 bg-green-500 rounded mb-1"></div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Normal</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">&lt; 0.2</p>
        </div>
        <div className="text-center">
          <div className="h-2 bg-blue-500 rounded mb-1"></div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Slight</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">0.2-0.4</p>
        </div>
        <div className="text-center">
          <div className="h-2 bg-yellow-500 rounded mb-1"></div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Moderate</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">0.4-0.6</p>
        </div>
        <div className="text-center">
          <div className="h-2 bg-orange-500 rounded mb-1"></div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">High</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">0.6-0.8</p>
        </div>
        <div className="text-center">
          <div className="h-2 bg-red-600 rounded mb-1"></div>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">Extreme</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">&gt; 0.8</p>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          <span className="font-semibold">Interpretation:</span>
        </p>
        <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Anomaly Score:</strong> Measures how unusual this transaction is based on feature patterns
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Higher score (→ 1.0):</strong> More anomalous/unusual transaction pattern
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Lower score (→ 0.0):</strong> Follows typical/normal transaction patterns
            </span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>
              <strong>Fraud Probability:</strong> {(fraudProbability * 100).toFixed(2)}% ({prediction})
            </span>
          </li>
        </ul>
      </div>

      {/* Unsupervised Learning Note */}
      <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
        <p className="text-xs text-indigo-800 dark:text-indigo-300">
          <strong>🤖 Unsupervised Learning:</strong> This score is computed by Isolation Forest, which detects anomalies
          without requiring labeled fraud/non-fraud examples. It identifies patterns that deviate significantly from the
          majority of transactions.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

interface Metrics {
  pr_auc: number;
  f1_score: number;
  recall_fraud: number;
  precision_fraud: number;
  threshold: number;
}

interface MetricsResponse {
  metrics: Metrics | null;
  explanation: string;
  error?: string;
}

export default function LiveMetricsPanel() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 30 seconds for "live" updates
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/metrics`);
      const data: MetricsResponse = await response.json();

      if (data.metrics) {
        setMetrics(data.metrics);
        setExplanation(data.explanation);
        setError('');
      } else {
        setError(data.error || 'Failed to load metrics');
        setMetrics(null);
      }
    } catch (err) {
      setError('Error connecting to metrics API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">⭐ Live Metrics Panel</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-6 border border-red-700">
        <h2 className="text-2xl font-bold text-white mb-4">⭐ Live Metrics Panel</h2>
        <p className="text-red-100">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">⭐ Live Metrics Panel</h2>
        <p className="text-slate-300">No metrics data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">⭐ Live Metrics Panel</h2>
        <button
          onClick={fetchMetrics}
          className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
          title="Refresh metrics"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* PR-AUC */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-5 border border-purple-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-200 text-sm font-medium">PR-AUC</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-purple-100">
            {(metrics.pr_auc * 100).toFixed(2)}%
          </p>
          <p className="text-purple-300 text-xs mt-2">
            Precision-Recall Area Under Curve
          </p>
        </div>

        {/* F1-Score */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-5 border border-blue-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-200 text-sm font-medium">F1-Score</span>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-4xl font-bold text-blue-100">
            {(metrics.f1_score * 100).toFixed(2)}%
          </p>
          <p className="text-blue-300 text-xs mt-2">
            Harmonic mean of precision & recall
          </p>
        </div>

        {/* Recall (Fraud Class) */}
        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-5 border border-red-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-200 text-sm font-medium">Recall (Fraud)</span>
            <span className="text-2xl">🚨</span>
          </div>
          <p className="text-4xl font-bold text-red-100">
            {(metrics.recall_fraud * 100).toFixed(2)}%
          </p>
          <p className="text-red-300 text-xs mt-2">
            % of frauds correctly identified
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4 border border-slate-600">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-xs font-medium">Precision (Fraud)</p>
            <p className="text-xl font-semibold text-slate-200">
              {(metrics.precision_fraud * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Decision Threshold</p>
            <p className="text-xl font-semibold text-slate-200">{metrics.threshold}</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg p-4">
        <p className="text-amber-200 text-sm">
          <span className="font-bold">Why accuracy is hidden 😏</span>
          <br />
          <span className="text-xs mt-2 block">{explanation}</span>
        </p>
      </div>
    </div>
  );
}

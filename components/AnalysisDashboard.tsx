import React, { useState } from 'react';
import { AnalysisResult, QualityMetric } from '../types';
import { CheckCircle, AlertCircle, Star, Edit, FileText, Sparkles } from './Icons';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onEditResume: () => void;
  onAutoFix: () => void;
  isOptimizing: boolean;
  analysisMode: 'jd' | 'general';
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onEditResume, onAutoFix, isOptimizing, analysisMode }) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'keywords'>('suggestions');

  // SVG Chart Logic
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const score = Math.min(Math.max(result.atsScore, 0), 100); // Clamp score
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'; 
    if (score >= 60) return 'text-yellow-400'; 
    return 'text-rose-500'; 
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#34d399'; 
    if (score >= 60) return '#facc15'; 
    return '#f43f5e'; 
  };

  const isGeneral = analysisMode === 'general';

  // Helper to normalize score to 0-10
  const normalizeScore = (rawScore: number) => {
    if (rawScore > 10) return rawScore / 10; // Assume it was 0-100
    return rawScore;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-12">
      {/* Left Column: Score & Quality */}
      <div className="lg:col-span-1 space-y-6">
        {/* ATS Score Card */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h2 className="text-lg font-semibold text-slate-100 mb-6 tracking-wide">
            {isGeneral ? "Resume Strength" : "ATS Match Score"}
          </h2>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#1e293b"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Progress Circle - glowing */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={getScoreStroke(score)}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(score)} drop-shadow-md`}>
                {score}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">Out of 100</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-300 mt-4 px-4 font-medium leading-relaxed">
            {score >= 80 ? (isGeneral ? "Strong resume! Professional and impactful." : "Excellent match! Your resume is well-optimized.") : 
             score >= 60 ? (isGeneral ? "Solid foundation, but has room for improvement." : "Good foundation, but needs specific tailoring.") : 
             (isGeneral ? "Needs work on clarity, impact, or formatting." : "Significant gaps found for this role.")}
          </p>
        </div>

        {/* Quality Breakdown */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50">
          <h3 className="text-md font-semibold text-slate-100 mb-5 flex items-center">
            <Star className="w-4 h-4 mr-2 text-indigo-400" /> Quality Metrics
          </h3>
          <div className="space-y-6">
            {(Object.entries(result.quality) as [string, QualityMetric][]).map(([key, metric]) => {
              const normalizedScore = normalizeScore(metric.score);
              const barWidth = Math.min(normalizedScore * 10, 100);
              
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300 capitalize tracking-wide">{key}</span>
                    <span className="text-xs text-slate-500 font-mono">{normalizedScore}/10</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                      style={{ width: `${barWidth}%`, backgroundColor: normalizedScore > 7 ? '#34d399' : normalizedScore > 4 ? '#facc15' : '#f43f5e' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 bg-slate-800/50 p-2.5 rounded border border-slate-700/50 leading-relaxed italic">
                    "{metric.feedback}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Summary & Detailed Recommendations */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        
        {/* Executive Summary */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-700/50">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg mr-3 border border-indigo-500/20">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Executive Summary</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-base">
            {result.summary}
          </p>
        </div>

        {/* Actions Bar - Auto Fix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={onAutoFix}
            disabled={isOptimizing}
            className={`group relative flex items-center justify-center p-4 rounded-xl transition-all shadow-lg overflow-hidden
              ${isOptimizing 
                ? 'bg-slate-800 cursor-not-allowed opacity-75' 
                : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'}`}
          >
            {/* Button Gradient overlay */}
            {!isOptimizing && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100 transition-opacity"></div>}
            
            <div className="relative flex items-center z-10 text-white">
              {isOptimizing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-3 animate-spin text-indigo-300" />
                  <span className="text-indigo-200">Processing...</span>
                </>
              ) : (
                <>
                  <div className="p-1.5 bg-white/10 rounded-lg mr-3 group-hover:bg-white/20 transition-colors">
                     <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold tracking-tight">Auto-Optimize</div>
                    <div className="text-xs text-indigo-100 font-normal opacity-80">Apply AI Enhancements</div>
                  </div>
                </>
              )}
            </div>
          </button>
          
          <button 
            onClick={onEditResume}
            className="group flex items-center justify-center p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl font-semibold transition-all shadow-lg"
          >
            <div className="p-1.5 bg-slate-700 rounded-lg mr-3 group-hover:bg-slate-600 transition-colors">
               <Edit className="w-5 h-5 text-slate-300" />
            </div>
            <span>Open Live Editor</span>
          </button>
        </div>

        {/* Tabs Container */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden flex flex-col h-[600px]">
          <div className="border-b border-slate-700/50 overflow-x-auto shrink-0 bg-slate-900/50">
            <nav className="flex space-x-8 px-6 min-w-max" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {isGeneral ? "Improvements" : "Tailoring Suggestions"}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-semibold ${activeTab === 'suggestions' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                  {result.suggestions.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'keywords'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {isGeneral ? "Missing Elements" : "Missing Keywords"}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-semibold ${activeTab === 'keywords' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-500'}`}>
                  {result.missingKeywords.length}
                </span>
              </button>
            </nav>
          </div>

          <div className="p-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                {result.suggestions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                     <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/50 mb-3" />
                     <p>No suggestions found! Your resume looks great.</p>
                  </div>
                ) : (
                  result.suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-colors shadow-sm group">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize tracking-wide border
                          ${suggestion.impact === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                            suggestion.impact === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {suggestion.impact} Impact • {suggestion.type}
                        </span>
                      </div>
                      
                      {suggestion.originalText && (
                        <div className="mb-4">
                          <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                            Original
                          </h5>
                          <div className="text-slate-400 bg-slate-900/50 p-4 rounded-lg text-sm border-l-2 border-slate-600 italic">
                            "{suggestion.originalText}"
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
                          Suggested Change
                        </h5>
                        <div className="text-slate-200 bg-indigo-500/10 p-4 rounded-lg text-sm border-l-2 border-indigo-500 font-medium">
                          "{suggestion.suggestedText}"
                        </div>
                      </div>

                      <div className="mt-4 flex items-start text-sm text-slate-500 pt-2 border-t border-slate-700/50">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-indigo-400 flex-shrink-0" />
                        <span>{suggestion.reason}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'keywords' && (
              <div>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  {isGeneral 
                    ? "The following elements or specific skills appear to be missing or underrepresented. Consider adding these to enhance your professional presentation." 
                    : "The following keywords appear frequently in the job description but are missing from your resume. Try to incorporate these naturally."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {result.missingKeywords.length === 0 ? (
                     <span className="text-slate-500 italic">No missing keywords detected.</span>
                  ) : (
                    result.missingKeywords.map((keyword, idx) => (
                      <span key={idx} className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-sm transition-colors cursor-default hover:bg-rose-500/20">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {keyword}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
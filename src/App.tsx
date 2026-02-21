/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, 
  MessageSquare, 
  Target, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface AnalysisResult {
  painPoints: string[];
  sentiment: string;
  salesBlockers: string[];
  marketingStrategy: string;
  salesStrategy: string;
  growthProjection: { month: string; current: number; projected: number }[];
  annualIncrementPlan: string;
}

export default function App() {
  const [reviews, setReviews] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('Auto-detect');

  const languages = [
    'Auto-detect', 'English', 'Spanish', 'French', 'German', 'Chinese', 
    'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Bengali',
    'Indonesian', 'Urdu', 'Telugu', 'Marathi', 'Tamil', 'Turkish'
  ];

  const reviewStrength = useMemo(() => {
    const words = reviews.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (words === 0) return { label: 'Empty', color: 'bg-slate-200', width: '0%' };
    if (words < 10) return { label: 'Weak', color: 'bg-red-400', width: '25%' };
    if (words < 30) return { label: 'Fair', color: 'bg-amber-400', width: '50%' };
    if (words < 60) return { label: 'Good', color: 'bg-indigo-400', width: '75%' };
    return { label: 'Excellent', color: 'bg-emerald-500', width: '100%' };
  }, [reviews]);

  const analyzeReviews = async (textToUse?: string) => {
    const finalReviews = textToUse || reviews;
    if (!finalReviews.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following customer reviews (Input Language: ${language}) and provide a comprehensive sales and marketing strategy specifically designed to maximize the company's Annual Sale Growth Rate.
        
        Reviews:
        ${finalReviews}
        
        Focus on:
        1. Identifying core customer problems (pain points) that are currently capping growth.
        2. Identifying specific "Growth Levers" - areas where improvements will directly impact the Annual Sale Growth Rate.
        3. Providing actionable marketing and sales solutions to overcome sales blockers.
        4. Creating a professional "Strategic Sales Growth Plan" structured with pillars like Market Expansion, Sales Enablement, and Customer Lifetime Value (CLV) optimization, including specific quarterly milestones.
        5. Providing a 6-month data projection (current vs projected revenue growth in percentage) showing the acceleration of the growth rate.
        
        Note: If the reviews are in a language other than English, please translate the core insights internally to provide the strategy in English.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              sentiment: { type: Type.STRING },
              salesBlockers: { type: Type.ARRAY, items: { type: Type.STRING } },
              marketingStrategy: { type: Type.STRING },
              salesStrategy: { type: Type.STRING },
              annualIncrementPlan: { type: Type.STRING, description: "Professional Strategic Sales Growth Plan with pillars and milestones" },
              growthProjection: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    month: { type: Type.STRING },
                    current: { type: Type.NUMBER, description: "Current growth rate %" },
                    projected: { type: Type.NUMBER, description: "Projected growth rate % after strategy" }
                  },
                  required: ["month", "current", "projected"]
                }
              }
            },
            required: ["painPoints", "sentiment", "salesBlockers", "marketingStrategy", "salesStrategy", "annualIncrementPlan", "growthProjection"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze reviews. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.trim()) {
      setReviews(pastedText);
      analyzeReviews(pastedText);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Sale Squid</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
            <button 
              onClick={() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-all"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Turn Customer Feedback into <br />
            <span className="text-indigo-600">Revenue Growth</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Sale Squid uses advanced AI to analyze your customer reviews, identifying sales blockers 
            and generating data-driven strategies to boost your annual growth rate.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
              Start Analyzing
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-full border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Key Points / Features Section */}
        <section id="features" className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Key Features</h2>
            <p className="text-slate-600">Everything you need to scale your business using customer insights.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-indigo-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Review Analysis</h3>
              <p className="text-slate-600 text-sm">Deep dive into customer feedback to find hidden patterns and recurring issues.</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-amber-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Blocker Identification</h3>
              <p className="text-slate-600 text-sm">Pinpoint exactly why customers are dropping off and what's stopping your sales.</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-emerald-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Growth Strategies</h3>
              <p className="text-slate-600 text-sm">Get actionable marketing and sales plans designed for annual revenue growth.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mb-24 bg-slate-900 rounded-3xl p-12 text-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">Three simple steps to unlock your business potential.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="relative z-10">
              <div className="text-5xl font-bold text-indigo-500/20 mb-4">01</div>
              <h3 className="text-xl font-bold mb-2">Import Reviews</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Paste your customer reviews from Amazon, Shopify, or any platform directly into our analyzer.
              </p>
            </div>
            <div className="relative z-10">
              <div className="text-5xl font-bold text-indigo-500/20 mb-4">02</div>
              <h3 className="text-xl font-bold mb-2">AI Processing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our advanced AI models analyze sentiment, extract pain points, and identify growth levers.
              </p>
            </div>
            <div className="relative z-10">
              <div className="text-5xl font-bold text-indigo-500/20 mb-4">03</div>
              <h3 className="text-xl font-bold mb-2">Execute Strategy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Implement the data-driven marketing and sales strategies to see your annual growth rate soar.
              </p>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section id="analyzer" className="mb-12">
          <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-indigo-600 w-5 h-5" />
                <h2 className="text-xl font-semibold text-slate-900">Input Customer Reviews</h2>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="language" className="text-sm font-medium text-slate-500">Review Language:</label>
                <select 
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none bg-slate-50/50"
              placeholder="Paste your customer reviews here to automatically generate a sales strategy..."
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              onPaste={handlePaste}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Strength:</span>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-500", reviewStrength.color)} 
                    style={{ width: reviewStrength.width }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{reviewStrength.label}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {reviews.trim().split(/\s+/).filter(w => w.length > 0).length} Words
              </span>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p>
                <strong>Pro Tip:</strong> For the best results, include at least 5-10 detailed reviews. 
                Our AI works best with specific feedback about product quality, shipping, or customer support.
              </p>
            </div>
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <button 
                onClick={() => {
                  const example = `- The checkout process is too long and confusing. I almost gave up.
- I love the product but shipping took 3 weeks without any updates.
- Customer support didn't respond to my email for 4 days.
- The mobile app crashes whenever I try to apply a discount code.
- Prices are a bit higher than competitors, but the quality is better.
- I wish there was a subscription option for recurring orders.
- The website is slow to load on my phone.
- Finding specific items in the search bar is frustratingly difficult.`;
                  setReviews(example);
                  analyzeReviews(example);
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
              >
                Try with Example Reviews
              </button>
              <button
                onClick={() => analyzeReviews()}
                disabled={isAnalyzing || !reviews.trim()}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all",
                  isAnalyzing || !reviews.trim() 
                    ? "bg-slate-300 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Strategy...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Generate Sales Strategy
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-indigo-500">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Sentiment</h3>
                <p className="text-2xl font-bold text-slate-900">{result.sentiment}</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-amber-500">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Key Pain Points</h3>
                <p className="text-2xl font-bold text-slate-900">{result.painPoints.length} Identified</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Growth Potential</h3>
                <p className="text-2xl font-bold text-slate-900">High</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pain Points & Blockers */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <AlertCircle className="text-amber-500 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-slate-900">Customer Pain Points</h2>
                  </div>
                  <ul className="space-y-4">
                    {result.painPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="mt-1 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-amber-700">{i + 1}</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="text-indigo-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-slate-900">Sales Blockers</h2>
                  </div>
                  <ul className="space-y-4">
                    {result.salesBlockers.map((blocker, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <div className="mt-1">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{blocker}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategies */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-indigo-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-slate-900">Marketing Strategy</h2>
                  </div>
                  <div className="markdown-body">
                    <Markdown>{result.marketingStrategy}</Markdown>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="text-emerald-500 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-slate-900">Sales Optimization</h2>
                  </div>
                  <div className="markdown-body">
                    <Markdown>{result.salesStrategy}</Markdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Projection Chart */}
            <div className="glass-card p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Sales Increment Analysis</h2>
                  <p className="text-slate-500 text-sm">Monthly and annual growth rate projections</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-xs font-medium text-slate-500">Current Monthly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-xs font-medium text-slate-500">Projected Monthly</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.growthProjection}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                      }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Line 
                      name="Current Monthly Growth"
                      type="monotone" 
                      dataKey="current" 
                      stroke="#cbd5e1" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#cbd5e1' }} 
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      name="Projected Monthly Growth"
                      type="monotone" 
                      dataKey="projected" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#4f46e5' }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-900 font-medium text-center">
                  Estimated Annual Increment: <span className="text-lg font-bold">+{Math.round((result.growthProjection[5].projected - result.growthProjection[0].current) * 2.5)}%</span> based on monthly compounding strategies.
                </p>
              </div>
            </div>

            {/* Strategic Sales Growth Plan */}
            <div className="glass-card p-8 bg-indigo-900 text-white border-none">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-indigo-300 w-6 h-6" />
                <h2 className="text-2xl font-bold">Strategic Sales Growth Plan</h2>
              </div>
              <div className="markdown-body text-indigo-50 prose-invert prose-sm max-w-none">
                <Markdown>{result.annualIncrementPlan}</Markdown>
              </div>
              <div className="mt-8 pt-8 border-t border-indigo-800 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition-colors">
                  Download Full Report
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <section id="pricing" className="mt-24 mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600">Choose the plan that fits your business scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 flex flex-col">
              <h3 className="text-lg font-bold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-4">$0 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <p className="text-slate-600 text-sm mb-6">Perfect for small businesses testing the waters.</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> 100 Reviews/mo
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Basic Strategy
                </li>
              </ul>
              <button className="w-full py-3 rounded-full border border-slate-200 font-semibold hover:bg-slate-50 transition-all">
                Get Started
              </button>
            </div>
            <div className="glass-card p-8 flex flex-col border-2 border-indigo-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</div>
              <h3 className="text-lg font-bold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">$49 <span className="text-sm font-normal text-slate-500">/mo</span></div>
              <p className="text-slate-600 text-sm mb-6">For growing companies needing deep insights.</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> 5,000 Reviews/mo
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Advanced Growth Roadmap
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Competitor Analysis
                </li>
              </ul>
              <button className="w-full py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                Try Pro Free
              </button>
            </div>
            <div className="glass-card p-8 flex flex-col">
              <h3 className="text-lg font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-4">Custom</div>
              <p className="text-slate-600 text-sm mb-6">Tailored solutions for large scale operations.</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Unlimited Reviews
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Dedicated Strategist
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" /> API Access
                </li>
              </ul>
              <button className="w-full py-3 rounded-full border border-slate-200 font-semibold hover:bg-slate-50 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Sale Squid</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 Sale Squid. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

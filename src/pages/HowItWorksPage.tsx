import React from 'react';
import {
  Mic,
  Camera,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigateReport: () => void;
  onNavigateExplore: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onNavigateReport,
  onNavigateExplore,
}) => {
  const faqs = [
    {
      q: 'Do I need to know English or official government terms to report a problem?',
      a: 'Not at all. You can speak in your regional village dialect (Bhojpuri, Hindi, Bengali, Tamil, etc.) or write in simple words. GramVikas AI automatically transcribes, translates, and drafts the formal grievance letter formatted for District Collectorates.',
    },
    {
      q: 'Why is photo evidence mandatory for every complaint?',
      a: 'Mandatory photo proof prevents fraudulent claims and provides government engineers with visual data on the exact severity of the damage, speeding up tender allocation and field inspection.',
    },
    {
      q: 'What happens when a village petition reaches its signature goal?',
      a: 'Petitions that meet their target signature count are automatically elevated to the District Magistrate (DM) and Panchayati Raj Department executive docket for priority administrative review.',
    },
    {
      q: 'Can other villagers support a complaint I reported?',
      a: 'Yes! Anyone from your village or nearby areas can tap "Support This Issue" with 1 click. Higher support counts signal urgency to administrative officers.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Civic Technology</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
          How GramVikas Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Bridging the gap between rural citizens and government administration through voice AI, photo verification, and collective community petitions.
        </p>
      </div>

      {/* Step by Step Visual Breakdown */}
      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-lg">
              <Mic className="w-10 h-10" />
            </div>
          </div>
          <div className="md:col-span-9 space-y-2">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Step 01 • Voice & Photo Capture</span>
            <h3 className="font-display font-bold text-xl text-slate-900">Speak in Your Dialect & Click Photo Proof</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Villagers can speak naturally into their phone or desktop in Hindi, Bhojpuri, Bengali, or 12+ other languages. A mandatory photo captures visual evidence, while GPS automatically detects coordinates.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10" />
            </div>
          </div>
          <div className="md:col-span-9 space-y-2">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Step 02 • Gemini AI Triage</span>
            <h3 className="font-display font-bold text-xl text-slate-900">Automated Intelligence & Formalization</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              GramVikas AI transcribes audio recordings, translates dialect nuances, analyzes priority levels (Urgent, High, Medium), and generates an official administrative letter formatted for relevant departments.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10" />
            </div>
          </div>
          <div className="md:col-span-9 space-y-2">
            <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">Step 03 • Community Upvotes & Petitions</span>
            <h3 className="font-display font-bold text-xl text-slate-900">Amplify Local Demands Together</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fellow panchayat residents can support grievances with 1-click upvotes or elevate major community infrastructure demands into formal petitions with signature quotas.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-3 flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <div className="md:col-span-9 space-y-2">
            <span className="text-xs font-extrabold text-teal-700 uppercase tracking-wider">Step 04 • Field Dispatch & Resolution Proof</span>
            <h3 className="font-display font-bold text-xl text-slate-900">Transparent SLA Tracking to Completion</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              District Officers and Engineers update progress on live timelines. When work is completed, resolution proof photos are published publicly for citizen verification.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
        <h2 className="font-display font-extrabold text-xl text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-tr from-emerald-800 to-teal-600 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <h3 className="font-display font-extrabold text-2xl">Ready to report an issue in your village?</h3>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
          Help make your Gram Panchayat cleaner, safer, and more connected with real government accountability.
        </p>
        <button
          onClick={onNavigateReport}
          className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold text-xs shadow-md transition cursor-pointer"
        >
          Report a Village Problem Now
        </button>
      </div>
    </div>
  );
};

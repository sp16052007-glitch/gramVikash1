import React from 'react';
import {
  Sprout,
  ShieldCheck,
  PhoneCall,
  Heart,
  Globe2,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-extrabold text-xl text-white tracking-tight">
                  Gram<span className="text-emerald-400">Vikas</span>
                </span>
                <span className="text-[10px] block text-emerald-400 font-semibold uppercase tracking-wider">
                  AI Civic-Tech Platform
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering 600,000+ Indian villages with voice-first AI grievance filing, community petitions, and accountable governance resolution tracking.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>“Your Voice. Your Village. Your Change.”</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Platform Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavClick('report')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Report Village Problem (Voice / Photo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('explore')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Explore Public Grievances
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('petitions')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Village Community Petitions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('map')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  Interactive Grievance Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('how-it-works')}
                  className="hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  How GramVikas Works
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Integrated Departments</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Public Works (PWD Roadways)</li>
              <li>Jal Jeevan Mission (Water Supply)</li>
              <li>Rural Electrification (Discom Grid)</li>
              <li>Chief Medical Office (Health PHC)</li>
              <li>Samagra Shiksha (Basic Education)</li>
              <li>Panchayati Raj & Village Sanitation</li>
            </ul>
          </div>

          {/* Emergency & Citizen Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Emergency Helplines (India)</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Panchayati Raj Grievance:</span>
                <span className="font-bold text-white">1800-180-5145</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Emergency Ambulance:</span>
                <span className="font-bold text-emerald-400">108</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Electricity Helpline:</span>
                <span className="font-bold text-amber-400">1912</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} GramVikas Technologies. Built for Next-Generation Indian Civic Infrastructure.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Citizen Charter</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Open Grievance API</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';

export default function MarketingHero() {
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleSubscribe = (e) => {
        e.preventDefault();
        alert("Subscribed to newsletter!");
    };

    return (
        <div className="w-full bg-slate-900 text-slate-100 p-8 rounded-xl shadow-2xl border border-slate-800" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}>
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2 cursor-pointer font-bold text-lg">
                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white">v0</div>
                    <span>CloudLabs AI</span>
                </div>
                {/* VIOLATION: Clickable Div used for Interactive Theme Switch (no keyboard access or interactive roles) */}
                <div onClick={toggleTheme} className="cursor-pointer p-2 hover:bg-slate-800 rounded-full border border-slate-700 bg-slate-900 transition">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h1 className="text-4xl font-extrabold tracking-tight">Deploy your next app <span className="text-indigo-400">in seconds</span></h1>
                    <p className="text-slate-400">Collaborate globally, track real-time visual progress, and scale without configuration bounds. Generated seamlessly by AI design engineers.</p>
                    
                    <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md pt-2">
                        {/* VIOLATION: Form Input Field missing Label or aria-label */}
                        <input 
                            type="email" 
                            placeholder="Enter your corporate email address" 
                            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Corporate email address"/>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-md shadow-md transition">
                            Subscribe
                        </button>
                    </form>
                </div>

                <div className="flex justify-center">
                    {/* VIOLATION: Decorative/Illustrative Product Image missing Alt attribute description */}
                    <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" 
                        className="rounded-lg shadow-xl border border-slate-700 max-h-80 object-cover w-full" alt="A smiling man with glasses in a professional office setting."/>
                </div>
            </div>
        </div>
    );
}
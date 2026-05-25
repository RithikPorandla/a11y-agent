import React from 'react';

export default function LandingPage() {
    const handleNavigation = () => console.log("Navigate home");
    const toggleDarkMode = () => console.log("Toggle dark mode");

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <header className="flex justify-between items-center border-b border-slate-700 pb-4">
                <div onClick={handleNavigation} className="cursor-pointer text-xl font-bold flex items-center gap-2" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" className="w-8 h-8 rounded-full" alt="Sarah Jenkins"/>
                    <span>AI-CreativeStudio v0</span>
                </div>
                <button onClick={toggleDarkMode} className="p-2 hover:bg-slate-800 rounded" aria-label="Toggle theme">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </header>
            
            <main className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Our Collaborative Workspace</h3>
                    <p className="text-slate-400 mb-4">Drafting custom designs inside our collaborative lab.</p>
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400" className="w-full rounded" alt="A bright, modern open-plan office with rows of desks and chairs."/>
                </section>
                <section className="border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Productivity Analytics</h3>
                    <p className="text-slate-400 mb-4">Depicting our weekly output metric progression.</p>
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" className="w-full rounded" alt="A dashboard with various charts and graphs illustrating productivity analytics."/>
                </section>
            </main>
        </div>
    );
}
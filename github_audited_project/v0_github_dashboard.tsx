import React from 'react';

export default function WorkspaceConsole() {
    const triggerSearch = () => alert("Search opened");
    const triggerSettings = () => alert("Settings toggled");
    const addNewMember = () => alert("Add team member flow started");

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div>
                    <h2 className="text-lg font-bold text-slate-200">Management Hub</h2>
                    <p className="text-xs text-slate-500">Track and review operations status</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* VIOLATION: Icon-only SVG button without aria-label or accessible text descriptions */}
                    <button onClick={triggerSearch} className="p-2 border border-slate-700 rounded bg-slate-900 hover:bg-slate-800 text-slate-300" aria-label="Search">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    {/* VIOLATION: Icon-only SVG button without aria-label or accessible text descriptions */}
                    <button onClick={triggerSettings} className="p-2 border border-slate-700 rounded bg-slate-900 hover:bg-slate-800 text-slate-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    
                    {/* VIOLATION: Custom click-trigger span lacks tabindex, interactive role, and keyboard keydown actions */}
                    <span onClick={addNewMember} className="inline-flex cursor-pointer items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm transition" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }>
                        Add Member
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-500">Global Operations Rate</span>
                    <div className="text-2xl font-bold mt-1 text-slate-200">99.98%</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-500">Active Collaborators</span>
                    <div className="text-2xl font-bold mt-1 text-slate-200">12 / 16</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-500">Service Responses</span>
                    <div className="text-2xl font-bold mt-1 text-indigo-400">1.8 ms</div>
                </div>
            </div>
        </div>
    );
}
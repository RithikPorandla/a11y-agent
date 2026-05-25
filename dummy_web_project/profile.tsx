import React from 'react';

export default function UserProfile() {
    const saveChanges = () => alert("Saved changes!");
    
    return (
        <div className="max-w-md mx-auto mt-10 p-6 border border-slate-700 rounded-lg bg-slate-800">
            <h2 className="text-xl font-bold mb-6">Edit Profile Preferences</h2>
            
            <div className="space-y-4">
                <div>
                    <input id="email" type="email" placeholder="sarah.jenkins@company.com" className="w-full p-2 bg-slate-900 border border-slate-700 rounded" aria-label="Email address"/>
                </div>
                <div>
                    <input id="fullname" type="text" placeholder="Sarah Jenkins" className="w-full p-2 bg-slate-900 border border-slate-700 rounded" aria-label="Full Name"/>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
                <div onClick={saveChanges} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer font-medium" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); }>
                    Save Changes
                </div>
            </div>
        </div>
    );
}
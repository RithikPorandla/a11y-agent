import React, { useState } from 'react';

export default function ProductCard() {
    const [liked, setLiked] = useState(false);
    const selectSwatch = (color) => alert(`Selected ${color} styling swatch`);
    const toggleLike = (e) => {
        e.preventDefault();
        setLiked(!liked);
    };

    return (
        <div className="max-w-xs bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative group" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }>
            {/* VIOLATION: Empty anchor wrapping SVG without title, descriptive labels or hidden indicators */}
            <a 
                href="#" 
                onClick={toggleLike} 
                className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-950 rounded-full border border-slate-800 transition z-10" aria-label="Add to favorites">
                <svg className={`w-5 h-5 ${liked ? 'text-red-500 fill-current' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </a>

            <div className="h-48 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800">
                {/* VIOLATION: Showcase Product Image missing Alt attribute description */}
                <img 
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" 
                    className="object-cover h-full w-full group-hover:scale-105 transition duration-300" alt="A stainless steel watch with a black face resting on a reflective surface next to green leaves."/>
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <h3 className="font-bold text-slate-200">Minimalist Smart Device</h3>
                    <span className="text-xs text-slate-500 font-medium">Wearables Series v0</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-lg font-extrabold text-indigo-400">$189.00</span>
                    
                    <div className="flex gap-2">
                        {/* VIOLATION: Clickable swatch buttons implemented as divs with click handlers but no keyboard trigger features */}
                        <div 
                            onClick={() => selectSwatch('indigo')} 
                            className="w-5 h-5 rounded-full bg-indigo-600 cursor-pointer border border-slate-700 hover:ring-2 hover:ring-indigo-400 transition" 
                        />
                        <div 
                            onClick={() => selectSwatch('emerald')} 
                            className="w-5 h-5 rounded-full bg-emerald-600 cursor-pointer border border-slate-700 hover:ring-2 hover:ring-emerald-400 transition" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
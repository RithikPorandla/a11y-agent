import React from 'react';

interface GamificationProps {
  xp: number;
  streak: number;
  badges: string[];
  setActiveTab: (tab: any) => void;
}

export const Gamification: React.FC<GamificationProps> = ({
  xp,
  streak,
  badges,
  setActiveTab
}) => {
  const getLevelTitle = (level: number) => {
    if (level === 1) return 'A11y Apprentice';
    if (level === 2) return 'ARIA Ranger';
    if (level === 3) return 'Semantic Tactician';
    if (level === 4) return 'Compliance Overlord';
    return 'Universal Access Champion';
  };

  const level = Math.floor(xp / 500) + 1;
  const nextLevel = level + 1;
  const xpInLevel = xp % 500;
  const progressPercent = Math.min(100, (xpInLevel / 500) * 100);

  return (
    <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="notion-page-header">
        <div className="notion-page-icon">🏆</div>
        <h1 className="notion-page-title">Developer Quests & Trophies Cabinet</h1>
        <p className="notion-page-description">
          Gamify accessibility engineering! Earn Experience Points (XP) for scanning and patching visual templates, complete active daily challenges, and display unlocked trophies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* COLUMN 1: Developer Profile Card */}
        <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(99, 102, 241, 0.04) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'white',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
            }}>
              ⚡
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Level {level}: {getLevelTitle(level)}
              </h3>
              <span className="notion-tag orange" style={{ marginTop: '6px', display: 'inline-block' }}>
                🔥 {streak}-Day Compliance Streak
              </span>
            </div>
          </div>

          {/* Level meter bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Progress to Level {nextLevel}</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{xpInLevel} / 500 XP</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--sidebar-bg)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                borderRadius: '5px',
                transition: 'width 0.4s ease'
              }}></div>
            </div>
          </div>

          {/* Operational stats case */}
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Compliance Track Record</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--sidebar-bg)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Images Described</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-text)' }}>{localStorage.getItem('stat-missing_alt') || 0} items</span>
              </div>
              <div style={{ background: 'var(--sidebar-bg)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Keyboard Triggers</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-text)' }}>{localStorage.getItem('stat-div_button') || 0} elements</span>
              </div>
              <div style={{ background: 'var(--sidebar-bg)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>SVGs Labeled</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-text)' }}>{localStorage.getItem('stat-unlabelled_svg') || 0} icons</span>
              </div>
              <div style={{ background: 'var(--sidebar-bg)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Inputs Descriptive</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-text)' }}>{localStorage.getItem('stat-input_no_label') || 0} fields</span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 2: Active Quests board */}
        <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎯 Active Daily Challenges
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Quest 1 */}
            <div style={{
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--panel-border)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>📸 Alt-Text Initiative</span>
                  <span className="notion-tag green" style={{ fontSize: '0.65rem' }}>+150 XP</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Describe 3 visual modules or product image grids to guarantee readability.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('workspace')}
                className="notion-btn border-only"
                style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px' }}
              >
                Embark
              </button>
            </div>

            {/* Quest 2 */}
            <div style={{
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--panel-border)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>⌨️ Keyboard Crusade</span>
                  <span className="notion-tag green" style={{ fontSize: '0.65rem' }}>+200 XP</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Make 2 click-interactive custom containers reachable and focus-enabled.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('workspace')}
                className="notion-btn border-only"
                style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px' }}
              >
                Embark
              </button>
            </div>

            {/* Quest 3 */}
            <div style={{
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--panel-border)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>🏷️ Icon Liberation</span>
                  <span className="notion-tag green" style={{ fontSize: '0.65rem' }}>+150 XP</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Inject descriptive aria-labels to 2 raw unlabelled SVG icon buttons.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('workspace')}
                className="notion-btn border-only"
                style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '6px' }}
              >
                Embark
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* SECTION 2: Trophies Cabinet */}
      <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🏆 Collected Trophies Cabinet
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          
          {/* Badge 1: Alt Righteous */}
          <div style={{
            padding: '20px 12px',
            borderRadius: '12px',
            border: '1px solid var(--panel-border)',
            background: badges.includes('alt_righteous') ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'var(--sidebar-bg)',
            borderColor: badges.includes('alt_righteous') ? 'rgba(34, 197, 94, 0.3)' : 'var(--panel-border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            filter: badges.includes('alt_righteous') ? 'none' : 'grayscale(100%) opacity(60%)',
            boxShadow: badges.includes('alt_righteous') ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem' }}>📷</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alt-Righteous</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Injected descriptive alt text tags to 3 image structures!
            </p>
          </div>

          {/* Badge 2: Keyboard Gladiator */}
          <div style={{
            padding: '20px 12px',
            borderRadius: '12px',
            border: '1px solid var(--panel-border)',
            background: badges.includes('keyboard_gladiator') ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'var(--sidebar-bg)',
            borderColor: badges.includes('keyboard_gladiator') ? 'rgba(34, 197, 94, 0.3)' : 'var(--panel-border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            filter: badges.includes('keyboard_gladiator') ? 'none' : 'grayscale(100%) opacity(60%)',
            boxShadow: badges.includes('keyboard_gladiator') ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem' }}>⌨️</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Keyboard Gladiator</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Remediated 2 clickable div buttons to be fully keyboard-navigable!
            </p>
          </div>

          {/* Badge 3: Label Legend */}
          <div style={{
            padding: '20px 12px',
            borderRadius: '12px',
            border: '1px solid var(--panel-border)',
            background: badges.includes('label_legend') ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'var(--sidebar-bg)',
            borderColor: badges.includes('label_legend') ? 'rgba(34, 197, 94, 0.3)' : 'var(--panel-border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            filter: badges.includes('label_legend') ? 'none' : 'grayscale(100%) opacity(60%)',
            boxShadow: badges.includes('label_legend') ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🏷️</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Label Legend</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Associated labels or descriptive names to 2 raw form inputs!
            </p>
          </div>

          {/* Badge 4: SVG Sage */}
          <div style={{
            padding: '20px 12px',
            borderRadius: '12px',
            border: '1px solid var(--panel-border)',
            background: badges.includes('svg_sage') ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'var(--sidebar-bg)',
            borderColor: badges.includes('svg_sage') ? 'rgba(34, 197, 94, 0.3)' : 'var(--panel-border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            filter: badges.includes('svg_sage') ? 'none' : 'grayscale(100%) opacity(60%)',
            boxShadow: badges.includes('svg_sage') ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🎨</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>SVG Sage</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Labeled 2 decorative SVG elements to declare proper graphic context!
            </p>
          </div>

          {/* Badge 5: AAA Oracle */}
          <div style={{
            padding: '20px 12px',
            borderRadius: '12px',
            border: '1px solid var(--panel-border)',
            background: badges.includes('aaa_oracle') ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'var(--sidebar-bg)',
            borderColor: badges.includes('aaa_oracle') ? 'rgba(34, 197, 94, 0.3)' : 'var(--panel-border)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            filter: badges.includes('aaa_oracle') ? 'none' : 'grayscale(100%) opacity(60%)',
            boxShadow: badges.includes('aaa_oracle') ? '0 4px 12px rgba(34, 197, 94, 0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem' }}>🔮</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>AAA Oracle</span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Attained a perfect 100% WCAG score across an entire visual codebase!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

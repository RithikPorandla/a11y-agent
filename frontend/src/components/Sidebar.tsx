import React from 'react';

export type ActiveTabType = 'dashboard' | 'workspace' | 'learning' | 'cicd' | 'ab_testing' | 'gamification';

export interface ViolationMeta {
  src?: string;
  href?: string;
  has_svg?: boolean;
  tag?: string;
  has_role?: boolean;
  has_tabindex?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
}

export interface Violation {
  id: string;
  type: string;
  element: string;
  selector: string;
  html: string;
  context: string;
  description: string;
  meta: ViolationMeta;
  suggestion: string;
  explanation: string;
  patched_html: string;
  screen_reader_a?: string;
  screen_reader_b?: string;
}

export interface RemediatedFile {
  filename: string;
  original_score: number;
  patched_score: number;
  violations: Violation[];
  original_html: string;
  patched_html: string;
}

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  violationsCount: number;
  rulesFilter: {
    div_button: boolean;
    unlabelled_svg: boolean;
    input_no_label: boolean;
    missing_alt: boolean;
  };
  setRulesFilter: React.Dispatch<React.SetStateAction<{
    div_button: boolean;
    unlabelled_svg: boolean;
    input_no_label: boolean;
    missing_alt: boolean;
  }>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  violationsCount,
  rulesFilter,
  setRulesFilter
}) => {
  return (
    <aside className="notion-sidebar">
      {/* Workspace Profile Context */}
      <div className="notion-sidebar-header">
        <div className="notion-sidebar-avatar">🛡️</div>
        <div>
          <span style={{ fontWeight: 600, display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            A11y-Agent Studio
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>
            Post-Processor
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="notion-sidebar-nav" style={{ flex: 1 }}>
        <button 
          className={`notion-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="notion-sidebar-item-label">
            <span style={{ fontSize: '1rem' }}>🛡️</span> Dashboard
          </span>
        </button>
        
        <button 
          className={`notion-sidebar-item ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspace')}
        >
          <span className="notion-sidebar-item-label">
            <span style={{ fontSize: '1rem' }}>💻</span> Workspace
          </span>
          {violationsCount > 0 && (
            <span className="notion-sidebar-badge">
              {violationsCount}
            </span>
          )}
        </button>
        
        <button 
          className={`notion-sidebar-item ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          <span className="notion-sidebar-item-label">
            <span style={{ fontSize: '1rem' }}>📚</span> Learning Center
          </span>
        </button>
        
        <button 
          className={`notion-sidebar-item ${activeTab === 'cicd' ? 'active' : ''}`}
          onClick={() => setActiveTab('cicd')}
        >
          <span className="notion-sidebar-item-label">
            <span style={{ fontSize: '1rem' }}>⚡</span> CI/CD Pipeline
          </span>
        </button>
        
        <button 
          className={`notion-sidebar-item ${activeTab === 'ab_testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ab_testing')}
        >
          <span className="notion-sidebar-item-label">
            <span style={{ fontSize: '1rem' }}>⚖️</span> A/B Testing Arena
          </span>
        </button>
        
        <button 
          className={`notion-sidebar-item ${activeTab === 'gamification' ? 'active' : ''}`}
          onClick={() => setActiveTab('gamification')}
        >
          <span className="notion-sidebar-item-label">
            <span style={{ fontSize: '1rem' }}>🏆</span> Quests & Trophies
          </span>
        </button>
      </nav>

      {/* Rules filter block in the sidebar */}
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--panel-border)', paddingTop: '16px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Compliance Filters
        </span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={rulesFilter.missing_alt}
              onChange={(e) => setRulesFilter({ ...rulesFilter, missing_alt: e.target.checked })}
              style={{ accentColor: 'var(--primary)' }}
            />
            📸 Alt Descriptions
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={rulesFilter.div_button}
              onChange={(e) => setRulesFilter({ ...rulesFilter, div_button: e.target.checked })}
              style={{ accentColor: 'var(--primary)' }}
            />
            ⌨️ Keyboard Navigation
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={rulesFilter.unlabelled_svg}
              onChange={(e) => setRulesFilter({ ...rulesFilter, unlabelled_svg: e.target.checked })}
              style={{ accentColor: 'var(--primary)' }}
            />
            🏷️ Icon aria-labels
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={rulesFilter.input_no_label}
              onChange={(e) => setRulesFilter({ ...rulesFilter, input_no_label: e.target.checked })}
              style={{ accentColor: 'var(--primary)' }}
            />
            📝 Form Controls
          </label>
        </div>
      </div>

      {/* Theme controls footer */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Appearance</span>
        <select 
          value={theme} 
          aria-label="Appearance Mode selector"
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
          style={{ 
            background: 'transparent', 
            color: 'var(--text-primary)', 
            border: 'none', 
            fontSize: '0.75rem', 
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <option value="light" style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)' }}>☀️ Light</option>
          <option value="dark" style={{ background: 'var(--panel-bg)', color: 'var(--text-primary)' }}>🌙 Dark</option>
        </select>
      </div>
    </aside>
  );
};

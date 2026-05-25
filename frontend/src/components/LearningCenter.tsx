import React, { useState } from 'react';

export const learningCards = [
  {
    title: "Interactive Div Button Anti-pattern",
    violation: `<div onClick={handleClick} className="btn-style">\n  Save Changes\n</div>`,
    remediated: `<div\n  onClick={handleClick}\n  className="btn-style"\n  role="button"\n  tabIndex={0}\n  onKeyDown={(e) => {\n    if (e.key === "Enter" || e.key === " ") {\n      e.preventDefault();\n      handleClick(e);\n    }\n  }}\n>\n  Save Changes\n</div>`,
    rule: "WCAG 2.1.1 (Keyboard Accessibility) & 4.1.2 (Name, Role, Value)",
    rationale: "Clickable <div> tags are completely ignored by screen readers and cannot be focused via keyboard navigation. By injecting role='button' and tabIndex={0}, the element is added to the tab cycle, and the onKeyDown listener allows screen reader users to fire standard click triggers using the Enter and Space keys."
  },
  {
    title: "Unlabelled SVG Icons inside Actions",
    violation: `<button onClick={openSearch}>\n  <svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>\n</button>`,
    remediated: `<button\n  onClick={openSearch}\n  aria-label="Search dashboard database"\n>\n  <svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>\n</button>`,
    rule: "WCAG 4.1.2 (Name, Role, Value)",
    rationale: "Buttons containing only icons (like SVGs or FontAwesome icons) have zero text value. Assistive screen readers will read this element as a blank 'Button' with no context. Injecting a clear 'aria-label' attribute defines the button action explicitly for sight-impaired users."
  },
  {
    title: "Disconnected Form Input Controls",
    violation: `<input id="email" type="email" placeholder="sarah@co.com" />`,
    remediated: `// Option A: Associated Label\n<label htmlFor="email">Email Address</label>\n<input id="email" type="email" placeholder="sarah@co.com" />\n\n// Option B: ARIA descriptor\n<input\n  id="email"\n  type="email"\n  placeholder="sarah@co.com"\n  aria-label="Email Address"\n/>`,
    rule: "WCAG 3.3.2 (Labels or Instructions)",
    rationale: "Inputs without labels leave screen readers with no indicators of what data to type. While placeholder text is visually appealing, it disappears when typing begins and is often skipped by assistive technology. Adding HTML5 htmlFor or aria-label guarantees consistent guidance."
  },
  {
    title: "Graphic Alt Text Guidelines",
    violation: `<img src="workspace.jpg" />`,
    remediated: `<img src="workspace.jpg" alt="A modern collaborative software engineering office showing rows of computer workspaces." />`,
    rule: "WCAG 1.1.1 (Non-text Content)",
    rationale: "Image tags lacking alternative text are completely skipped or read out as generic file paths (e.g. 'image-123-jpg'). A detailed, context-aware alt text allows screen readers to audibly describe the graphic context beautifully."
  }
];

export const LearningCenter: React.FC = () => {
  const [learningIdx, setLearningIdx] = useState(0);

  return (
    <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div className="notion-page-header">
        <div className="notion-page-icon">📚</div>
        <h1 className="notion-page-title">WCAG Reference Guide Wiki</h1>
        <p className="notion-page-description">
          A comprehensive wiki covering structural components, common accessibility anti-patterns, and code remedies.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Wiki Sidebar links */}
        <div className="notion-card" style={{ padding: '12px' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', padding: '0 6px' }}>A11y Rules Wiki</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {learningCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => setLearningIdx(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  fontWeight: learningIdx === idx ? 600 : 400,
                  background: learningIdx === idx ? 'var(--hover-bg)' : 'transparent',
                  color: learningIdx === idx ? 'var(--primary)' : 'var(--text-primary)',
                }}
              >
                📄 {card.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected slide viewport details */}
        <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <span className="notion-tag red" style={{ fontSize: '0.7rem' }}>WCAG Standard Reference</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
              {learningCards[learningIdx].title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>
              📚 {learningCards[learningIdx].rule}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>❌ Inaccessible Anti-Pattern Code:</span>
              <div className="code-container" style={{ background: 'var(--sidebar-bg)', fontSize: '0.75rem', borderLeft: '3px solid var(--danger-text)' }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{learningCards[learningIdx].violation}</pre>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>✅ Accessible remediated AST Code:</span>
              <div className="code-container" style={{ background: 'var(--sidebar-bg)', fontSize: '0.75rem', borderLeft: '3px solid var(--success-text)' }}>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{learningCards[learningIdx].remediated}</pre>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Developer Compliance Rationale</h4>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              {learningCards[learningIdx].rationale}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

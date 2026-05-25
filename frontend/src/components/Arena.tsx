import React from 'react';
import { Sparkles } from 'lucide-react';

interface ArenaProps {
  abReport: any;
  abRunning: boolean;
  abSelectedFile: any;
  setAbSelectedFile: (file: any) => void;
  abCodeTab: 'original' | 'remediated';
  setAbCodeTab: (tab: 'original' | 'remediated') => void;
  abTerminalLogs: string[];
  abActiveSpeaker: { id: string; variant: 'A' | 'B' } | null;
  setAbActiveSpeaker: (speaker: { id: string; variant: 'A' | 'B' } | null) => void;
  abCaptions: string;
  triggerLiveAiAudit: () => Promise<void>;
  speakText: (text: string, id: string, variant: 'A' | 'B') => void;
}

export const Arena: React.FC<ArenaProps> = ({
  abReport,
  abRunning,
  abSelectedFile,
  setAbSelectedFile,
  abCodeTab,
  setAbCodeTab,
  abTerminalLogs,
  abActiveSpeaker,
  setAbActiveSpeaker,
  abCaptions,
  triggerLiveAiAudit,
  speakText
}) => {
  return (
    <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="notion-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="notion-page-icon">⚖️</div>
          <h1 className="notion-page-title">A/B Compliance Arena</h1>
          <p className="notion-page-description">
            Audit actual AI-generated templates (from v0.dev/bolt.new) loaded with typical accessibility regressions. Review precision post-processor AST patches and audibly play the navigability difference side-by-side!
          </p>
        </div>
        {!abReport && !abRunning && (
          <button 
            onClick={triggerLiveAiAudit}
            className="notion-btn primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.9rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}
          >
            <Sparkles size={16} />
            Run Live A/B AI Audit
          </button>
        )}
      </div>

      {/* SECTION 1: Dynamic Loading Terminal */}
      {abRunning && (
        <div className="notion-card" style={{ background: '#090d16', borderColor: '#1e293b', padding: '0px', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>a11y-agent-cli --benchmark-scan</span>
            <span style={{ width: '36px' }}></span>
          </div>
          
          <div style={{ padding: '20px', minHeight: '320px', maxHeight: '450px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', color: '#cbd5e1' }}>
            {abTerminalLogs.map((log, idx) => {
              let color = '#cbd5e1';
              if (log.includes('⚠️')) color = '#fbbf24';
              else if (log.includes('✅') || log.includes('🟢') || log.includes('🎉')) color = '#34d399';
              else if (log.includes('⚡') || log.includes('👉')) color = '#818cf8';
              else if (log.includes('❌')) color = '#f87171';
              
              return (
                <div key={idx} style={{ color, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {log}
                </div>
              );
            })}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', marginTop: '4px' }}>
              <span className="scanning-spinner" style={{ width: '12px', height: '12px', border: '2px solid transparent', borderTopColor: '#818cf8', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
              <span>Executing LLM and AST orchestration pipelines...</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Initial Callout state before scan */}
      {!abReport && !abRunning && (
        <div className="notion-card" style={{ background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid var(--panel-border)', padding: '40px', textAlign: 'center', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>⚖️</div>
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI-Generated Code vs Accessible Post-Processor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              AI generators (v0, Bolt, Lovable) output visually beautiful sites but frequently lock out screen readers and keyboard navigators. Click the button below to crawl AI components, execute A11y-Agent fixes, and review the interactive comparative analytics.
            </p>
          </div>
          <button 
            onClick={triggerLiveAiAudit}
            className="notion-btn primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.95rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)' }}
          >
            <Sparkles size={18} />
            Run Dynamic A/B AI Audit Now
          </button>
        </div>
      )}

      {/* SECTION 3: Dynamic Scorecard Workspace */}
      {abReport && !abRunning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Aggregated Statistics Mini Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Pages Audited</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {abReport.total_scanned} Templates
              </div>
            </div>
            <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Violations Patched</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                {abReport.total_violations_found} WCAG Issues
              </div>
            </div>
            <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original Score A</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--danger-text)' }}>
                {abReport.average_score_a_original}%
              </div>
            </div>
            <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remediated Score B</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success-text)' }}>
                100.0% <span style={{ fontSize: '0.8rem', verticalAlign: 'middle', fontWeight: 600 }}>(AAA)</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Sidebar + Details Pane */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Sidebar File Selector */}
            <div className="notion-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', paddingLeft: '8px', marginBottom: '8px', letterSpacing: '0.05em' }}>Scanned AI Outputs</h4>
              {abReport.benchmarks.map((bench: any, idx: number) => {
                const isSelected = abSelectedFile && abSelectedFile.filename === bench.filename;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      setAbSelectedFile(bench);
                      setAbCodeTab('original');
                      window.speechSynthesis.cancel();
                      setAbActiveSpeaker(null);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--sidebar-active-bg)' : 'transparent',
                      border: isSelected ? '1px solid var(--panel-border)' : '1px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                    className="sidebar-file-item"
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      📄 {bench.component}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span>Bugs: {bench.violations_count}</span>
                      <span style={{ color: isSelected ? 'var(--primary)' : 'var(--danger-text)', fontWeight: 600 }}>Score: {bench.score_a_original}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Workspace details */}
            {abSelectedFile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Scorecard Header Panel */}
                <div className="notion-card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {abSelectedFile.component}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                        {abSelectedFile.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>Variant A</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--danger-text)' }}>{abSelectedFile.score_a_original}%</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>➔</span>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block' }}>Variant B</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success-text)' }}>100%</span>
                      </div>
                      <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-text)' }}>
                        +{abSelectedFile.score_gain}% Improvement
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columns: Left (Violations), Right (Code & Voice) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '20px' }}>
                  
                  {/* Left: Violations List */}
                  <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>
                      ⚠️ Detected WCAG Violations ({abSelectedFile.violations_count})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                      {abSelectedFile.violations.map((v: any, index: number) => (
                        <div 
                          key={index}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'var(--danger-bg)',
                            border: '1px solid var(--danger-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              background: 'var(--danger-text)',
                              color: 'white'
                            }}>
                              {v.type === 'missing_alt' ? 'WCAG 1.1.1 (Non-Text)' :
                               v.type === 'div_button' ? 'WCAG 2.1.1 (Keyboard)' :
                               v.type === 'input_no_label' ? 'WCAG 3.3.2 (Labels)' :
                               'WCAG 4.1.2 (Name/Role)'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--danger-text)', fontFamily: 'var(--font-mono)' }}>#{v.id}</span>
                          </div>
                          
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                            <strong>Offending Node:</strong> <code style={{ color: 'var(--danger-text)', fontSize: '0.75rem', wordBreak: 'break-all' }}>{v.html}</code>
                          </p>
                          
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--sidebar-bg)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                            <strong>Remediation Patch:</strong> <code style={{ color: 'var(--success-text)', fontWeight: 600 }}>{v.suggestion}</code>
                          </div>
                          
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                            <strong>Standard Explanation:</strong> {v.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Code tabs & Screen Reader Simulator */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Code comparator */}
                    <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>🧑‍💻 AST Patcher Diff</h4>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--sidebar-bg)', padding: '2px', borderRadius: '6px' }}>
                          <button 
                            onClick={() => setAbCodeTab('original')}
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              border: 'none',
                              borderRadius: '4px',
                              background: abCodeTab === 'original' ? 'var(--danger-bg)' : 'transparent',
                              color: abCodeTab === 'original' ? 'var(--danger-text)' : 'var(--text-secondary)',
                              fontWeight: abCodeTab === 'original' ? 600 : 500,
                              cursor: 'pointer'
                            }}
                          >
                            Original
                          </button>
                          <button 
                            onClick={() => setAbCodeTab('remediated')}
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              border: 'none',
                              borderRadius: '4px',
                              background: abCodeTab === 'remediated' ? 'var(--success-bg)' : 'transparent',
                              color: abCodeTab === 'remediated' ? 'var(--success-text)' : 'var(--text-secondary)',
                              fontWeight: abCodeTab === 'remediated' ? 600 : 500,
                              cursor: 'pointer'
                            }}
                          >
                            Patched
                          </button>
                        </div>
                      </div>

                      <div 
                        className="code-container" 
                        style={{ 
                          fontSize: '0.72rem', 
                          maxHeight: '260px', 
                          overflowY: 'auto', 
                          background: 'var(--sidebar-bg)',
                          borderRadius: '8px',
                          padding: '12px',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.4',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {abCodeTab === 'original' ? abSelectedFile.original_html : abSelectedFile.patched_html}
                      </div>
                    </div>

                    {/* 🔊 Virtual Screen Reader Simulator */}
                    <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--sidebar-bg)', borderColor: 'var(--panel-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🔊 Virtual Screen Reader Audio Simulator
                        </h4>
                        <span className="notion-tag blue">Web Speech API</span>
                      </div>
                      
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                        Click a speaker button to experience audibly what assistive screen readers (like VoiceOver or NVDA) vocalize when reading these elements.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Variant A audio trigger */}
                        <div 
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--danger-border)',
                            background: 'var(--card-bg)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger-text)' }}>Original AI Audio (A)</span>
                          <button 
                            onClick={() => {
                              const text = abSelectedFile.violations.map((v: any) => v.screen_reader_a).join(". ");
                              speakText(text, abSelectedFile.filename, 'A');
                            }}
                            className={`notion-btn ${abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'A' ? 'danger' : ''}`}
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'A' ? 'var(--danger-text)' : 'transparent',
                              color: abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'A' ? 'white' : 'var(--danger-text)',
                              border: '1px solid var(--danger-border)',
                              width: '100%'
                            }}
                          >
                            📢 {abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'A' ? 'Stop Speaking' : 'Play Silent Feed'}
                          </button>
                        </div>

                        {/* Variant B audio trigger */}
                        <div 
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--success-border)',
                            background: 'var(--card-bg)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-text)' }}>Remediated Audio (B)</span>
                          <button 
                            onClick={() => {
                              const text = abSelectedFile.violations.map((v: any) => v.screen_reader_b).join(". ");
                              speakText(text, abSelectedFile.filename, 'B');
                            }}
                            className={`notion-btn ${abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'B' ? 'success' : ''}`}
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'B' ? 'var(--success-text)' : 'transparent',
                              color: abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'B' ? 'white' : 'var(--success-text)',
                              border: '1px solid var(--success-border)',
                              width: '100%'
                            }}
                          >
                            🔊 {abActiveSpeaker?.id === abSelectedFile.filename && abActiveSpeaker?.variant === 'B' ? 'Stop Speaking' : 'Play Audited Feed'}
                          </button>
                        </div>
                      </div>

                      {abCaptions && abActiveSpeaker && abActiveSpeaker.id === abSelectedFile.filename && (
                        <div style={{ marginTop: '8px', padding: '10px 12px', background: '#090d16', borderRadius: '6px', borderLeft: '3px solid var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#38bdf8', lineHeight: '1.4' }}>
                          💬 <strong>Spoken captions:</strong> "{abCaptions}"
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

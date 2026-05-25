import React from 'react';
import { HelpCircle, Download, Sparkles, Zap } from 'lucide-react';
import type { RemediatedFile, Violation } from './Sidebar';

interface WorkspaceProps {
  files: RemediatedFile[];
  selectedFile: RemediatedFile | null;
  setSelectedFile: (file: RemediatedFile | null) => void;
  isPlaygroundMode: boolean;
  setIsPlaygroundMode: (val: boolean) => void;
  sandboxCode: string;
  setSandboxCode: (code: string) => void;
  sandboxViolations: any[];
  setSandboxViolations: (viols: any[]) => void;
  sandboxPatchedCode: string;
  setSandboxPatchedCode: (code: string) => void;
  sandboxScore: number | null;
  setSandboxScore: (score: number | null) => void;
  sandboxIsAuditing: boolean;
  setSandboxIsAuditing: (val: boolean) => void;
  sandboxActiveSpeaker: 'A' | 'B' | null;
  setSandboxActiveSpeaker: (speaker: 'A' | 'B' | null) => void;
  sandboxSpeechText: string;
  setSandboxSpeechText: (text: string) => void;
  sandboxTab: 'original' | 'patched';
  setSandboxTab: (tab: 'original' | 'patched') => void;
  
  autoRemediateAll: () => Promise<void>;
  isRemediatingAll: boolean;
  handleDownload: (file: RemediatedFile) => void;
  customSuggestions: Record<string, string>;
  setCustomSuggestions: (suggs: Record<string, string>) => void;
  approveAndPatch: (v: Violation) => Promise<void>;
  renderViolationBadge: (type: string) => React.ReactNode;
  renderLineDiff: (orig: string, patched: string) => React.ReactNode;
  
  awardXp: (amount: number, desc: string) => void;
  API_BASE: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  files,
  selectedFile,
  setSelectedFile,
  isPlaygroundMode,
  setIsPlaygroundMode,
  sandboxCode,
  setSandboxCode,
  sandboxViolations,
  setSandboxViolations,
  sandboxPatchedCode,
  setSandboxPatchedCode,
  sandboxScore,
  setSandboxScore,
  sandboxIsAuditing,
  setSandboxIsAuditing,
  sandboxActiveSpeaker,
  setSandboxActiveSpeaker,
  sandboxSpeechText,
  setSandboxSpeechText,
  sandboxTab,
  setSandboxTab,
  
  autoRemediateAll,
  isRemediatingAll,
  handleDownload,
  customSuggestions,
  setCustomSuggestions,
  approveAndPatch,
  renderViolationBadge,
  renderLineDiff,
  awardXp,
  API_BASE
}) => {
  const getSandboxScreenReaderText = (v: any, variant: 'A' | 'B') => {
    const type = v.type;
    if (variant === 'A') {
      if (type === 'missing_alt') {
        return "Image. Unlabelled graphic. Path: " + (v.meta?.src || "placeholder") + ". (Warning: missing alternative text descriptor. Screen readers will skip or read out raw filename, leaving sight-impaired developers completely disoriented!)";
      } else if (type === 'div_button') {
        return "Verify Access, group. (Warning: Non-interactive div used as click trigger. Keyboard focus tab-index cannot reach this element, and search index will treat it as a generic text container!)";
      } else if (type === 'input_no_label') {
        return "Edit text. Blank. (Warning: Form input field missing associated label. Sight-impaired developers will hear no audio descriptions, not knowing what details this input accepts!)";
      } else if (type === 'unlabelled_svg' || type === 'missing_button_label') {
        return "Button. Graphic icon. (Warning: Graphic button lacks text context. Screen readers will read it as empty or button-graphic, locking out screen reader users!)";
      }
      return "Generic component container with accessibility regression.";
    } else {
      if (type === 'missing_alt') {
        return "Image. Descriptive context: A diverse software engineering team of five people collaborating on computer screens in a conference room. (Accessible: alternative description successfully spoken!)";
      } else if (type === 'div_button') {
        return "Verify Access, button, focus-enabled. Press space or enter to trigger verify workspace authorization sequence. (Accessible: element is keyboard focusable and behaves as a button!)";
      } else if (type === 'input_no_label') {
        return "Workspace ID, edit text, entering workspace identification string. (Accessible: form descriptive context granted!)";
      } else if (type === 'unlabelled_svg' || type === 'missing_button_label') {
        return "Open preferences settings, button. (Accessible: action button clearly declared!)";
      }
      return "Accessible, WCAG compliant UI component.";
    }
  };

  const speakSandboxText = (text: string, variant: 'A' | 'B') => {
    window.speechSynthesis.cancel();
    
    if (sandboxActiveSpeaker === variant) {
      setSandboxActiveSpeaker(null);
      setSandboxSpeechText('');
      return;
    }
    
    setSandboxActiveSpeaker(variant);
    setSandboxSpeechText(text);
    
    const utterance = new SpeechSynthesisUtterance(text.replace(/\[.*?\]/g, ''));
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onend = () => {
      setSandboxActiveSpeaker(null);
      setSandboxSpeechText('');
    };
    utterance.onerror = () => {
      setSandboxActiveSpeaker(null);
      setSandboxSpeechText('');
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const auditSandboxCode = async () => {
    setSandboxIsAuditing(true);
    setSandboxSpeechText('');
    window.speechSynthesis.cancel();
    setSandboxActiveSpeaker(null);
    try {
      const payload = [{
        filename: 'sandbox.tsx',
        html: sandboxCode
      }];
      
      const res = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`API Scan returned HTTP ${res.status}`);
      }
      
      const results = await res.json();
      if (results && results.length > 0) {
        const fileResult = results[0];
        setSandboxViolations(fileResult.violations || []);
        setSandboxPatchedCode(fileResult.patched_html || sandboxCode);
        setSandboxScore(fileResult.original_score);
        
        // Award XP!
        const xpEarned = (fileResult.violations?.length || 0) > 0 ? 50 : 25;
        awardXp(xpEarned, "Successfully executed dynamic real-time component playground audit");
      }
    } catch (e) {
      console.error('Sandbox scan failed:', e);
      alert('Error connecting to backend server. Make sure Python FastAPI backend is running on port 8000.');
    } finally {
      setSandboxIsAuditing(false);
    }
  };

  const downloadSandboxPatched = () => {
    const codeToDownload = sandboxPatchedCode || sandboxCode;
    const blob = new Blob([codeToDownload], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'remediated_sandbox.tsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    awardXp(30, "Downloaded optimized accessible component package");
  };

  return (
    <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="notion-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="notion-page-icon">💻</div>
          <h1 className="notion-page-title">Interactive Component Workspace</h1>
          <p className="notion-page-description">
            Audit actual files on disk, or use the real-time sandbox to test, audit, and patch arbitrary TSX, JSX or HTML components instantly.
          </p>
        </div>
        
        {/* Visual Tab Toggle Bar */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--sidebar-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
          <button 
            onClick={() => {
              setIsPlaygroundMode(false);
              window.speechSynthesis.cancel();
              setSandboxActiveSpeaker(null);
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: !isPlaygroundMode ? 'var(--hover-bg)' : 'transparent',
              color: !isPlaygroundMode ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            📁 Local Scanned Files
          </button>
          <button 
            onClick={() => {
              setIsPlaygroundMode(true);
              window.speechSynthesis.cancel();
            }}
            style={{
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: isPlaygroundMode ? 'var(--hover-bg)' : 'transparent',
              color: isPlaygroundMode ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ Live Sandbox Playground
          </button>
        </div>
      </div>

      {isPlaygroundMode ? (
        /* ============================== DYNAMIC SANDBOX PLAYGROUND ============================== */
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Editor & Auditing Trigger */}
          <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ✍️ TSX/HTML Code Input Editor
              </h3>
              <button 
                onClick={() => setSandboxCode(`import React from 'react';

export default function CorporatePortal() {
  const navigateToTerms = () => alert("Redirecting to legal terms...");
  
  return (
    <div className="p-8 bg-slate-900 text-slate-100 rounded-lg max-w-lg shadow-xl border border-slate-700">
      {/* ⚠️ Image Missing alt attribute */}
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400" className="w-full rounded mb-6" />
      
      <h2 className="text-xl font-bold mb-4">Enterprise Dashboard Access</h2>
      <p className="text-slate-400 mb-6">Generated by AI designer. Click the button to inspect records.</p>
      
      <div className="flex gap-4">
        {/* ⚠️ Form Input missing Label or aria-label */}
        <input type="text" placeholder="Workspace ID" className="bg-slate-950 p-2 border border-slate-700 rounded flex-1" />
        
        {/* ⚠️ Custom Clickable Div used for Button (no role="button", no tabIndex, no keyboard trigger) */}
        <div onClick={navigateToTerms} className="p-2 bg-indigo-600 rounded text-center cursor-pointer font-semibold hover:bg-indigo-700">
          Verify Access
        </div>
      </div>
      
      {/* ⚠️ Unlabelled SVG Icon Button */}
      <button className="p-2 mt-4 bg-slate-800 rounded hover:bg-slate-700">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}`)}
                className="notion-btn border-only"
                style={{ fontSize: '0.7rem', padding: '4px 8px' }}
              >
                Reset Demo Template
              </button>
            </div>
            
            <textarea 
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              aria-label="Sandbox Code Input Editor"
              rows={22}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                padding: '16px',
                background: '#090d16',
                color: '#f8fafc',
                border: '1px solid var(--panel-border)',
                borderRadius: '8px',
                resize: 'vertical',
                lineHeight: '1.4',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
              }}
            />
            
            <button 
              onClick={auditSandboxCode}
              disabled={sandboxIsAuditing}
              className="notion-btn primary"
              style={{
                padding: '12px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
              }}
            >
              <Sparkles size={16} />
              {sandboxIsAuditing ? 'Executing Live AST Auditing...' : 'Run Real-Time Accessibility Audit'}
            </button>
          </div>

          {/* Right Column: Dynamic Results & Speech Synthesizers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {sandboxScore !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Score Card Banner */}
                <div className="notion-card" style={{
                  borderLeft: '4px solid',
                  borderLeftColor: sandboxViolations.length > 0 ? 'var(--warning-text)' : 'var(--success-text)',
                  background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(99, 102, 241, 0.03) 100%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Playground Audit Completed
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      Health Score: <span style={{ color: sandboxScore >= 90 ? 'var(--success-text)' : sandboxScore >= 60 ? 'var(--warning-text)' : 'var(--danger-text)' }}>{sandboxScore}%</span>
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={downloadSandboxPatched}
                      className="notion-btn primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
                    >
                      <Download size={14} /> Download Patched
                    </button>
                  </div>
                </div>

                {/* Interactive Violations Showcase */}
                <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⚠️ Identified WCAG Violations ({sandboxViolations.length})
                  </h4>
                  
                  {sandboxViolations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--success-text)', fontWeight: 600, fontSize: '0.9rem' }}>
                      🎉 100% WCAG COMPLIANT! Your sandbox template is accessibility-perfect!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                      {sandboxViolations.map((v, index) => (
                        <div 
                          key={index}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'var(--danger-bg)',
                            border: '1px solid var(--danger-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {renderViolationBadge(v.type)}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>#{v.id || `v-${index}`}</span>
                          </div>
                          
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                            <strong>Description:</strong> {v.description}
                          </div>
                          
                          <div className="code-container" style={{ background: 'var(--sidebar-bg)', fontSize: '0.75rem', borderLeft: '3px solid var(--danger-text)' }}>
                            <code>{v.html}</code>
                          </div>
                          
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--sidebar-bg)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid var(--primary)' }}>
                            <strong>Remediation attribute:</strong> <code style={{ color: 'var(--success-text)', fontWeight: 600 }}>{v.suggestion}</code>
                          </div>

                          {/* Web Speech Screen Reader simulator box for this violation */}
                          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>🔊 Experience Audio vocalizations:</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <button 
                                onClick={() => speakSandboxText(getSandboxScreenReaderText(v, 'A'), 'A')}
                                className={`notion-btn border-only ${sandboxActiveSpeaker === 'A' ? 'danger' : ''}`}
                                style={{ fontSize: '0.7rem', padding: '6px', background: sandboxActiveSpeaker === 'A' ? 'var(--danger-text)' : 'transparent', color: sandboxActiveSpeaker === 'A' ? 'white' : 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
                              >
                                📢 Original Voice (A)
                              </button>
                              <button 
                                onClick={() => speakSandboxText(getSandboxScreenReaderText(v, 'B'), 'B')}
                                className={`notion-btn border-only ${sandboxActiveSpeaker === 'B' ? 'success' : ''}`}
                                style={{ fontSize: '0.7rem', padding: '6px', background: sandboxActiveSpeaker === 'B' ? 'var(--success-text)' : 'transparent', color: sandboxActiveSpeaker === 'B' ? 'white' : 'var(--success-text)', borderColor: 'var(--success-border)' }}
                              >
                                🔊 Remediated Voice (B)
                              </button>
                            </div>
                            {sandboxSpeechText && sandboxActiveSpeaker && (
                              <div style={{ marginTop: '8px', padding: '8px 10px', background: '#090d16', borderRadius: '4px', borderLeft: '3px solid var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#38bdf8', lineHeight: '1.3' }}>
                                💬 <strong>Readout Subtitles:</strong> "{sandboxSpeechText}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Side by side code tabs */}
                <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      🧑‍💻 Code Diff Patcher View
                    </h4>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--sidebar-bg)', padding: '2px', borderRadius: '6px' }}>
                      <button 
                        onClick={() => setSandboxTab('original')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          border: 'none',
                          borderRadius: '4px',
                          background: sandboxTab === 'original' ? 'var(--danger-bg)' : 'transparent',
                          color: sandboxTab === 'original' ? 'var(--danger-text)' : 'var(--text-secondary)',
                          fontWeight: sandboxTab === 'original' ? 600 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        Original
                      </button>
                      <button 
                        onClick={() => setSandboxTab('patched')}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          border: 'none',
                          borderRadius: '4px',
                          background: sandboxTab === 'patched' ? 'var(--success-bg)' : 'transparent',
                          color: sandboxTab === 'patched' ? 'var(--success-text)' : 'var(--text-secondary)',
                          fontWeight: sandboxTab === 'patched' ? 600 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        Patched
                      </button>
                    </div>
                  </div>

                  <div className="code-container" style={{
                    fontSize: '0.74rem',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    background: 'var(--sidebar-bg)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.4',
                    color: 'var(--text-primary)'
                  }}>
                    {sandboxTab === 'original' ? sandboxCode : sandboxPatchedCode}
                  </div>
                </div>

              </div>
            ) : (
              <div className="notion-card" style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, rgba(99, 102, 241, 0.02) 100%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '3rem' }}>⚡</div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 700 }}>
                  Sandbox Engine Ready
                </h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '360px', lineHeight: '1.5' }}>
                  Pasted in the editor is a standard React template loaded with severe WCAG violations. Click the button to inspect detected AST omissions and play the vocal difference!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ============================== FILE TREE SCAN WORKSPACE ============================== */
        selectedFile ? (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Workspace File tree navigation */}
            <div className="notion-card" style={{ padding: '12px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', padding: '0 6px' }}>Scanned Templates</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {files.map((file) => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedFile(file)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      fontWeight: selectedFile.filename === file.filename ? 600 : 400,
                      background: selectedFile.filename === file.filename ? 'var(--hover-bg)' : 'transparent',
                      color: selectedFile.filename === file.filename ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      📄 {file.filename}
                    </span>
                    <span className={`notion-tag ${file.violations.length > 0 ? 'yellow' : 'green'}`} style={{ fontSize: '0.7rem', padding: '0 4px' }}>
                      {file.original_score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right editor panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Header Summary */}
              <div className="notion-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    📄 {selectedFile.filename}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Current Score: <span style={{ fontWeight: 700, color: 'var(--danger-text)' }}>{selectedFile.original_score}%</span> &bull; Patched: <span style={{ fontWeight: 700, color: 'var(--success-text)' }}>{selectedFile.patched_score}%</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedFile.violations.length > 0 && (
                    <button className="btn btn-primary" onClick={autoRemediateAll} disabled={isRemediatingAll}>
                      <Zap size={14} /> Remediation
                    </button>
                  )}
                  <button className="btn" onClick={() => handleDownload(selectedFile)}>
                    <Download size={14} /> Download Source
                  </button>
                </div>
              </div>

              {/* Violations section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🛡️ Outstanding Violations ({selectedFile.violations.length})
                  {selectedFile.violations.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--success-text)', fontWeight: 500 }}>
                      (Zero violations outstanding! This component is completely compliant)
                    </span>
                  )}
                </h3>

                <div className="notion-comment-list">
                  {selectedFile.violations.map((v) => (
                    <div key={v.id} className="notion-comment-card">
                      
                      {/* Comment header */}
                      <div className="notion-comment-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {renderViolationBadge(v.type)}
                          <span style={{ fontFamily: 'Fira Code', fontSize: '0.75rem' }}>{v.id}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>a11y-agent audit</span>
                      </div>

                      {/* Main feedback body */}
                      <div className="notion-comment-body">
                        <p style={{ marginBottom: '12px' }}>{v.description}</p>
                        
                        {/* Infringing element snippet */}
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Infringing Code:</span>
                          <div className="code-container" style={{ background: 'var(--sidebar-bg)', fontSize: '0.8rem', borderLeft: '3px solid var(--danger-text)' }}>
                            <code>{v.html}</code>
                          </div>
                        </div>

                        {/* Target CSS selector */}
                        <div style={{ marginBottom: '12px', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Selector: </span>
                          <code style={{ color: 'var(--primary)', fontWeight: 500 }}>{v.selector}</code>
                        </div>

                        {/* AI suggestion block */}
                        <div className="notion-card" style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--panel-border)', padding: '14px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          
                          {v.type === 'missing_alt' && v.meta.src && (
                            <div style={{ border: '1px solid var(--panel-border)', borderRadius: '4px', overflow: 'hidden', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
                              <img src={v.meta.src} alt="Source audit target preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                          )}

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rationale: </span>
                            {v.explanation}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Modify Attribute Patch:</label>
                            <textarea 
                              value={customSuggestions[v.id] !== undefined ? customSuggestions[v.id] : v.suggestion} 
                              onChange={(e) => setCustomSuggestions({ ...customSuggestions, [v.id]: e.target.value })}
                              aria-label="Modify Attribute Patch"
                              rows={2}
                              style={{ 
                                fontFamily: 'Fira Code', 
                                fontSize: '0.8rem', 
                                padding: '6px 10px', 
                                background: 'var(--panel-bg)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--panel-border)',
                                borderRadius: '4px',
                                resize: 'none'
                              }} 
                            />
                          </div>

                          <button 
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', alignSelf: 'flex-start' }}
                            onClick={() => approveAndPatch(v)}
                          >
                            Approve & Patch Source
                          </button>

                        </div>

                      </div>

                    </div>
                  ))}
                </div>

              </div>

              {/* Diff container panel */}
              <div className="notion-card">
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '6px' }}>📄 Code Differential View</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Green highlights show access attributes applied in your dynamic JSX code, replacing red structural omissions.
                </p>
                {renderLineDiff(selectedFile.original_html, selectedFile.patched_html)}
              </div>

            </div>

          </div>
        ) : (
          <div className="notion-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <HelpCircle size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1rem' }}>No Active File Loaded</h3>
            <p style={{ fontSize: '0.85rem' }}>Scan your active workspace from the Dashboard, or toggle "Live Sandbox Playground" above to test any code component!</p>
          </div>
        )
      )}

    </div>
  );
};

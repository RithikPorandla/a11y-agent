import React from 'react';

interface CICDPipelineProps {
  terminalLogs: string[];
  terminalRunning: boolean;
  runTerminalSimulation: () => void;
  terminalBottomRef: React.RefObject<HTMLDivElement | null>;
}

export const CICDPipeline: React.FC<CICDPipelineProps> = ({
  terminalLogs,
  terminalRunning,
  runTerminalSimulation,
  terminalBottomRef
}) => {
  return (
    <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div className="notion-page-header">
        <div className="notion-page-icon">⚡</div>
        <h1 className="notion-page-title">Continuous Integration Pipeline</h1>
        <p className="notion-page-description">
          Automate accessible post-processing directly on remote branches inside GitHub Actions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Workflow documentation */}
        <div className="notion-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>GitHub Action Integration</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Automatically scan components and apply compliance patches on every incoming Pull Request. Integrate **A11y-Agent** into your CI workflow to ensure that AI-generated additions never commit accessibility regressions.
          </p>
          
          <div className="notion-callout warning">
            <div className="notion-callout-icon">⚠️</div>
            <div>
              <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>Secret Keys Required</span>
              <span>Ensure your repository has a valid `GEMINI_API_KEY` configured in Actions secrets to enable vision/language evaluations.</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Workflow Config (`a11y-pipeline.yml`):</span>
            <div className="code-container" style={{ background: 'var(--sidebar-bg)', fontSize: '0.75rem' }}>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
{`name: A11y Post-Processor
on:
  pull_request:
    paths: ['src/components/**']
jobs:
  patch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.10' }
      - run: pip install google-genai beautifulsoup4
      - env: { GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }} }
        run: python -m a11y_agent.remediator --dir ./src
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "style(a11y): clean up AI JSX component nodes"`}
              </pre>
            </div>
          </div>
        </div>

        {/* Simulated CLI Terminal */}
        <div className="notion-card" style={{ background: '#0a0d16', border: '1px solid var(--panel-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
              <span style={{ fontSize: '0.75rem', color: '#8e9aa8', marginLeft: '10px', fontFamily: 'Fira Code' }}>a11y-postprocessor-cli</span>
            </div>
            <button 
              className="btn" 
              style={{ padding: '2px 8px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
              onClick={runTerminalSimulation}
              disabled={terminalRunning}
            >
              {terminalRunning ? 'Processing...' : 'Run CLI Run'}
            </button>
          </div>

          <div style={{ minHeight: '320px', background: '#020408', borderRadius: '4px', padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Fira Code', fontSize: '0.75rem' }}>
            {terminalLogs.length === 0 && (
              <div style={{ color: '#4B5563', textAlign: 'center', marginTop: '120px' }}>
                Simulate the automated terminal post-processor. Click 'Run CLI Run'.
              </div>
            )}
            {terminalLogs.map((log, idx) => (
              <div key={idx} style={{ 
                color: log.startsWith('❌') ? '#ef4444' : log.startsWith('✅') ? '#10b981' : log.startsWith('🚀') || log.startsWith('🎉') ? '#ffffff' : '#8e9aa8',
                lineHeight: '1.4'
              }}>
                <span style={{ color: '#4B5563', marginRight: '6px' }}>$</span>{log}
              </div>
            ))}
            <div ref={terminalBottomRef}></div>
          </div>
        </div>

      </div>

    </div>
  );
};

import React from 'react';
import { FolderOpen, Sparkles, UploadCloud, ClipboardList, Zap } from 'lucide-react';
import type { RemediatedFile, ActiveTabType } from './Sidebar';

interface DashboardProps {
  files: RemediatedFile[];
  isScanning: boolean;
  isRemediatingAll: boolean;
  generatingDummy: boolean;
  cacheStats: { hits: number; misses: number };
  scanActiveWorkspace: () => Promise<void>;
  generateDummyFiles: () => Promise<void>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  autoRemediateAll: () => Promise<void>;
  generateComplianceReport: () => void;
  setSelectedFile: (file: RemediatedFile) => void;
  setActiveTab: (tab: ActiveTabType) => void;
  handleDownload: (file: RemediatedFile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  files,
  isScanning,
  isRemediatingAll,
  generatingDummy,
  cacheStats,
  scanActiveWorkspace,
  generateDummyFiles,
  handleFileUpload,
  fileInputRef,
  autoRemediateAll,
  generateComplianceReport,
  setSelectedFile,
  setActiveTab,
  handleDownload
}) => {
  const getAverageScore = () => {
    if (files.length === 0) return 100;
    const total = files.reduce((acc, f) => acc + f.original_score, 0);
    return Math.round(total / files.length);
  };

  const getViolationsCount = () => {
    return files.reduce((acc, f) => acc + f.violations.length, 0);
  };

  return (
    <div className="tab-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div className="notion-page-header">
        <div className="notion-page-icon">🛡️</div>
        <h1 className="notion-page-title">Accessibility Compliance Dashboard</h1>
        <p className="notion-page-description">
          Bridge the digital inclusion gap for AI-generated React/HTML applications. Audit local frontends, resolve component-level WCAG infractions, and push clean compliant patches safely back to disk.
        </p>
      </div>

      {/* Top Callout Card */}
      <div className="notion-callout info">
        <div className="notion-callout-icon">💡</div>
        <div>
          <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>Getting Started</span>
          <span>
            Auditing operates directly on your local project. You can run a deep audit across your workspace, test using a sandboxed mock environment, or manually drop TSX elements to process individual code patches instantly.
          </span>
        </div>
      </div>

      {/* Action Ribbons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          className="btn btn-primary"
          onClick={scanActiveWorkspace}
          disabled={isScanning}
        >
          <FolderOpen size={15} /> {isScanning ? 'Auditing project...' : 'Scan Local Developer Workspace'}
        </button>
        <button 
          className="btn" 
          onClick={generateDummyFiles}
          disabled={generatingDummy || isScanning}
        >
          <Sparkles size={15} style={{ color: 'var(--warning-text)' }} /> {generatingDummy ? 'Provisioning TSX Sandbox...' : 'Reset TSX Mock Sandbox'}
        </button>
        <button 
          className="btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
        >
          <UploadCloud size={15} /> Upload TSX Components
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept=".tsx,.jsx,.html" 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
        />
      </div>

      {/* Statistics Scorecard */}
      <div className="stats-grid">
        <div className="notion-card stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Health Score</span>
            <div className="stat-value" style={{ color: getAverageScore() < 90 ? 'var(--warning-text)' : 'var(--success-text)' }}>
              {getAverageScore()}%
            </div>
          </div>
          <div style={{ fontSize: '1.75rem' }}>🟢</div>
        </div>
        
        <div className="notion-card stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>A11y Violations</span>
            <div className="stat-value" style={{ color: getViolationsCount() > 0 ? 'var(--danger-text)' : 'var(--text-primary)' }}>
              {getViolationsCount()}
            </div>
          </div>
          <div style={{ fontSize: '1.75rem' }}>⚠️</div>
        </div>

        <div className="notion-card stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Deduplication Hits</span>
            <div className="stat-value">
              {cacheStats.hits}
            </div>
          </div>
          <div style={{ fontSize: '1.75rem' }}>💾</div>
        </div>

        <div className="notion-card stat-card">
          <div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Audited Components</span>
            <div className="stat-value">
              {files.length}
            </div>
          </div>
          <div style={{ fontSize: '1.75rem' }}>📄</div>
        </div>
      </div>

      {/* Audited Files Section table */}
      {files.length === 0 ? (
        <div className="notion-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FolderOpen size={36} style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '4px', fontSize: '1rem' }}>No Audited Files Found</h3>
          <p style={{ fontSize: '0.85rem' }}>Audit your developer workspace or launch the mock sandbox to inspect template components.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Audited Document Workspace</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={generateComplianceReport}>
                <ClipboardList size={14} /> Export Compliance Audit
              </button>
              {files.some(f => f.violations.length > 0) && (
                <button className="btn btn-primary" onClick={autoRemediateAll} disabled={isRemediatingAll}>
                  <Zap size={14} /> {isRemediatingAll ? "Applying auto-patches..." : "One-Click Remediation"}
                </button>
              )}
            </div>
          </div>

          <div className="notion-table-container">
            <table className="notion-table">
              <thead>
                <tr>
                  <th>Component File</th>
                  <th>A11y Score</th>
                  <th>Outstanding Bugs</th>
                  <th>Compliance Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.filename}>
                    <td style={{ fontWeight: 600 }}>
                      📁 {file.filename}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: file.original_score >= 90 ? 'var(--success-text)' : file.original_score >= 60 ? 'var(--warning-text)' : 'var(--danger-text)' }}>
                        {file.original_score}%
                      </span>
                    </td>
                    <td>
                      <span className={`notion-tag ${file.violations.length > 0 ? 'red' : 'green'}`}>
                        {file.violations.length} violations
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 600, 
                        color: file.original_score >= 90 ? 'var(--success-text)' : file.original_score >= 60 ? 'var(--warning-text)' : 'var(--danger-text)',
                        fontSize: '0.85rem'
                      }}>
                        {file.original_score >= 90 ? 'Production Ready' : file.original_score >= 60 ? 'Warning' : 'Critical Fixes Needed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          onClick={() => {
                            setSelectedFile(file);
                            setActiveTab('workspace');
                          }}
                        >
                          Open Editor
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          onClick={() => handleDownload(file)}
                        >
                          Export TSX
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

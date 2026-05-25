import React from 'react';

interface LevelUpModalState {
  active: boolean;
  oldLevel: number;
  newLevel: number;
}

interface BadgeUnlockModalState {
  active: boolean;
  name: string;
  key: string;
  desc: string;
}

interface ModalsProps {
  levelUpModal: LevelUpModalState | null;
  setLevelUpModal: (modal: LevelUpModalState | null) => void;
  badgeUnlockModal: BadgeUnlockModalState | null;
  setBadgeUnlockModal: (modal: BadgeUnlockModalState | null) => void;
}

export const Modals: React.FC<ModalsProps> = ({
  levelUpModal,
  setLevelUpModal,
  badgeUnlockModal,
  setBadgeUnlockModal
}) => {
  return (
    <>
      {/* Level-Up Modal Overlay */}
      {levelUpModal && levelUpModal.active && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(9, 13, 24, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          animation: 'fade-in 0.3s ease'
        }}>
          <div className="notion-card animate-scale-up" style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--panel-border)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '450px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '4.5rem', animation: 'bounce 1s infinite' }}>🌟</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Level Up!
            </h2>
            <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600 }}>
              You ascended to Level {levelUpModal.newLevel}!
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Congratulations! Your dedication to digital inclusion has earned you the title of{' '}
              <strong style={{ color: 'var(--primary)' }}>
                {levelUpModal.newLevel === 1 ? 'A11y Apprentice' :
                 levelUpModal.newLevel === 2 ? 'ARIA Ranger' :
                 levelUpModal.newLevel === 3 ? 'Semantic Tactician' :
                 levelUpModal.newLevel === 4 ? 'Compliance Overlord' :
                 'Universal Access Champion'}
              </strong>!
            </p>
            <button 
              onClick={() => setLevelUpModal(null)}
              className="notion-btn primary font-semibold"
              style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', width: '100%', marginTop: '10px' }}
            >
              Claim Rewards & Continue Quest
            </button>
          </div>
        </div>
      )}

      {/* Badge Unlock Modal Overlay */}
      {badgeUnlockModal && badgeUnlockModal.active && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(9, 13, 24, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          animation: 'fade-in 0.3s ease'
        }}>
          <div className="notion-card animate-scale-up" style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--panel-border)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '450px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '4.5rem' }}>
              {badgeUnlockModal.key === 'alt_righteous' ? '📷' :
               badgeUnlockModal.key === 'keyboard_gladiator' ? '⌨️' :
               badgeUnlockModal.key === 'label_legend' ? '🏷️' :
               badgeUnlockModal.key === 'svg_sage' ? '🎨' : '🔮'}
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🏆 Trophy Unlocked!
            </h2>
            <p style={{ color: 'var(--primary)', fontSize: '1.15rem', fontWeight: 700 }}>
              [{badgeUnlockModal.name}]
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              {badgeUnlockModal.desc}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
              This achievement has been placed in your Collected Trophies cabinet. Unlocked badges will glow with active compliance gradients.
            </p>
            <button 
              onClick={() => setBadgeUnlockModal(null)}
              className="notion-btn primary font-semibold"
              style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', width: '100%', marginTop: '10px' }}
            >
              Equip Badge & Continue Quest
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import { useState } from 'react';

export interface GamificationState {
  xp: number;
  streak: number;
  badges: string[];
  levelUpModal: { active: boolean; oldLevel: number; newLevel: number } | null;
  badgeUnlockModal: { active: boolean; name: string; key: string; desc: string } | null;
  awardXp: (amount: number, description: string) => void;
  unlockBadge: (badgeKey: string, name: string, desc: string) => void;
  setLevelUpModal: (modal: { active: boolean; oldLevel: number; newLevel: number } | null) => void;
  setBadgeUnlockModal: (modal: { active: boolean; name: string; key: string; desc: string } | null) => void;
}

export const useGamification = (): GamificationState => {
  const [xp, setXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('a11y-xp') || '0', 10);
  });
  
  const [streak] = useState<number>(() => {
    return parseInt(localStorage.getItem('a11y-streak') || '1', 10);
  });

  const [badges, setBadges] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('a11y-badges') || '[]');
    } catch {
      return [];
    }
  });

  const [levelUpModal, setLevelUpModal] = useState<{ active: boolean; oldLevel: number; newLevel: number } | null>(null);
  const [badgeUnlockModal, setBadgeUnlockModal] = useState<{ active: boolean; name: string; key: string; desc: string } | null>(null);

  const playQuestChime = (type: 'success' | 'level_up' | 'quest_complete') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const playTone = (freq: number, startTime: number, duration: number, oscType: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0.08, startTime);
        // Exponential decay for beautiful bell-like sound
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      if (type === 'success') {
        playTone(523.25, now, 0.15); // C5
        playTone(659.25, now + 0.08, 0.25); // E5
      } else if (type === 'quest_complete') {
        playTone(523.25, now, 0.12);
        playTone(659.25, now + 0.06, 0.12);
        playTone(784.00, now + 0.12, 0.12);
        playTone(1046.50, now + 0.18, 0.35);
      } else if (type === 'level_up') {
        playTone(523.25, now, 0.15, 'sine');
        playTone(659.25, now + 0.08, 0.15, 'sine');
        playTone(784.00, now + 0.16, 0.15, 'sine');
        playTone(1046.50, now + 0.24, 0.45, 'triangle');
        playTone(1318.51, now + 0.32, 0.55, 'sine'); // E6
      }
    } catch (e) {
      console.error("Audio Context playback failed:", e);
    }
  };

  const awardXp = (amount: number, contextDescription: string) => {
    if (amount <= 0) return;
    
    setXp(prevXp => {
      const newXp = prevXp + amount;
      localStorage.setItem('a11y-xp', newXp.toString());
      
      const oldLevel = Math.floor(prevXp / 500) + 1;
      const newLevel = Math.floor(newXp / 500) + 1;
      
      if (newLevel > oldLevel) {
        setTimeout(() => {
          playQuestChime('level_up');
          setLevelUpModal({
            active: true,
            oldLevel,
            newLevel
          });
        }, 300);
      } else {
        playQuestChime('success');
      }
      
      return newXp;
    });

    console.log(`[A11y Quest] Earned +${amount} XP: ${contextDescription}`);
  };

  const unlockBadge = (badgeKey: string, badgeName: string, description: string) => {
    setBadges(prev => {
      if (prev.includes(badgeKey)) return prev;
      const updated = [...prev, badgeKey];
      localStorage.setItem('a11y-badges', JSON.stringify(updated));
      
      setTimeout(() => {
        playQuestChime('quest_complete');
        setBadgeUnlockModal({
          active: true,
          name: badgeName,
          key: badgeKey,
          desc: description
        });
      }, 500);
      
      return updated;
    });
  };

  return {
    xp,
    streak,
    badges,
    levelUpModal,
    badgeUnlockModal,
    awardXp,
    unlockBadge,
    setLevelUpModal,
    setBadgeUnlockModal
  };
};

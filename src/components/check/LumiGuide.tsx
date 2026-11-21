import React from 'react';
import { motion } from 'motion/react';
import { useAppData } from '../../context/AppDataContext';

interface LumiGuideProps {
  message: string;
  subMessage?: string;
  compact?: boolean;
}

export const LumiGuide: React.FC<LumiGuideProps> = ({
  message,
  subMessage,
  compact = false,
}) => {
  const { prefersReducedMotion } = useAppData();

  return (
    <div className="flex items-center gap-4">
      <motion.div
        animate={
          prefersReducedMotion
            ? { y: 0, rotate: 0 }
            : { y: [0, -5, 0], rotate: [-1.5, 1.5, -1.5] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
        }
        className="relative shrink-0"
      >
        <img
          src="/src/assets/images/buddy_avatar_lumi_1795274053620.jpg"
          alt="Lumi the friendly study owl"
          referrerPolicy="no-referrer"
          className={`${
            compact ? 'h-14 w-14' : 'h-20 w-20'
          } rounded-2xl border-2 border-amber-300 bg-[#FFFDF7] object-cover shadow-xs`}
        />
      </motion.div>

      <div className="rounded-2xl border-2 border-sky-200 bg-[#FFFDF7] px-4 py-3 text-slate-900">
        <p className="font-display text-base sm:text-lg font-bold text-slate-900">
          {message}
        </p>
        {subMessage && (
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

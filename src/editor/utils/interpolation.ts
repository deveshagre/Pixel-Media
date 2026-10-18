import { Keyframe, EasingType } from '../types';

/**
 * Standard easing calculation functions
 */
export const calculateEasing = (t: number, easing: EasingType): number => {
  const clamped = Math.max(0, Math.min(1, t));
  switch (easing) {
    case 'ease-in':
      return clamped * clamped;
    case 'ease-out':
      return clamped * (2 - clamped);
    case 'ease-in-out':
      return clamped < 0.5
        ? 2 * clamped * clamped
        : -1 + (4 - 2 * clamped) * clamped;
    case 'linear':
    default:
      return clamped;
  }
};

/**
 * Interpolate a numeric property across an array of keyframes at a given target frame
 */
export const interpolateProperty = (
  keyframes: Keyframe[] | undefined,
  targetFrame: number,
  defaultValue: number
): number => {
  if (!keyframes || keyframes.length === 0) {
    return defaultValue;
  }

  // If only 1 keyframe exists
  if (keyframes.length === 1) {
    return keyframes[0].value;
  }

  // Sort keyframes ascending
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  // Before first keyframe
  if (targetFrame <= sorted[0].frame) {
    return sorted[0].value;
  }

  // After last keyframe
  if (targetFrame >= sorted[sorted.length - 1].frame) {
    return sorted[sorted.length - 1].value;
  }

  // Find surrounding keyframe pair
  for (let i = 0; i < sorted.length - 1; i++) {
    const kfStart = sorted[i];
    const kfEnd = sorted[i + 1];

    if (targetFrame >= kfStart.frame && targetFrame <= kfEnd.frame) {
      const frameDelta = kfEnd.frame - kfStart.frame;
      if (frameDelta === 0) return kfStart.value;

      const progress = (targetFrame - kfStart.frame) / frameDelta;
      const easedProgress = calculateEasing(progress, kfEnd.easing || 'linear');
      return kfStart.value + (kfEnd.value - kfStart.value) * easedProgress;
    }
  }

  return defaultValue;
};

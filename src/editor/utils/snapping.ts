import { TimelineClip } from '../types';

export interface SnapResult {
  snappedFrame: number;
  snapped: boolean;
  snapPoint?: number;
}

/**
 * Collect all relevant magnetic snap points on the timeline
 */
export const collectSnapPoints = (
  clips: TimelineClip[],
  currentPlayheadFrame: number,
  excludeClipId?: string
): number[] => {
  const points = new Set<number>();
  // Origin
  points.add(0);
  // Current playhead
  if (currentPlayheadFrame >= 0) {
    points.add(currentPlayheadFrame);
  }

  // Clip boundaries
  clips.forEach((clip) => {
    if (clip.id !== excludeClipId) {
      points.add(clip.startFrame);
      points.add(clip.startFrame + clip.durationFrames);
    }
  });

  return Array.from(points).sort((a, b) => a - b);
};

/**
 * Find the closest snap target within a frame threshold
 */
export const findSnapTarget = (
  candidateFrame: number,
  snapPoints: number[],
  thresholdFrames = 5
): SnapResult => {
  let closestDistance = Infinity;
  let closestPoint: number | undefined;

  for (const point of snapPoints) {
    const dist = Math.abs(candidateFrame - point);
    if (dist <= thresholdFrames && dist < closestDistance) {
      closestDistance = dist;
      closestPoint = point;
    }
  }

  if (closestPoint !== undefined) {
    return {
      snappedFrame: closestPoint,
      snapped: true,
      snapPoint: closestPoint,
    };
  }

  return {
    snappedFrame: Math.max(0, candidateFrame),
    snapped: false,
  };
};

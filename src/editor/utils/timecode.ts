/**
 * Timecode and frame conversion utilities (SMPTE format: HH:MM:SS:FF)
 */

export const padZero = (num: number, size = 2): string => {
  let s = Math.floor(Math.abs(num)).toString();
  while (s.length < size) s = '0' + s;
  return s;
};

export const framesToSeconds = (frames: number, fps: number): number => {
  if (fps <= 0) return 0;
  return frames / fps;
};

export const secondsToFrames = (seconds: number, fps: number): number => {
  if (fps <= 0) return 0;
  return Math.round(seconds * fps);
};

export const framesToTimecode = (totalFrames: number, fps: number): string => {
  if (fps <= 0 || isNaN(totalFrames)) return '00:00:00:00';
  const nonNegativeFrames = Math.max(0, Math.floor(totalFrames));
  
  const framesInHour = fps * 3600;
  const framesInMinute = fps * 60;

  const hours = Math.floor(nonNegativeFrames / framesInHour);
  const remainingAfterHours = nonNegativeFrames % framesInHour;

  const minutes = Math.floor(remainingAfterHours / framesInMinute);
  const remainingAfterMinutes = remainingAfterHours % framesInMinute;

  const seconds = Math.floor(remainingAfterMinutes / fps);
  const frames = Math.floor(remainingAfterMinutes % fps);

  return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}:${padZero(frames)}`;
};

export const timecodeToFrames = (timecode: string, fps: number): number => {
  if (!timecode) return 0;
  const parts = timecode.split(':').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return 0;

  const [hours, minutes, seconds, frames] = parts;
  return Math.round(
    hours * 3600 * fps + minutes * 60 * fps + seconds * fps + frames
  );
};

export const formatTimeDisplay = (frames: number, fps: number): string => {
  const totalSeconds = framesToSeconds(frames, fps);
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds % 1) * 100);
  return `${padZero(mins)}:${padZero(secs)}.${padZero(millis)}`;
};

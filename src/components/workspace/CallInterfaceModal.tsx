import React, { useEffect, useRef } from 'react';
import { DailyCall, DailyParticipant } from '@daily-co/daily-js';
import { CallType, CallStatus } from '../../types';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  AlertCircle,
  Clock,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';

interface CallInterfaceModalProps {
  isOpen: boolean;
  callType: CallType;
  callStatus: CallStatus;
  participants: Record<string, DailyParticipant>;
  dailyCall: DailyCall | null;
  durationSec: number;
  isMuted: boolean;
  isCameraOff: boolean;
  errorMessage: string | null;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onHangUp: () => void;
  onCloseError?: () => void;
  remoteParticipantName?: string;
  projectTitle?: string;
}

function ParticipantVideoView({ 
  participant, 
  isLocal 
}: { 
  participant?: DailyParticipant; 
  isLocal: boolean; 
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const track = participant?.tracks?.video?.persistentTrack;
    if (track && participant?.tracks?.video?.state === 'playable') {
      const stream = new MediaStream([track]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.srcObject = null;
    }
  }, [participant?.tracks?.video?.persistentTrack, participant?.tracks?.video?.state]);

  const hasVideo = participant?.tracks?.video?.state === 'playable';

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center ${isLocal ? 'shadow-lg' : ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity duration-300 ${hasVideo ? 'opacity-100' : 'opacity-0'}`}
      />
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900/90 text-neutral-400">
          <div className="w-20 h-20 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white/70">
            <UserIcon size={36} />
          </div>
          <span className="text-sm font-medium text-neutral-300">
            {participant?.user_name || (isLocal ? 'You' : 'Remote Participant')}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {participant?.audio ? 'Microphone on' : 'Muted'}
          </span>
        </div>
      )}

      {/* Label Badge */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300 flex items-center gap-2">
        <span>{participant?.user_name || (isLocal ? 'You' : 'Remote')}</span>
        {participant?.audio === false && <MicOff size={12} className="text-rose-400" />}
      </div>
    </div>
  );
}

export const CallInterfaceModal: React.FC<CallInterfaceModalProps> = ({
  isOpen,
  callType,
  callStatus,
  participants,
  durationSec,
  isMuted,
  isCameraOff,
  errorMessage,
  onToggleMute,
  onToggleCamera,
  onHangUp,
  remoteParticipantName = 'Collaborator',
  projectTitle = 'Project Call',
}) => {
  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  const participantList = Object.values(participants);
  const localParticipant = participantList.find((p) => p.local);
  const remoteParticipant = participantList.find((p) => !p.local);

  return (
    <div 
      className="pm-call-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-interface-title"
    >
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[700px] bg-neutral-950 border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h2 id="call-interface-title" className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                {projectTitle}
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono uppercase">
                  {callType} Call
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Connected with <span className="text-neutral-200">{remoteParticipantName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
              <Clock size={13} className="text-neutral-400" />
              <span>{callStatus === 'connected' ? formatTimer(durationSec) : callStatus}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-mono">
              <ShieldCheck size={14} />
              <span>Encrypted</span>
            </div>
          </div>
        </div>

        {/* Center Content / Video Viewport */}
        <div className="flex-1 relative p-4 flex flex-col justify-center items-center overflow-hidden bg-neutral-950">
          
          {/* Provider Error Banner */}
          {errorMessage ? (
            <div className="max-w-md w-full p-6 rounded-2xl bg-neutral-900 border border-rose-500/30 text-center flex flex-col items-center gap-3 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-medium text-white">Call Service Unavailable</h3>
              <p className="text-xs text-neutral-400 leading-relaxed text-center">
                {errorMessage}
              </p>
              <button
                onClick={onHangUp}
                className="mt-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
              >
                Return to Conversation
              </button>
            </div>
          ) : callStatus === 'initiating' || callStatus === 'connecting' ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-neutral-900 border border-white/20 flex items-center justify-center text-white/80">
                  <UserIcon size={36} />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-30" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {callStatus === 'initiating' ? 'Initiating secure call...' : 'Connecting to meeting room...'}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Waiting for participant audio/video handshake
                </p>
              </div>
            </div>
          ) : callType === 'video' ? (
            <div className="relative w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Main / Remote Participant Screen */}
              <div className="flex-1 w-full h-full max-h-[500px]">
                <ParticipantVideoView participant={remoteParticipant} isLocal={false} />
              </div>

              {/* Local Participant Inset */}
              <div className="absolute top-4 right-4 w-36 h-28 md:w-48 md:h-36 z-20">
                <ParticipantVideoView participant={localParticipant} isLocal={true} />
              </div>
            </div>
          ) : (
            /* Voice-Only Mode */
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full bg-neutral-900 border-2 border-white/10 flex items-center justify-center text-neutral-300">
                    <UserIcon size={40} />
                  </div>
                  <span className="text-xs font-medium text-neutral-300">You</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-200" />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-full bg-neutral-900 border-2 border-white/10 flex items-center justify-center text-neutral-300">
                    <UserIcon size={40} />
                  </div>
                  <span className="text-xs font-medium text-neutral-300">{remoteParticipantName}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-white">Voice Call in Progress</p>
                <p className="text-xs text-neutral-500 mt-0.5 font-mono">High-fidelity WebRTC direct connection</p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Control Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`p-3.5 rounded-full transition-all flex items-center justify-center ${
              isMuted 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30' 
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            }`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Camera Button (for video calls) */}
          {callType === 'video' && (
            <button
              onClick={onToggleCamera}
              aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
              className={`p-3.5 rounded-full transition-all flex items-center justify-center ${
                isCameraOff 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
              }`}
            >
              {isCameraOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
            </button>
          )}

          {/* End Call / Hang Up Button */}
          <button
            onClick={onHangUp}
            aria-label="Hang up call"
            className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-rose-600/30 flex items-center gap-2"
          >
            <PhoneOff size={18} />
            <span>End Call</span>
          </button>
        </div>

      </div>
    </div>
  );
};

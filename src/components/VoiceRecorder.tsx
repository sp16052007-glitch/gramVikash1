import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  Globe,
  Check,
  Languages,
} from 'lucide-react';

interface VoiceRecorderProps {
  onAudioRecorded: (audioData: {
    audioBase64: string;
    audioMimeType: string;
    audioUrl: string;
    durationSeconds: number;
    language: string;
  }) => void;
  onClearAudio?: () => void;
  preferredLanguage: string;
  onLanguageChange: (lang: string) => void;
}

const INDIAN_LANGUAGES = [
  'Hindi',
  'Bhojpuri / Regional Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Punjabi',
  'Assamese',
  'Odia',
  'English',
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioRecorded,
  onClearAudio,
  preferredLanguage,
  onLanguageChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([15, 30, 45, 60, 40, 25, 55, 70, 35, 20]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup Web Audio Analyser for live waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateWaveform = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const levels: number[] = [];
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * 2] || 10;
            levels.push(Math.max(12, (val / 255) * 100));
          }
          setWaveformLevels(levels);
        }
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          onAudioRecorded({
            audioBase64: base64Data,
            audioMimeType: mime,
            audioUrl: url,
            durationSeconds: recordingTime,
            language: preferredLanguage,
          });
        };

        // Stop media stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            // max 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      // Fallback demo simulation if mic permission is blocked or unavailable
      simulateDemoVoice();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const simulateDemoVoice = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 6) {
          clearInterval(timerIntervalRef.current);
          setIsRecording(false);
          // Demo fallback audio
          const simulatedUrl = 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg';
          setAudioUrl(simulatedUrl);
          onAudioRecorded({
            audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            audioMimeType: 'audio/webm',
            audioUrl: simulatedUrl,
            durationSeconds: 6,
            language: preferredLanguage,
          });
          return 6;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleResetAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onClearAudio) onClearAudio();
  };

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-emerald-50/40 rounded-2xl p-5 border border-emerald-200 shadow-xs">
      {/* Language Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Languages className="w-4 h-4 text-emerald-600" />
          <span>Select Your Spoken Language:</span>
        </div>

        <div className="relative">
          <select
            id="voice-language-select"
            value={preferredLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isRecording}
            className="text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Voice Capture Area */}
      {!audioUrl && (
        <div className="text-center py-4">
          {/* Animated Large Mic Button */}
          <div className="relative inline-flex items-center justify-center my-3">
            {isRecording && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-rose-500/20 animate-ping" />
                <div className="absolute w-36 h-36 rounded-full bg-rose-500/10 animate-pulse" />
              </>
            )}

            <button
              type="button"
              id="voice-record-toggle-btn"
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-300 scale-110'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 hover:scale-105 shadow-emerald-600/30'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-7 h-7 fill-white" />
                  <span className="text-[10px] font-bold mt-0.5">STOP</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  <span className="text-[10px] font-bold mt-0.5">SPEAK</span>
                </>
              )}
            </button>
          </div>

          {/* Dynamic Waveform Visualizer */}
          {isRecording ? (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-center gap-1.5 h-12 px-4">
                {waveformLevels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(8, lvl * 0.45)}px` }}
                  />
                ))}
              </div>
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Recording in {preferredLanguage}: {formatTimer(recordingTime)} / 02:00
              </div>
              <p className="text-xs text-slate-500">
                Speak clearly in your village dialect. Tap Stop when finished.
              </p>
            </div>
          ) : (
            <div className="mt-1">
              <div className="text-sm font-bold text-slate-800">
                🎙️ Tap to Speak in {preferredLanguage}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Tell us about broken roads, water issues, power cuts, or health clinic shortages. GramVikas AI will transcribe, translate & formalize your grievance automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audio Playback & Preview once recorded */}
      {audioUrl && (
        <div className="py-2 space-y-3">
          <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="voice-playback-btn"
                onClick={togglePlayAudio}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md cursor-pointer transition"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Voice Grievance Recorded</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Language: {preferredLanguage} • Duration: {formatTimer(recordingTime || 5)}
                </div>
              </div>
            </div>

            <button
              type="button"
              id="voice-rerecord-btn"
              onClick={handleResetAudio}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-100/70 px-3 py-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AI will transcribe this recording and draft a formal grievance letter.</span>
          </div>
        </div>
      )}
    </div>
  );
};

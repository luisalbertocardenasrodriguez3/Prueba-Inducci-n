import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Clock,
  Film,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface TutorialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInduction?: () => void;
  theme?: 'dark' | 'light';
}

export const TutorialVideoModal: React.FC<TutorialVideoModalProps> = ({
  isOpen,
  onClose,
  onStartInduction,
  theme = 'dark',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(97); // ~1:37 total duration
  const [hasError, setHasError] = useState(false);

  const isDark = theme === 'dark';

  // Handle open/close and keyboard events
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    setHasError(false);

    // Auto-attempt play on user opening the modal
    const playTimer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              // Autoplay with sound may be blocked by browser policy until user clicks play
              setIsPlaying(false);
            });
        }
      }
    }, 200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && videoRef.current) {
        // Space to toggle play/pause
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(playTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    soundManager.playClick();
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    soundManager.playClick();
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const rewind10 = () => {
    if (!videoRef.current) return;
    soundManager.playClick();
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };

  const forward10 = () => {
    if (!videoRef.current) return;
    soundManager.playClick();
    videoRef.current.currentTime = Math.min(
      videoRef.current.duration || duration,
      videoRef.current.currentTime + 10
    );
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    soundManager.playClick();
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    soundManager.playClick();
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    soundManager.playClick();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen?.().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Floating Modal Window */}
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-slate-900 border-emerald-500/30 text-white shadow-emerald-950/40'
            : 'bg-white border-emerald-500/30 text-slate-900 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Window Titlebar */}
        <div
          className={`flex items-center justify-between px-5 sm:px-7 py-4 border-b ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-['Space_Grotesk'] leading-tight">
                  Video Tutorial: Inducción Institucional SENA
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  <Clock className="w-3 h-3" />
                  1:37 min
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Guía visual oficial: Caracterización sin errores, 5 módulos y descarga del Certificado con QR
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-all hover:scale-105 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200'
            }`}
            title="Cerrar ventana (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Canvas Container */}
        <div className="relative bg-black flex-1 flex flex-col justify-center items-center overflow-hidden">
          {hasError ? (
            <div className="py-16 px-6 text-center space-y-4 text-white">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold">No se pudo reproducir el video</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  El navegador no pudo cargar el archivo MP4. Intenta recargar o verificar el enlace.
                </p>
              </div>
              <button
                onClick={() => {
                  setHasError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar Reproducción</span>
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-video max-h-[58vh] bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                controls
                playsInline
                preload="auto"
                className="w-full h-full max-h-[58vh] object-contain shadow-inner"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={() => {
                  if (videoRef.current) {
                    setIsMuted(videoRef.current.muted || videoRef.current.volume === 0);
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    if (videoRef.current.duration) {
                      setDuration(videoRef.current.duration);
                    }
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error('Video error:', e);
                  setHasError(true);
                }}
              >
                <source src="/assets/aistudio/2026__16_36_19d77c64.mp4" type="video/mp4" />
                <source src="assets/aistudio/2026__16_36_19d77c64.mp4" type="video/mp4" />
                Tu navegador no soporta reproducción de video HTML5.
              </video>

              {/* Big Centered Play Button when paused */}
              {!isPlaying && !hasError && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition-all hover:scale-110 group pointer-events-auto cursor-pointer"
                  title="Reproducir video"
                >
                  <Play className="w-9 h-9 fill-white ml-1 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Custom Quick Playback Floating Toolbar */}
        <div
          className={`px-4 sm:px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {/* Left: Play/Pause, Rewind, Forward, Time */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Reproducir</span>
                </>
              )}
            </button>

            <button
              onClick={rewind10}
              className={`px-2.5 py-1.5 rounded-xl border font-mono text-[11px] font-semibold transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Retroceder 10 segundos"
            >
              -10s
            </button>

            <button
              onClick={forward10}
              className={`px-2.5 py-1.5 rounded-xl border font-mono text-[11px] font-semibold transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Avanzar 10 segundos"
            >
              +10s
            </button>

            <button
              onClick={restartVideo}
              className={`p-1.5 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Reiniciar desde el inicio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Time Indicator */}
            <span className="font-mono text-[11px] text-slate-400 pl-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Audio, Speed, Fullscreen, Action button */}
          <div className="flex items-center gap-2">
            {/* Speed Pills */}
            <div className="flex items-center gap-1">
              {[1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    playbackRate === rate
                      ? 'bg-emerald-600 text-white'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-white'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                  title={`Velocidad ${rate}x`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title="Pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Quick Guide Summary & Action */}
        <div
          className={`px-5 sm:px-7 py-3 sm:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Ingreso Aprendiz</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Caracterización</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <span>5 Módulos + Test</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Certificado con QR</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cerrar
            </button>

            {onStartInduction && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                  onStartInduction();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-black text-xs shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <span>Comenzar Mi Inducción</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

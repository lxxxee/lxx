import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { blobToBase64 } from '../utils';
import { parseAudioTransaction } from '../services/gemini';
import { Transaction, TransactionType } from '../types';

interface VoiceRecorderProps {
  onTransactionsParsed: (transactions: Transaction[]) => void;
}

const SILENCE_THRESHOLD = 0.01; // Sensitivity (0.01 - 0.1)
const SILENCE_DURATION = 1800; // 1.8 seconds of silence to auto-stop
const MIN_RECORDING_MS = 500; // Ignore recordings shorter than 0.5s (likely noise)

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTransactionsParsed }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [silenceProgress, setSilenceProgress] = useState(0); // 0 to 100
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Monitor silence loop
  const checkSilence = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    setVolume(rms);

    if (rms < SILENCE_THRESHOLD) {
      if (silenceStartRef.current === null) {
        silenceStartRef.current = Date.now();
      } else {
        const elapsed = Date.now() - silenceStartRef.current;
        const progress = Math.min((elapsed / SILENCE_DURATION) * 100, 100);
        setSilenceProgress(progress);

        if (elapsed > SILENCE_DURATION) {
          stopRecording();
          return;
        }
      }
    } else {
      silenceStartRef.current = null;
      setSilenceProgress(0);
    }

    animationFrameRef.current = requestAnimationFrame(checkSilence);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Audio Analyser for Silence Detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/ogg')
          ? 'audio/ogg'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const duration = recordingStartRef.current ? Date.now() - recordingStartRef.current : 0;
        
        if (duration < MIN_RECORDING_MS) {
          console.log("Recording too short, ignoring...");
          cleanupRecording(stream);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        await processAudio(audioBlob);
        cleanupRecording(stream);
      };

      mediaRecorder.start();
      recordingStartRef.current = Date.now();
      setIsRecording(true);
      silenceStartRef.current = null;
      setSilenceProgress(0);
      checkSilence();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Cannot access microphone. Please allow permissions.");
    }
  };

  const cleanupRecording = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRecording(false);
    setSilenceProgress(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const base64 = await blobToBase64(blob);
      const result = await parseAudioTransaction(base64, blob.type);
      
      if (!result.transactions || result.transactions.length === 0) {
        return; // Silent ignore or show minimal toast
      }

      const newTransactions: Transaction[] = result.transactions.map((t) => ({
        id: crypto.randomUUID(),
        date: t.date || new Date().toISOString().split('T')[0],
        description: t.description || "Spoken Entry",
        category: t.category || "Other",
        amount: t.amount,
        type: t.type as TransactionType || TransactionType.EXPENSE,
      }));

      onTransactionsParsed(newTransactions);
    } catch (error) {
      console.error("Processing failed:", error);
      alert("ไม่สามารถประมวลผลได้ กรุณาลองพูดอีกครั้ง");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md mx-auto mb-8 transition-all hover:shadow-xl relative overflow-hidden">
      {/* Silence Progress Bar Background */}
      {isRecording && (
        <div 
          className="absolute bottom-0 left-0 h-1.5 bg-blue-500 transition-all duration-300 opacity-70"
          style={{ width: `${silenceProgress}%` }}
        />
      )}

      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Voice Entry (AI)</h3>
        <p className="text-sm text-gray-500">
          {isRecording ? "Listening... (จะหยุดเองเมื่อพูดจบ)" : "Tap to record expenses"}
        </p>
      </div>

      <div className="relative group">
        {/* Animated Rings */}
        {isRecording && (
          <>
            <div className="absolute -inset-4 bg-blue-100 rounded-full animate-ping opacity-25"></div>
            <div className="absolute -inset-8 bg-blue-50 rounded-full animate-ping opacity-10"></div>
          </>
        )}
        
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isRecording ? 'animate-pulse' : ''}`}></div>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative w-20 h-20 flex items-center justify-center rounded-full transition-all transform duration-200 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 scale-110' 
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          } text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {isRecording && (
        <div className="mt-4 flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 text-blue-600">
             <Volume2 size={16} />
             <div className="flex gap-0.5 items-end h-4">
               {[...Array(6)].map((_, i) => (
                 <div 
                   key={i} 
                   className="w-1 bg-blue-500 rounded-full transition-all duration-75"
                   style={{ height: `${Math.max(4, volume * 100 * (i + 1) * 0.4)}px` }}
                 />
               ))}
             </div>
           </div>
        </div>
      )}

      {!isRecording && (
        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-gray-400 italic">
            "พูดแค่ยอดเงินก็ได้ เช่น 500"
          </p>
          <p className="text-xs text-gray-400 italic">
            "ข้าวผัด 60" | "ค่าน้ำ 300"
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onTranscript: (text: string) => void;
  onInterim?: (text: string) => void;
};

// Usa Web Speech API (reconhecimento nativo do navegador)
export function AudioAnswerButton({ onTranscript, onInterim }: Props) {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript + " ";
        else interimText += transcript;
      }
      if (interimText) {
        setInterim(interimText);
        onInterim?.(interimText);
      }
      if (finalText.trim()) {
        onTranscript(finalText.trim());
        setInterim("");
      }
    };

    rec.onerror = (e: any) => {
      const err = e?.error ?? "desconhecido";
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast.error("Permissão de microfone negada. Habilite o microfone para este site nas configurações do navegador.");
      } else if (err === "no-speech") {
        toast.warning("Nenhuma fala detectada. Fale mais perto do microfone e tente novamente.");
      } else if (err === "audio-capture") {
        toast.error("Microfone não encontrado. Conecte um microfone e tente novamente.");
      } else {
        toast.error(`Erro no áudio: ${err}`);
      }
      manualStopRef.current = true;
      setRecording(false);
      setInterim("");
    };

    rec.onend = () => {
      setRecording(false);
      setInterim("");
    };

    recognitionRef.current = rec;
    return () => {
      manualStopRef.current = true;
      try {
        rec.stop();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    const rec = recognitionRef.current;
    if (!rec) return;

    // Pede permissão de microfone explicitamente para garantir contexto seguro
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Libera imediatamente — a Web Speech API gerencia seu próprio stream
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (err: any) {
      toast.error("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
      return;
    }

    try {
      manualStopRef.current = false;
      rec.start();
      setRecording(true);
      toast.success("Gravando — fale agora. Clique de novo para parar.");
    } catch (e: any) {
      // start() lança se já estiver rodando — tenta reiniciar
      try {
        rec.stop();
        setTimeout(() => {
          try {
            rec.start();
            setRecording(true);
          } catch {
            toast.error("Não foi possível iniciar a gravação");
          }
        }, 200);
      } catch {
        toast.error("Não foi possível iniciar a gravação");
      }
    }
  }

  function stopRecording() {
    const rec = recognitionRef.current;
    if (!rec) return;
    manualStopRef.current = true;
    try {
      rec.stop();
    } catch {}
    setRecording(false);
  }

  function toggle() {
    if (recording) stopRecording();
    else startRecording();
  }

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50"
        title="Seu navegador não suporta entrada por voz. Tente o Chrome ou Edge."
      >
        <MicOff className="size-3.5" /> Áudio indisponível neste navegador
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
          recording
            ? "animate-pulse border-transparent"
            : "border-border bg-card text-foreground hover:border-[var(--block-estudar)]"
        }`}
        style={recording ? { backgroundColor: "var(--block-estudar)", color: "var(--block-estudar-on)" } : undefined}
      >
        {recording ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Gravando... clique para parar
          </>
        ) : (
          <>
            <Mic className="size-3.5" /> Responder por áudio
          </>
        )}
      </button>
      {recording && interim && (
        <div className="rounded-lg border border-border/50 bg-muted/40 px-2 py-1 text-xs italic text-muted-foreground">
          ouvindo: "{interim}"
        </div>
      )}
      {recording && !interim && (
        <div className="px-2 text-xs text-muted-foreground">
          🎤 Fale agora... a transcrição aparece aqui em tempo real.
        </div>
      )}
    </div>
  );
}

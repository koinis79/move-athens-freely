import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, BellRing, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Permission = "default" | "granted" | "denied" | "unsupported";

interface NewBookingPayload {
  id: string;
  booking_number: string;
  customer_name: string;
  total_amount: number;
}

const ICON_URL =
  "https://lmgpuqgwkiapgpdsxvmb.supabase.co/storage/v1/object/public/assets/movability-logo-icon.png";

const SOUND_PREF_KEY = "admin_notification_sound_enabled";

/**
 * Subtle two-tone chime using the Web Audio API.
 * No external files needed — generated at runtime.
 */
function useChime() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        ctxRef.current = new AC();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Two-tone ding: C5 (523Hz) → E5 (659Hz)
      const playTone = (freq: number, start: number, duration: number, peak = 0.15) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.18);           // C5
      playTone(659.25, now + 0.09, 0.25);    // E5, offset for chime effect
    } catch (err) {
      console.warn("Chime playback failed:", err);
    }
  }, []);

  return play;
}

/**
 * Admin-only: requests browser notification permission, subscribes to
 * Supabase realtime on `bookings` INSERT, fires a native notification,
 * plays a subtle chime, and shows an in-app toast.
 */
export default function AdminBookingNotifier() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [permission, setPermission] = useState<Permission>("default");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(SOUND_PREF_KEY);
    return stored === null ? true : stored === "true";
  });
  const playChime = useChime();

  // Detect initial permission state
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as Permission);
  }, []);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem(SOUND_PREF_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    if (result === "granted") {
      toast({ title: "Notifications enabled", description: "You'll be alerted when new bookings arrive." });
      // Play a test chime so the user hears what it sounds like
      if (soundEnabled) setTimeout(playChime, 200);
    } else if (result === "denied") {
      toast({ title: "Notifications blocked", description: "Enable them in your browser settings.", variant: "destructive" });
    }
  }, [toast, soundEnabled, playChime]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      toast({
        title: next ? "Sound enabled" : "Sound muted",
        description: next ? "You'll hear a chime on new bookings." : "No sound on new bookings.",
      });
      // Preview the chime when enabling
      if (next) setTimeout(playChime, 150);
      return next;
    });
  }, [toast, playChime]);

  // Realtime subscription — active only when granted
  useEffect(() => {
    if (permission !== "granted") return;

    const channel = supabase
      .channel("admin-new-bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          const b = payload.new as NewBookingPayload;
          const amount = Number(b.total_amount ?? 0).toFixed(0);
          const title = "New Booking!";
          const body = `${b.booking_number} · ${b.customer_name} · €${amount}`;

          // Play chime (respects mute)
          if (soundEnabled) playChime();

          // Native browser notification
          try {
            const n = new Notification(title, {
              body,
              icon: ICON_URL,
              tag: b.booking_number,
              requireInteraction: false,
            });
            n.onclick = () => {
              window.focus();
              navigate("/admin/bookings");
              n.close();
            };
          } catch (err) {
            console.error("Notification failed:", err);
          }

          // In-app toast fallback
          toast({ title, description: body });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission, navigate, toast, soundEnabled, playChime]);

  // Sound toggle — only shown when permission is granted (otherwise no point)
  const soundToggle = permission === "granted" ? (
    <button
      type="button"
      onClick={toggleSound}
      title={soundEnabled ? "Mute notification sound" : "Enable notification sound"}
      className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
        soundEnabled
          ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
          : "text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200"
      }`}
    >
      {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
    </button>
  ) : null;

  if (permission === "unsupported") return null;

  let permissionButton: React.ReactNode = null;

  if (permission === "granted") {
    permissionButton = (
      <button
        type="button"
        disabled
        title="Notifications enabled"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 cursor-default"
      >
        <BellRing className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Live</span>
      </button>
    );
  } else if (permission === "denied") {
    permissionButton = (
      <button
        type="button"
        disabled
        title="Blocked — enable in browser settings"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed"
      >
        <BellOff className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Blocked</span>
      </button>
    );
  } else {
    permissionButton = (
      <button
        type="button"
        onClick={requestPermission}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-primary bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Enable Notifications</span>
        <span className="sm:hidden">Alerts</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {permissionButton}
      {soundToggle}
    </div>
  );
}

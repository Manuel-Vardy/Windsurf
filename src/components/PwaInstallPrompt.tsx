import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const isIos = useMemo(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }, []);

  const isStandalone = useMemo(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    return Boolean(nav.standalone) || window.matchMedia("(display-mode: standalone)").matches;
  }, []);

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [isStandalone]);

  if (isInstalled) return null;

  if (deferredPrompt) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={async () => {
          const prompt = deferredPrompt;
          setDeferredPrompt(null);
          await prompt.prompt();
          await prompt.userChoice;
        }}
      >
        Install App
      </Button>
    );
  }

  if (isIos) {
    return (
      <div className="text-xs text-muted-foreground">
        Install: Share button then "Add to Home Screen"
      </div>
    );
  }

  return null;
}

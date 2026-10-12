"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { MESSAGES } from "@/lib/messages";

export function WelcomeToast() {
  useEffect(() => {
    if (typeof window === "undefined" || window.innerHeight < 650) return;
    if (!localStorage.getItem("welcome-toast-shown")) {
      toast.add({
        title: MESSAGES.welcome.title,
        type: "success",
        timeout: 6000,
        onClose: () => {
          localStorage.setItem("welcome-toast-shown", "true");
        },
        description: MESSAGES.welcome.description,
      });
    }
  }, []);

  return null;
}

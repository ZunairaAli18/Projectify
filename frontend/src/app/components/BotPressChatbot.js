"use client";

import { useEffect } from "react";

export default function BotpressChatbot({ user }) {
  useEffect(() => {
    console.log("BotpressChatbot mounted with user:", user);

    // Inject Botpress Webchat script first
    const injectScript = document.createElement("script");
    injectScript.src = "https://cdn.botpress.cloud/webchat/v3.2/inject.js";
    injectScript.defer = true;

    injectScript.onload = () => {
      console.log("Botpress inject.js loaded");

      // Now inject your hosted config script
      const configScript = document.createElement("script");
      configScript.src =
        "https://files.bpcontent.cloud/2025/07/29/04/20250729045753-JVRYGCXN.js";
      configScript.defer = true;
      document.body.appendChild(configScript);
    };

    document.body.appendChild(injectScript);

    // Cleanup
    return () => {
      if (injectScript.parentNode)
        injectScript.parentNode.removeChild(injectScript);
      const configScript = document.querySelector(
        `script[src="https://files.bpcontent.cloud/2025/07/29/04/20250729045753-JVRYGCXN.js"]`
      );
      if (configScript && configScript.parentNode)
        configScript.parentNode.removeChild(configScript);
    };
  }, [user]);

  return null;
}

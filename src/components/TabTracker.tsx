"use client";

import { useEffect, useState } from "react";

export default function TabTracker() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const maxAllowedSwitches = 1;

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          console.log(`User switched tab! Count: ${newCount}`);

          // Send to Next.js API route
          fetch("/api/track-tab-switch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              count: newCount,
            }),
          });

          if (newCount >= maxAllowedSwitches) {
            alert("Too many tab switches! Please complete the test.");
            submitTest();
          }

          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const submitTest = () => {
    console.log("Submitting test...");
  };

  return null; 
}

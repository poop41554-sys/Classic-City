import { useEffect } from "react";

export function SecurityProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        return false;
      }
    };


    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };


    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = "<div style='display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:#fff;font-size:24px;font-family:Cairo,sans-serif;'>⚠️ تم كشف أدوات المطور - يرجى إغلاقها</div>";
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    
    const devToolsInterval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(devToolsInterval);
    };
  }, []);

  return <>{children}</>;
}

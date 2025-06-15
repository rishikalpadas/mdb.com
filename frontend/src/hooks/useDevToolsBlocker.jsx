import { useEffect } from 'react';

const useDevToolsBlocker = () => {
  useEffect(() => {
    let devtoolsOpen = false;

    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          document.body.innerHTML = ""; // Option 1: wipe screen
          window.location.href = "https://google.com"; // Option 2: redirect
        }
      } else {
        devtoolsOpen = false;
      }
    };

    const interval = setInterval(checkDevTools, 500);

    return () => clearInterval(interval);
  }, []);
};

export default useDevToolsBlocker;

import { useEffect } from 'react';

const useDisableRightClick = () => {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Block keyboard shortcuts for DevTools
    const handleKeyDown = (e) => {
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+U / F12
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag events on images
    const disableImageDrag = () => {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', (e) => e.preventDefault());
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    disableImageDrag();

    // Mutation observer to catch new images
    const observer = new MutationObserver(disableImageDrag);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, []);
};

export default useDisableRightClick;

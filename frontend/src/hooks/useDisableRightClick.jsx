import { useEffect } from 'react';

const useDisableRightClick = () => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
};

export default useDisableRightClick;
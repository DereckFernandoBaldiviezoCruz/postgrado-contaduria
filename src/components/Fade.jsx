import { useEffect, useState } from 'react';

export default function Fade({ children, duration = 250 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? 'blur(0px)' : 'blur(4px)',
        transition: `opacity ${duration}ms ease, filter ${duration}ms ease`,
      }}
    >
      {children}
    </div>
  );
}

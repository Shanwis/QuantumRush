import type { ReactNode } from 'react';

export function CrtFrame({
  children,
  corner,
}: {
  children: ReactNode;
  corner?: ReactNode;
}) {
  return (
    <div className="crt-shell">
      <div className="crt-frame">
        {corner ? <div className="crt-frame__corner">{corner}</div> : null}
        <div className="crt-screen">{children}</div>
      </div>
    </div>
  );
}

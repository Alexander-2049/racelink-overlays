import { useState } from 'react';

/** A picture Racelink serves; it leaves its place empty when Racelink has none. */
export function Asset({ src, className }: Readonly<{ src: string; className: string }>) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={className}>
      {failed !== src && (
        <img
          src={src}
          alt=""
          draggable={false}
          onError={() => {
            setFailed(src);
          }}
        />
      )}
    </span>
  );
}

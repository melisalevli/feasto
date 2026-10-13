import type { ReactNode } from 'react';

interface Props {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export default function Page({ title, aside, children }: Props) {
  return (
    <section>
      <div className="g">
        <div className="pg">
          <div className="mh">
            <h2>{title}</h2>
            {aside}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
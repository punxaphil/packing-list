import React from 'react';

export function Span({ children, strike, className }: {
  children: React.ReactNode,
  strike: boolean,
  className?: string
}) {
  return <span className={`${className} ${strike ? 'strike' : ''}`}>{children}</span>;
}

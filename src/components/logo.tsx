import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22V12" />
      <path d="M4.73 14.16 12 22l7.27-7.84" />
      <path d="M12 2 4.73 6.16l7.27 7.84L19.27 6.16Z" />
      <path d="m4.73 6.16 7.27-4.16L19.27 6.16" />
      <path d="M2 10.96V12l10 10 10-10v-1.04" />
    </svg>
  );
}

import type { SVGProps } from 'react';

export const Icons = {
  Logo: (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M4 12.25h16M12.25 4v16" />
      <path d="M10.25 2.75A5.5 5.5 0 0 0 6 8.25v7.5a5.5 5.5 0 0 0 4.25 5.25" />
      <path d="M13.75 21.25A5.5 5.5 0 0 0 18 15.75v-7.5a5.5 5.5 0 0 0-4.25-5.25" />
    </svg>
  ),
};

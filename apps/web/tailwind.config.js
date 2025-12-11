// import { createGlobPatternsForDependencies } from '@nx/next/tailwind';

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './{pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../packages/ui/**/*.{ts,tsx,js,jsx,html}',
    '!../packages/ui/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#8B5CF6',
        'light-purple': '#C4B5FD',
        'dark-purple': '#6D28D9',
        'accent-teal': '#06B6D4',
        'success-green': '#10B981',
        'ocean-blue': '#0EA5E9',
        'neutral-dark': '#0F172A',
        'neutral-medium': '#475569',
        'neutral-light': '#F8FAFC',
      },
    },
  },
  plugins: [],
};

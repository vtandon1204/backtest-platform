// Mark this file as a Client Component for Next.js
'use client';

// Import necessary MUI components and theming tools
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import React from 'react';

// Create a custom MUI theme with dark mode enabled
const theme = createTheme({
  palette: {
    mode: 'dark', // Enables dark theme across all MUI components
  },
});

/**
 * MuiProvider component wraps children with Material UI's ThemeProvider.
 * It applies a dark theme and ensures baseline CSS is injected.
 *
 * This is used to integrate MUI with Next.js App Router.
 *
 * @param {React.ReactNode} children - Components that will inherit the theme
 */
export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline provides consistent default styles (normalize.css + MUI tweaks) */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

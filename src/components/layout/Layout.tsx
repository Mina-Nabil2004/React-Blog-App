import type { ReactNode } from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-surface-border bg-white py-6 text-center text-sm text-content-tertiary">
        © {new Date().getFullYear()} BlogApp. Built with React & NestJS.
      </footer>
    </div>
  );
}

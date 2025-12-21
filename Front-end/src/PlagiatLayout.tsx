import { PlagiatNav } from 'src/components/PlagiatNav';

export function PlagiatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation interne du module Plagiat */}
      <PlagiatNav />

      {/* Contenu des pages */}
      <main className="p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
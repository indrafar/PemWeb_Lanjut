// resources/js/Components/ui/card.tsx
import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-lg shadow-md p-4 ${className}`}>
            {children}
        </div>
    );
}

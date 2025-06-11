import * as React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Checkbox(props: CheckboxProps) {
    return (
        <input
            type="checkbox"
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
            {...props}
        />
    );
}

declare module '@heroicons/react/outline' {
    import { ComponentType, SVGProps } from 'react';

    export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

    export const TrashIcon: IconComponent;
    export const RefreshIcon: IconComponent;
    export const SearchIcon: IconComponent;
    export const MenuIcon: IconComponent;
    export const XIcon: IconComponent;
    // Add other icons as needed
}
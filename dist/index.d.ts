import React from 'react';

declare function getNotionViewUrl(project?: string): string;

interface DevOverlayTheme {
    accent?: string;
    accentText?: string;
    background?: string;
    border?: string;
    text?: string;
}
interface DevOverlayProps {
    project?: string;
    theme?: DevOverlayTheme;
    accentColor?: string;
    apiEndpoint?: string;
}
declare function DevOverlay({ project, theme, accentColor, apiEndpoint, }: DevOverlayProps): React.JSX.Element | null;

export { DevOverlay, type DevOverlayProps, type DevOverlayTheme, getNotionViewUrl };

interface TurnstileOptions {
    sitekey: string;
    callback?: (token: string) => void;
    "error-callback"?: () => void;
    "expired-callback"?: () => void;
    "timeout-callback"?: () => void;
    "timeout-callback"?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
    tabindex?: number;
    action?: string;
    cData?: string;
    language?: string;
    appearance?: "always" | "execute" | "interaction-only";
}

declare global {
    interface Window {
        turnstile: {
            render: (container: string | HTMLElement, options: TurnstileOptions) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

export {};

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(customShortcuts?: ShortcutConfig[]) {
    const navigate = useNavigate();

    // Default shortcuts
    const defaultShortcuts: ShortcutConfig[] = [
        {
            key: "n",
            meta: true,
            action: () => navigate("/projects/new"),
            description: "New Project",
        },
        {
            key: "i",
            meta: true,
            shift: true,
            action: () => navigate("/invoices/new"),
            description: "New Invoice",
        },
        {
            key: "p",
            meta: true,
            shift: true,
            action: () => navigate("/proposals/new"),
            description: "New Proposal",
        },
        {
            key: ",",
            meta: true,
            action: () => navigate("/settings"),
            description: "Open Settings",
        },
        {
            key: "d",
            meta: true,
            shift: true,
            action: () => navigate("/dashboard"),
            description: "Go to Dashboard",
        },
    ];

    const shortcuts = [...defaultShortcuts, ...(customShortcuts || [])];

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Skip if user is typing in an input
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            for (const shortcut of shortcuts) {
                const metaMatch = shortcut.meta ? event.metaKey || event.ctrlKey : !event.metaKey && !event.ctrlKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (metaMatch && shiftMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return { shortcuts };
}

// Shortcut display helper
export function getShortcutDisplay(shortcut: ShortcutConfig): string {
    const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
    const parts: string[] = [];

    if (shortcut.meta) {
        parts.push(isMac ? "⌘" : "Ctrl");
    }
    if (shortcut.shift) {
        parts.push(isMac ? "⇧" : "Shift");
    }
    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? "" : "+");
}

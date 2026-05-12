"use client";

import {useEffect, useState} from "react";
import {LogOut, Monitor, Smartphone, Tablet} from "lucide-react";
import {toast} from "sonner";
import {formatDistanceToNow} from "date-fns";
import {fr} from "date-fns/locale";

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

type Session = {
    id: string;
    token: string;
    expiresAt: string | Date;
    createdAt: string | Date;
    ipAddress?: string | null;
    userAgent?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDevice(ua: string | null | undefined) {
    if (!ua) return {Icon: Monitor, label: "Appareil inconnu"};

    const isMobile = /mobile|android|iphone/i.test(ua);
    const isTablet = /ipad|tablet/i.test(ua);
    const Icon = isTablet ? Tablet : isMobile ? Smartphone : Monitor;

    let browser = "";
    if (/edg\//i.test(ua)) browser = "Edge";
    else if (/chrome/i.test(ua)) browser = "Chrome";
    else if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";

    let os = "";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad/i.test(ua)) os = "iOS";
    else if (/mac/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";

    return {Icon, label: [browser, os].filter(Boolean).join(" · ") || "Navigateur inconnu"};
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SessionsPanel() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const {data: current} = authClient.useSession();
    const currentToken = current?.session?.token;

    useEffect(() => {
        authClient.listSessions().then(({data}) => {
            setSessions((data as Session[]) ?? []);
            setLoading(false);
        });
    }, []);

    async function revoke(token: string) {
        const res = await authClient.revokeSession({token});
        if (res.error) { toast.error("Impossible de révoquer la session."); return; }
        setSessions((s) => s.filter((sess) => sess.token !== token));
        toast.success("Session déconnectée.");
    }

    async function revokeOthers() {
        const res = await authClient.revokeOtherSessions();
        if (res.error) { toast.error("Impossible de déconnecter les autres sessions."); return; }
        setSessions((s) => s.filter((sess) => sess.token === currentToken));
        toast.success("Autres sessions déconnectées.");
    }

    const others = sessions.filter((s) => s.token !== currentToken);

    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-lg bg-muted animate-pulse"/>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Sessions actives ({sessions.length})
                </p>
                {others.length > 0 && (
                    <button
                        onClick={revokeOthers}
                        className="text-xs text-destructive hover:underline transition-colors"
                    >
                        Tout déconnecter
                    </button>
                )}
            </div>

            <ul className="space-y-2">
                {sessions.map((sess) => {
                    const isCurrent = sess.token === currentToken;
                    const {Icon, label} = parseDevice(sess.userAgent);
                    const ago = formatDistanceToNow(new Date(sess.createdAt), {
                        addSuffix: true,
                        locale: fr,
                    });

                    return (
                        <li key={sess.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background">
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground"/>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {label}
                                    </span>
                                    {isCurrent && (
                                        <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-accent-dark/10 text-brand-accent-dark">
                                            Session actuelle
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {sess.ipAddress ?? "IP inconnue"} · {ago}
                                </p>
                                
                            </div>
                            {!isCurrent && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => revoke(sess.token)}
                                    className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                    aria-label="Déconnecter cette session"
                                >
                                    <LogOut className="h-3.5 w-3.5"/>
                                </Button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

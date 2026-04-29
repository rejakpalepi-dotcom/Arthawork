import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, FileText, CreditCard, Users, Clock } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const notificationIcons: Record<Notification["type"], typeof Bell> = {
    invoice_paid: CreditCard,
    proposal_accepted: FileText,
    proposal_rejected: FileText,
    deadline_approaching: Clock,
    new_client: Users,
};

const notificationColors: Record<Notification["type"], string> = {
    invoice_paid: "text-success bg-success/10",
    proposal_accepted: "text-success bg-success/10",
    proposal_rejected: "text-destructive bg-destructive/10",
    deadline_approaching: "text-warning bg-warning/10",
    new_client: "text-primary bg-primary/10",
};

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function NotificationCenter() {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);

        // Navigate to the relevant page
        if (notification.entityType && notification.entityId) {
            switch (notification.entityType) {
                case "invoice":
                    navigate(`/invoices`);
                    break;
                case "proposal":
                    navigate(`/proposals`);
                    break;
                case "client":
                    navigate(`/clients`);
                    break;
            }
        }
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative h-10 w-10 rounded-2xl border-border/70 bg-card/85 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card"
                    aria-label={`Buka notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ""}`}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                data-ui-panel="notification-center"
                className="w-80 rounded-[28px] border-border/70 bg-card/95 p-0 shadow-2xl shadow-slate-950/15 backdrop-blur-xl md:w-[25rem]"
                align="end"
                sideOffset={10}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            Update
                        </p>
                        <h3 className="font-semibold text-foreground">Notifikasi</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={markAllAsRead}>
                                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                                Tandai semua
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive" onClick={clearAll}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="px-5 py-14 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/80 shadow-inner">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Belum ada notifikasi</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Aktivitas penting dari proposal, invoice, dan klien akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[400px]">
                        <div className="divide-y divide-border/70">
                            {notifications.map((notification) => {
                                const Icon = notificationIcons[notification.type];
                                const colorClass = notificationColors[notification.type];
                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-secondary/45",
                                            !notification.read && "bg-primary/5"
                                        )}
                                    >
                                        <div className={cn("shrink-0 rounded-2xl p-2.5", colorClass)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("line-clamp-1 text-sm", notification.read ? "text-muted-foreground" : "font-medium text-foreground")}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                                            </div>
                                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1.5 text-[11px] font-medium text-muted-foreground/70">
                                                {formatTimeAgo(notification.timestamp)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </PopoverContent>
        </Popover>
    );
}

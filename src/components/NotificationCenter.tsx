import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, FileText, CreditCard, Users, Clock } from "lucide-react";
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function NotificationCenter() {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
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
                    className="relative rounded-full bg-secondary border-border"
                    aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0 bg-card border-border" align="end" sideOffset={8}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={clearAll}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-sm">No notifications yet</p>
                        <p className="text-muted-foreground text-xs mt-1">We'll notify you when something happens</p>
                    </div>
                ) : (
                    <ScrollArea className="max-h-[400px]">
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => {
                                const Icon = notificationIcons[notification.type];
                                const colorClass = notificationColors[notification.type];
                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/50",
                                            !notification.read && "bg-primary/5"
                                        )}
                                    >
                                        <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-sm line-clamp-1", notification.read ? "text-muted-foreground" : "text-foreground font-medium")}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1">{formatTimeAgo(notification.timestamp)}</p>
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

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
    id: string;
    type: "invoice_paid" | "proposal_accepted" | "proposal_rejected" | "deadline_approaching" | "new_client";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    entityId?: string;
    entityType?: "invoice" | "proposal" | "client";
}

// Local storage key for notifications
const NOTIFICATIONS_KEY = "artha_notifications";
const MAX_NOTIFICATIONS = 50;

function loadNotifications(): Notification[] {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp),
            }));
        }
    } catch (e) {
        console.error("Failed to load notifications:", e);
    }
    return [];
}

function saveNotifications(notifications: Notification[]) {
    try {
        // Keep only the most recent notifications
        const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error("Failed to save notifications:", e);
    }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications from localStorage on mount
    useEffect(() => {
        const stored = loadNotifications();
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
    }, []);

    // Add a new notification
    const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            saveNotifications(updated);
            return updated;
        });
        setUnreadCount(prev => prev + 1);
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            );
            saveNotifications(updated);
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            saveNotifications(updated);
            return updated;
        });
        setUnreadCount(0);
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem(NOTIFICATIONS_KEY);
    }, []);

    // Subscribe to real-time changes
    useEffect(() => {
        const setupSubscriptions = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Listen for invoice status changes
            const invoicesChannel = supabase
                .channel('notifications-invoices')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'invoices',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newData = payload.new as any;
                        const oldData = payload.old as any;

                        if (oldData.status !== 'paid' && newData.status === 'paid') {
                            addNotification({
                                type: "invoice_paid",
                                title: "Invoice Paid! 💰",
                                message: `Invoice #${newData.invoice_number} has been marked as paid.`,
                                entityId: newData.id,
                                entityType: "invoice",
                            });
                        }
                    }
                )
                .subscribe();

            // Listen for proposal status changes
            const proposalsChannel = supabase
                .channel('notifications-proposals')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'proposals',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newData = payload.new as any;
                        const oldData = payload.old as any;

                        if (oldData.status !== 'approved' && newData.status === 'approved') {
                            addNotification({
                                type: "proposal_accepted",
                                title: "Proposal Accepted! 🎉",
                                message: `Your proposal "${newData.title}" has been accepted.`,
                                entityId: newData.id,
                                entityType: "proposal",
                            });
                        } else if (oldData.status !== 'rejected' && newData.status === 'rejected') {
                            addNotification({
                                type: "proposal_rejected",
                                title: "Proposal Declined",
                                message: `Your proposal "${newData.title}" was not accepted.`,
                                entityId: newData.id,
                                entityType: "proposal",
                            });
                        }
                    }
                )
                .subscribe();

            // Listen for new clients
            const clientsChannel = supabase
                .channel('notifications-clients')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'clients',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newData = payload.new as any;
                        addNotification({
                            type: "new_client",
                            title: "New Client Added! 👋",
                            message: `${newData.name} has been added to your clients.`,
                            entityId: newData.id,
                            entityType: "client",
                        });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(invoicesChannel);
                supabase.removeChannel(proposalsChannel);
                supabase.removeChannel(clientsChannel);
            };
        };

        setupSubscriptions();
    }, [addNotification]);

    // Check for upcoming deadlines periodically
    useEffect(() => {
        const checkDeadlines = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const now = new Date();
            const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

            const { data: upcomingInvoices } = await supabase
                .from("invoices")
                .select("id, invoice_number, due_date")
                .eq("user_id", user.id)
                .neq("status", "paid")
                .gte("due_date", now.toISOString().split('T')[0])
                .lte("due_date", threeDaysFromNow.toISOString().split('T')[0]);

            // Only notify once per invoice (check if already notified)
            const existingIds = new Set(notifications
                .filter(n => n.type === "deadline_approaching")
                .map(n => n.entityId)
            );

            upcomingInvoices?.forEach(invoice => {
                if (!existingIds.has(invoice.id)) {
                    const dueDate = new Date(invoice.due_date!);
                    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    addNotification({
                        type: "deadline_approaching",
                        title: "Deadline Approaching ⏰",
                        message: `Invoice #${invoice.invoice_number} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
                        entityId: invoice.id,
                        entityType: "invoice",
                    });
                }
            });
        };

        // Check immediately and then every hour
        checkDeadlines();
        const interval = setInterval(checkDeadlines, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [addNotification, notifications]);

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
    };
}

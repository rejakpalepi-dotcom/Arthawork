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

const NOTIFICATIONS_KEY = "artha_notifications";
const MAX_NOTIFICATIONS = 50;

function loadNotifications(): Notification[] {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
        }
    } catch (e) {
        console.error("Failed to load notifications:", e);
    }
    return [];
}

function saveNotifications(notifications: Notification[]) {
    try {
        const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error("Failed to save notifications:", e);
    }
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const stored = loadNotifications();
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
    }, []);

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

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            saveNotifications(updated);
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, read: true }));
            saveNotifications(updated);
            return updated;
        });
        setUnreadCount(0);
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem(NOTIFICATIONS_KEY);
    }, []);

    useEffect(() => {
        const setupSubscriptions = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const invoicesChannel = supabase
                .channel('notifications-invoices')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'invoices', filter: `user_id=eq.${user.id}` },
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

            const proposalsChannel = supabase
                .channel('notifications-proposals')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'proposals', filter: `user_id=eq.${user.id}` },
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

            const clientsChannel = supabase
                .channel('notifications-clients')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'clients', filter: `user_id=eq.${user.id}` },
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

    return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll };
}

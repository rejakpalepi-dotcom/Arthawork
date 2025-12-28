import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, CreditCard, Users, FolderOpen, Settings, Plus, Command } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { formatIDR } from "@/lib/currency";

interface SearchResult {
    id: string;
    type: "client" | "invoice" | "proposal" | "navigation";
    title: string;
    subtitle?: string;
    icon: typeof FileText;
    path: string;
}

const navigationItems: SearchResult[] = [
    { id: "nav-dashboard", type: "navigation", title: "Dashboard", icon: FolderOpen, path: "/dashboard" },
    { id: "nav-clients", type: "navigation", title: "Clients", icon: Users, path: "/clients" },
    { id: "nav-proposals", type: "navigation", title: "Proposals", icon: FileText, path: "/proposals" },
    { id: "nav-invoices", type: "navigation", title: "Invoices", icon: CreditCard, path: "/invoices" },
    { id: "nav-settings", type: "navigation", title: "Settings", icon: Settings, path: "/settings" },
];

const quickActions: SearchResult[] = [
    { id: "action-new-invoice", type: "navigation", title: "New Invoice", subtitle: "Create a new invoice", icon: Plus, path: "/invoices/new" },
    { id: "action-new-proposal", type: "navigation", title: "New Proposal", subtitle: "Create a new proposal", icon: Plus, path: "/proposals/new" },
    { id: "action-new-project", type: "navigation", title: "New Project", subtitle: "Start a new project", icon: Plus, path: "/projects/new" },
];

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const search = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const searchResults: SearchResult[] = [];

        const { data: clients } = await supabase
            .from("clients")
            .select("id, name, company")
            .eq("user_id", user.id)
            .or(`name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
            .limit(5);

        clients?.forEach((client) => {
            searchResults.push({
                id: `client-${client.id}`,
                type: "client",
                title: client.company || client.name,
                subtitle: client.company ? client.name : undefined,
                icon: Users,
                path: "/clients",
            });
        });

        const { data: invoices } = await supabase
            .from("invoices")
            .select("id, invoice_number, total, status")
            .eq("user_id", user.id)
            .ilike("invoice_number", `%${searchQuery}%`)
            .limit(5);

        invoices?.forEach((invoice) => {
            searchResults.push({
                id: `invoice-${invoice.id}`,
                type: "invoice",
                title: `Invoice #${invoice.invoice_number}`,
                subtitle: `${formatIDR(invoice.total)} • ${invoice.status}`,
                icon: CreditCard,
                path: "/invoices",
            });
        });

        const { data: proposals } = await supabase
            .from("proposals")
            .select("id, title, total, status")
            .eq("user_id", user.id)
            .ilike("title", `%${searchQuery}%`)
            .limit(5);

        proposals?.forEach((proposal) => {
            searchResults.push({
                id: `proposal-${proposal.id}`,
                type: "proposal",
                title: proposal.title,
                subtitle: `${formatIDR(proposal.total)} • ${proposal.status}`,
                icon: FileText,
                path: "/proposals",
            });
        });

        setResults(searchResults);
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            search(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, search]);

    const handleSelect = (path: string) => {
        setOpen(false);
        setQuery("");
        navigate(path);
    };

    const filteredNav = query
        ? navigationItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
        : navigationItems;

    const filteredActions = query
        ? quickActions.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
        : quickActions;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search clients, invoices, proposals..." value={query} onValueChange={setQuery} />
            <CommandList>
                <CommandEmpty>{loading ? "Searching..." : "No results found."}</CommandEmpty>

                {filteredActions.length > 0 && (
                    <CommandGroup heading="Quick Actions">
                        {filteredActions.map((action) => (
                            <CommandItem key={action.id} onSelect={() => handleSelect(action.path)} className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-primary/10">
                                    <action.icon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{action.title}</p>
                                    {action.subtitle && <p className="text-xs text-muted-foreground">{action.subtitle}</p>}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {results.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Search Results">
                            {results.map((result) => (
                                <CommandItem key={result.id} onSelect={() => handleSelect(result.path)} className="flex items-center gap-3">
                                    <div className="p-1.5 rounded-md bg-secondary">
                                        <result.icon className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{result.title}</p>
                                        {result.subtitle && <p className="text-xs text-muted-foreground">{result.subtitle}</p>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />
                <CommandGroup heading="Navigation">
                    {filteredNav.map((item) => (
                        <CommandItem key={item.id} onSelect={() => handleSelect(item.path)} className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-muted-foreground" />
                            <span>{item.title}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}

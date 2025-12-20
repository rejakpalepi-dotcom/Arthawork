import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FocusItem {
  id: string;
  label: string;
  completed: boolean;
}

interface TodaysFocusProps {
  items?: FocusItem[];
}

const defaultItems: FocusItem[] = [
  { id: "1", label: "Send final assets to Nexus Tech", completed: false },
  { id: "2", label: "Draft proposal for new lead", completed: false },
  { id: "3", label: "Follow up on Invoice #1024", completed: false },
];

export function TodaysFocus({ items = defaultItems }: TodaysFocusProps) {
  const [focusItems, setFocusItems] = useState<FocusItem[]>(items);

  const toggleItem = (id: string) => {
    setFocusItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Today's Focus</h3>
      <div className="space-y-1">
        {focusItems.map((item) => (
          <label
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50",
              item.completed && "opacity-50"
            )}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
              className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span
              className={cn(
                "text-sm text-foreground transition-all",
                item.completed && "line-through text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

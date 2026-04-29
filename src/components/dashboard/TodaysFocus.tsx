import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

interface Todo {
  id: string;
  task_text: string;
  is_completed: boolean;
}

export function TodaysFocus() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("todos")
        .select("id, task_text, is_completed")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTodos(data || []);
    } catch (error: unknown) {
      console.error("Gagal memuat fokus hari ini:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTask.trim()) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Silakan masuk untuk menambah tugas");
        return;
      }

      const { data, error } = await supabase
        .from("todos")
        .insert({ task_text: newTask.trim(), user_id: user.id })
        .select("id, task_text, is_completed")
        .single();

      if (error) throw error;

      setTodos(prev => [...prev, data]);
      setNewTask("");
    } catch (error: unknown) {
      toast.error("Gagal menambah tugas");
    } finally {
      setSaving(false);
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ is_completed: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setTodos(prev => prev.map(t =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t
      ));
    } catch (error: unknown) {
      toast.error("Gagal memperbarui tugas");
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.task_text);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;

    try {
      const { error } = await supabase
        .from("todos")
        .update({ task_text: editText.trim() })
        .eq("id", editingId);

      if (error) throw error;

      setTodos(prev => prev.map(t =>
        t.id === editingId ? { ...t, task_text: editText.trim() } : t
      ));
      setEditingId(null);
      setEditText("");
    } catch (error: unknown) {
      toast.error("Gagal memperbarui tugas");
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (error: unknown) {
      toast.error("Gagal menghapus tugas");
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-[28px] border border-border/70 p-6 shadow-sm animate-fade-in" data-ui-panel="todays-focus">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">FOKUS HARI INI</h3>
          <p className="mt-1 text-sm text-muted-foreground">Task kecil yang menjaga hari ini tetap bergerak.</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[28px] border border-border/70 p-6 shadow-sm animate-fade-in" data-ui-panel="todays-focus">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">FOKUS HARI INI</h3>
        <p className="mt-1 text-sm text-muted-foreground">Susun prioritas kecil biar eksekusi harian tidak tercecer.</p>
      </div>

      {/* Add new task */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Tambahkan fokus baru..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          className="flex-1"
          disabled={saving}
        />
        <Button
          size="icon"
          onClick={addTodo}
          disabled={saving || !newTask.trim()}
          className="shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Task list */}
      <div className="space-y-1">
        {todos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/80 bg-secondary/30 px-4 py-6 text-sm text-muted-foreground text-center">
            Belum ada fokus hari ini. Tambahkan dari kolom di atas.
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-secondary/50",
                todo.is_completed && "opacity-50"
              )}
            >
              {editingId === todo.id ? (
                <>
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="flex-1 h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8">
                    <Check className="h-4 w-4 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Checkbox
                    checked={todo.is_completed}
                    onCheckedChange={() => toggleTodo(todo.id, todo.is_completed)}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span
                    className={cn(
                      "text-sm text-foreground flex-1 transition-all",
                      todo.is_completed && "line-through text-muted-foreground"
                    )}
                  >
                    {todo.task_text}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(todo)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTodo(todo.id)}
                      className="h-7 w-7 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

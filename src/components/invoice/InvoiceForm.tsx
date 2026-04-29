import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Receipt, User, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, POPULAR_CURRENCIES, CURRENCY_LIST } from "@/lib/currencies";
import { InvoiceFormData, InvoiceLineItem } from "./types";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  isSubmitting: boolean;
}

export function InvoiceForm({ form, onSubmit, isSubmitting }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const { watch, setValue, register, handleSubmit, formState: { errors } } = form;

  const lineItems = watch("lineItems");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [clientsRes, servicesRes] = await Promise.all([
        supabase.from("clients").select("id, name, email, phone, company, address").eq("user_id", user.id),
        supabase.from("services").select("id, name, price, description").eq("user_id", user.id),
      ]);

      if (clientsRes.data) setClients(clientsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
    };

    fetchData();
  }, []);

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      serviceId: null,
    };
    setValue("lineItems", [...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setValue("lineItems", lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: unknown) => {
    const updated = lineItems.map(item => {
      if (item.id !== id) return item;

      const updatedItem = { ...item, [field]: value };

      if (field === "quantity" || field === "unitPrice") {
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
      }

      return updatedItem;
    });
    setValue("lineItems", updated);
  };

  const applyService = (itemId: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const updated = lineItems.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        serviceId,
        description: service.name + (service.description ? ` - ${service.description}` : ""),
        unitPrice: service.price,
        total: item.quantity * service.price,
      };
    });
    setValue("lineItems", updated);
  };

  const handleClientChange = (clientId: string) => {
    setValue("clientId", clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setValue("clientName", client.name);
      setValue("clientEmail", client.email || "");
      setValue("clientPhone", client.phone || "");
      setValue("clientAddress", client.address || "");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Detail Invoice */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">DETAIL INVOICE</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
            <Input
              id="invoiceNumber"
              {...register("invoiceNumber")}
              placeholder="INV-2024-001"
              className="mt-1.5"
            />
            {errors.invoiceNumber && (
              <p className="text-xs text-destructive mt-1">{errors.invoiceNumber.message}</p>
            )}
          </div>

          <div>
            <Label>Tanggal Terbit</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1.5 truncate",
                    !watch("issueDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {watch("issueDate") ? format(watch("issueDate"), "MMM d, yyyy") : "Pilih tanggal"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom" avoidCollisions>
                <Calendar
                  mode="single"
                  selected={watch("issueDate")}
                  onSelect={(date) => date && setValue("issueDate", date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Currency Selector */}
          <div>
            <Label>Mata Uang</Label>
            <Select
              value={watch("currency") || "IDR"}
              onValueChange={(value) => setValue("currency", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Pilih mata uang" />
              </SelectTrigger>
              <SelectContent>
                {/* Popular currencies first */}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Populer</div>
                {POPULAR_CURRENCIES.map(code => {
                  const currency = CURRENCY_LIST.find(c => c.code === code);
                  if (!currency) return null;
                  return (
                    <SelectItem key={code} value={code}>
                      <span className="font-mono">{currency.code}</span>
                      <span className="text-muted-foreground ml-2">({currency.name})</span>
                    </SelectItem>
                  );
                })}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">Semua Mata Uang</div>
                {CURRENCY_LIST.filter(c => !POPULAR_CURRENCIES.includes(c.code)).map(currency => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="font-mono">{currency.code}</span>
                    <span className="text-muted-foreground ml-2">({currency.name})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Informasi Klien */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">INFORMASI KLIEN</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Pilih Klien</Label>
            <Select onValueChange={handleClientChange} value={watch("clientId") || undefined}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Pilih klien..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Nama Klien</Label>
              <Input
                id="clientName"
                {...register("clientName")}
                placeholder="Acme Corporation"
                className="mt-1.5"
              />
              {errors.clientName && (
                <p className="text-xs text-destructive mt-1">{errors.clientName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clientEmail">Email Klien</Label>
              <Input
                id="clientEmail"
                type="email"
                {...register("clientEmail")}
                placeholder="billing@acmecorp.com"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientPhone">Nomor Telepon</Label>
            <Input
              id="clientPhone"
              {...register("clientPhone")}
              placeholder="+62 812 3456 7890"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="clientAddress">Alamat Penagihan</Label>
            <Textarea
              id="clientAddress"
              {...register("clientAddress")}
              placeholder="Jalan, kota, dan detail alamat penagihan"
              className="mt-1.5"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Services / Line Items */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">ITEM TAGIHAN</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Item
          </Button>
        </div>

        <div className="space-y-4">
          {lineItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <ListChecks className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Belum ada item ditambahkan</p>
              <Button type="button" variant="link" onClick={addLineItem} className="mt-2">
                Tambah item pertama
              </Button>
            </div>
          ) : (
            lineItems.map((item, index) => (
              <div key={item.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Item #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {services.length > 0 && (
                  <Select onValueChange={(serviceId) => applyService(item.id, serviceId)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tambah cepat dari layanan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price, watch("currency") || "IDR")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div>
                  <Label>Deskripsi</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                    placeholder="Desain UI/UX - Redesain Halaman Utama"
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Qty/Hrs</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tarif</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total</Label>
                    <div className="mt-1.5 h-10 px-3 flex items-center rounded-md bg-muted text-foreground font-medium font-mono text-sm">
                      {formatCurrency(item.total, watch("currency") || "IDR")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {lineItems.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={addLineItem}
              className="w-full border-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Item Lain
            </Button>
          )}
        </div>
      </div>

      {/* Tax & Notes */}
      <div className="glass-card rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="taxRate">Pajak (%)</Label>
            <Input
              id="taxRate"
              type="number"
              {...register("taxRate", { valueAsNumber: true })}
              placeholder="0"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Jatuh Tempo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1.5 truncate",
                    !watch("dueDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {watch("dueDate") ? format(watch("dueDate"), "MMM d, yyyy") : "Pilih jatuh tempo"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" side="top" avoidCollisions>
                <Calendar
                  mode="single"
                  selected={watch("dueDate") || undefined}
                  onSelect={(date) => setValue("dueDate", date || null)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Pembayaran maksimal 30 hari. Terima kasih atas kerja samanya."
            className="mt-1.5"
            rows={3}
          />
        </div>
      </div>
    </form>
  );
}

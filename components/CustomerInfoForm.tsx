"use client";

import { useState, type FormEvent } from "react";
import { User, Phone, Mail, MapPin, Building2, MessageSquare, Check, Pencil } from "lucide-react";
import { useCart, type CustomerInfo } from "@/components/providers/CartContext";

export default function CustomerInfoForm() {
  const { state, setCustomer } = useCart();
  const [editing, setEditing] = useState(!state.customer.fullName);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<CustomerInfo>(state.customer);

  const fields = [
    { key: "fullName" as const, label: "Full Name", icon: User, placeholder: "John Doe", type: "text" },
    { key: "phone" as const, label: "Phone Number", icon: Phone, placeholder: "+880 1XXXXXXXXX", type: "tel" },
    { key: "email" as const, label: "Email Address", icon: Mail, placeholder: "john@example.com", type: "email" },
    { key: "address" as const, label: "Street Address", icon: MapPin, placeholder: "House 12, Road 5, Banani", type: "text" },
    { key: "city" as const, label: "City", icon: Building2, placeholder: "Dhaka", type: "text" },
  ];

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setCustomer(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isFilled = state.customer.fullName && state.customer.phone;

  return (
    <div className="rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-7">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-semibold text-stone-900 dark:text-white">
          Delivery Information
        </h2>
        {isFilled && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors duration-200 uppercase tracking-wider"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>

      {!editing && isFilled ? (
        <div className="space-y-3 text-sm">
          <InfoRow label="Name" value={state.customer.fullName} />
          <InfoRow label="Phone" value={state.customer.phone} />
          <InfoRow label="Email" value={state.customer.email || "—"} />
          <InfoRow label="Address" value={state.customer.address} />
          <InfoRow label="City" value={state.customer.city} />
          {state.customer.notes && <InfoRow label="Notes" value={state.customer.notes} />}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                  <input
                    type={f.type}
                    required={f.key === "fullName" || f.key === "phone" || f.key === "address" || f.key === "city"}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 pl-10 pr-4 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all duration-200"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Order Notes (optional)
            </label>
            <div className="relative">
              <MessageSquare size={15} className="absolute left-3.5 top-3.5 text-stone-400 dark:text-stone-500" />
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special instructions for delivery..."
                rows={2}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 pl-10 pr-4 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all duration-200 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-stone-900 transition-all duration-300 hover:bg-amber-500 dark:hover:bg-amber-500 dark:hover:text-white hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] tracking-wider uppercase"
          >
            {saved ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              <>
                <Check size={16} />
                Save Information
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-20 flex-shrink-0 font-medium text-stone-500 dark:text-stone-400">{label}</span>
      <span className="text-stone-900 dark:text-white">{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { NEPALI_FISCAL_MONTHS } from "@/lib/vat-period";

type PurchaseRecord = {
  _id?: string;
  fiscalYear?: string;
  month?: string;
  date?: string;
  invoiceNumber?: string;
  supplierName?: string;
  supplierPan?: string;
  goodsOrService?: string;
  quantity?: number;
  unit?: string;
  grossAmount?: number;
  exemptAmount?: number;
  taxableAmount?: number;
  vatAmount?: number;
  totalAmount?: number;
  remarks?: string;
};

type FormState = {
  fiscalYear: string;
  month: string;
  date: string;
  invoiceNumber: string;
  supplierName: string;
  supplierPan: string;
  goodsOrService: string;
  quantity: string;
  unit: string;
  grossAmount: string;
  exemptAmount: string;
  taxableAmount: string;
  vatAmount: string;
  totalAmount: string;
  remarks: string;
};

const fiscalYearOptions = ["2082", "2083"];

function toInputDate(value?: string) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toISOString().slice(0, 10);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

function createFormState(purchase: PurchaseRecord | null): FormState {
  return {
    fiscalYear: purchase?.fiscalYear || "2082",
    month: purchase?.month || "MAGH",
    date: toInputDate(purchase?.date),
    invoiceNumber: purchase?.invoiceNumber || "",
    supplierName: purchase?.supplierName || "",
    supplierPan: purchase?.supplierPan || "",
    goodsOrService: purchase?.goodsOrService || "",
    quantity: String(purchase?.quantity ?? ""),
    unit: purchase?.unit || "",
    grossAmount: String(purchase?.grossAmount ?? ""),
    exemptAmount: String(purchase?.exemptAmount ?? ""),
    taxableAmount: String(purchase?.taxableAmount ?? ""),
    vatAmount: String(purchase?.vatAmount ?? ""),
    totalAmount: String(purchase?.totalAmount ?? ""),
    remarks: purchase?.remarks || "",
  };
}

export default function EditPurchaseModal({
  open,
  purchase,
  onClose,
  onSaved,
}: {
  open: boolean;
  purchase: PurchaseRecord | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<FormState>(() => createFormState(purchase));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(createFormState(purchase));
    setError("");
    setSaving(false);
  }, [purchase, open]);

  if (!open || !purchase?._id) {
    return null;
  }

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "taxableAmount") {
        const taxable = toNumber(value);
        const vat = taxable * 0.13;
        const total = taxable + vat;

        next.vatAmount = formatAmount(vat);
        next.totalAmount = formatAmount(total);
        next.grossAmount = formatAmount(total);
      }

      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        fiscalYear: form.fiscalYear,
        month: form.month,
        date: form.date,
        invoiceNumber: form.invoiceNumber.trim(),
        supplierName: form.supplierName.trim(),
        supplierPan: form.supplierPan.trim(),
        goodsOrService: form.goodsOrService.trim(),
        quantity: toNumber(form.quantity),
        unit: form.unit.trim(),
        grossAmount: toNumber(form.grossAmount),
        exemptAmount: toNumber(form.exemptAmount),
        taxableAmount: toNumber(form.taxableAmount),
        vatAmount: toNumber(form.vatAmount),
        totalAmount: toNumber(form.totalAmount),
        remarks: form.remarks.trim(),
      };

      const response = await fetch(`/api/purchase-ledger/${purchase._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to update purchase.");
      }

      await onSaved();
      onClose();
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to update purchase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Edit Purchase</h2>
            <p className="text-sm text-muted-foreground">
              Update the selected purchase ledger entry.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium">Fiscal Year</span>
              <select
                value={form.fiscalYear}
                onChange={(event) => updateField("fiscalYear", event.target.value)}
                className="w-full rounded-lg border p-2"
              >
                {fiscalYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Month</span>
              <select
                value={form.month}
                onChange={(event) => updateField("month", event.target.value)}
                className="w-full rounded-lg border p-2 uppercase"
              >
                {NEPALI_FISCAL_MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="w-full rounded-lg border p-2"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Invoice Number</span>
              <input
                value={form.invoiceNumber}
                onChange={(event) => updateField("invoiceNumber", event.target.value)}
                className="w-full rounded-lg border p-2"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Supplier Name</span>
              <input
                value={form.supplierName}
                onChange={(event) => updateField("supplierName", event.target.value)}
                className="w-full rounded-lg border p-2"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Supplier PAN</span>
              <input
                value={form.supplierPan}
                onChange={(event) => updateField("supplierPan", event.target.value)}
                className="w-full rounded-lg border p-2"
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="block text-sm font-medium">Goods / Service</span>
              <input
                value={form.goodsOrService}
                onChange={(event) => updateField("goodsOrService", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Quantity</span>
              <input
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Unit</span>
              <input
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Gross Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.grossAmount}
                onChange={(event) => updateField("grossAmount", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Exempt Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.exemptAmount}
                onChange={(event) => updateField("exemptAmount", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Taxable Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.taxableAmount}
                onChange={(event) => updateField("taxableAmount", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">VAT Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.vatAmount}
                onChange={(event) => updateField("vatAmount", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Total Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.totalAmount}
                onChange={(event) => updateField("totalAmount", event.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="block text-sm font-medium">Remarks</span>
              <textarea
                value={form.remarks}
                onChange={(event) => updateField("remarks", event.target.value)}
                className="min-h-24 w-full rounded-lg border p-2"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

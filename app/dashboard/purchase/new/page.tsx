"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

const initialFormState: FormState = {
  fiscalYear: "2082",
  month: "MAGH",
  date: "",
  invoiceNumber: "",
  supplierName: "",
  supplierPan: "",
  goodsOrService: "",
  quantity: "",
  unit: "",
  grossAmount: "",
  exemptAmount: "",
  taxableAmount: "",
  vatAmount: "",
  totalAmount: "",
  remarks: "",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

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
    setApiError("");

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

      const response = await fetch("/api/purchase-ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to save purchase.");
      }

      router.push("/dashboard/purchase");
    } catch (submitError: any) {
      setApiError(submitError?.message || "Failed to save purchase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Add Purchase</h1>
        <p className="text-sm text-muted-foreground">
          Create a new purchase ledger entry
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-neutral-900"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-sm font-medium">Fiscal Year</span>
            <input
              value={form.fiscalYear}
              onChange={(event) => updateField("fiscalYear", event.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">Month</span>
            <select
              value={form.month}
              onChange={(event) => updateField("month", event.target.value)}
              className="w-full rounded-lg border p-2"
            >
              <option value="MAGH">MAGH</option>
              <option value="FALGUN">FALGUN</option>
              <option value="CHAITRA">CHAITRA</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Date <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Invoice Number <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={form.invoiceNumber}
              onChange={(event) =>
                updateField("invoiceNumber", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Supplier Name <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={form.supplierName}
              onChange={(event) =>
                updateField("supplierName", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Supplier PAN <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={form.supplierPan}
              onChange={(event) =>
                updateField("supplierPan", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="block text-sm font-medium">Goods / Service</span>
            <input
              value={form.goodsOrService}
              onChange={(event) =>
                updateField("goodsOrService", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">Quantity</span>
            <input
              type="number"
              step="any"
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
              onChange={(event) =>
                updateField("grossAmount", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">Exempt Amount</span>
            <input
              type="number"
              step="0.01"
              value={form.exemptAmount}
              onChange={(event) =>
                updateField("exemptAmount", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Taxable Amount
            </span>
            <input
              type="number"
              step="0.01"
              value={form.taxableAmount}
              onChange={(event) =>
                updateField("taxableAmount", event.target.value)
              }
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
              onChange={(event) =>
                updateField("totalAmount", event.target.value)
              }
              className="w-full rounded-lg border p-2"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="block text-sm font-medium">Remarks</span>
            <textarea
              value={form.remarks}
              onChange={(event) => updateField("remarks", event.target.value)}
              className="min-h-28 w-full rounded-lg border p-2"
            />
          </label>
        </div>

        {apiError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Purchase"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/purchase")}
            className="rounded-lg border px-4 py-2 transition hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

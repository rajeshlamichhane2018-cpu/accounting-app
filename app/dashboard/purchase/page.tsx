"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NEPALI_FISCAL_MONTHS } from "@/lib/vat-period";
import EditPurchaseModal from "@/components/purchase/EditPurchaseModal";

type PurchaseRecord = {
  _id?: string;
  date?: string;
  fiscalYear?: string;
  month?: string;
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

type PurchaseSummary = {
  totalBills: number;
  taxableAmount: number;
  vatAmount: number;
  grandTotal: number;
};

function Plus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

const fiscalYearOptions = ["2082", "2083"];

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPurchases() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/purchase-ledger");
      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to fetch purchases.");
      }

      setPurchases(Array.isArray(result?.data) ? result.data : []);
    } catch (fetchError: any) {
      setError(fetchError?.message || "Failed to fetch purchases.");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  async function handleExportExcel() {
    try {
      setExporting(true);
      setExportError(null);

      const response = await fetch("/api/purchase-ledger/export");

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to export purchase ledger.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "Purchase-Ledger.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (exportError: any) {
      setExportError(exportError?.message || "Failed to export purchase ledger.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeletePurchase(purchase: PurchaseRecord) {
    if (!purchase._id) return;

    const confirmed = window.confirm(
      `Delete invoice ${purchase.invoiceNumber || purchase._id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(purchase._id);

      const response = await fetch(`/api/purchase-ledger/${purchase._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to delete purchase.");
      }

      await loadPurchases();
    } catch (deleteError: any) {
      window.alert(deleteError?.message || "Failed to delete purchase.");
    } finally {
      setDeletingId(null);
    }
  }

  const safePurchases = Array.isArray(purchases) ? purchases : [];

  const filteredPurchases = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return safePurchases;
    }

    return safePurchases.filter((purchase) => {
      return [
        purchase.invoiceNumber,
        purchase.supplierName,
        purchase.supplierPan,
        purchase.month,
        purchase.fiscalYear,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [safePurchases, search]);

  const summary = useMemo<PurchaseSummary>(() => {
    return safePurchases.reduce(
      (acc: PurchaseSummary, purchase) => {
        acc.totalBills += 1;
        acc.taxableAmount += Number(purchase.taxableAmount || 0);
        acc.vatAmount += Number(purchase.vatAmount || 0);
        acc.grandTotal += Number(purchase.totalAmount || 0);
        return acc;
      },
      {
        totalBills: 0,
        taxableAmount: 0,
        vatAmount: 0,
        grandTotal: 0,
      }
    );
  }, [safePurchases]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Purchase Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Manage your purchase transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/purchase/scan"
            className="flex items-center justify-center gap-2 rounded-lg border border-purple-600 px-4 py-2 text-purple-700 transition hover:bg-purple-50"
          >
            AI Scan Bill
          </Link>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-green-600 px-4 py-2 text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {exporting ? "Exporting..." : "Export Excel"}
          </button>

          <Link
            href="/dashboard/purchase/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Purchase
          </Link>
        </div>
      </div>

      {exportError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {exportError}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-900">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Fiscal Year
            </label>

            <select className="w-full rounded-lg border p-2">
              {fiscalYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Month</label>

            <select className="w-full rounded-lg border p-2">
              {NEPALI_FISCAL_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Search</label>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Invoice, Supplier, PAN..."
                className="w-full rounded-lg border py-2 pl-10 pr-4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-neutral-900">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading purchases...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Unable to load purchases</h2>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-gray-100 dark:bg-neutral-800">
                <tr className="text-left text-sm">
                  <th className="p-3">Date</th>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">PAN</th>
                  <th className="p-3 text-right">Taxable</th>
                  <th className="p-3 text-right">VAT</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-500">
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold">
                          {search.trim()
                            ? "No Matching Purchase Records"
                            : "No Purchase Records"}
                        </h2>

                        <p className="text-sm">
                          {search.trim()
                            ? "Try a different search term."
                            : 'Click "Add Purchase" to create your first purchase entry.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase, index) => (
                    <tr
                      key={purchase._id || `${purchase.invoiceNumber}-${index}`}
                      className="border-t text-sm"
                    >
                      <td className="p-3">{formatDate(purchase.date)}</td>
                      <td className="p-3">{purchase.invoiceNumber || "-"}</td>
                      <td className="p-3">{purchase.supplierName || "-"}</td>
                      <td className="p-3">{purchase.supplierPan || "-"}</td>
                      <td className="p-3 text-right">
                        {formatMoney(Number(purchase.taxableAmount || 0))}
                      </td>
                      <td className="p-3 text-right">
                        {formatMoney(Number(purchase.vatAmount || 0))}
                      </td>
                      <td className="p-3 text-right">
                        {formatMoney(Number(purchase.totalAmount || 0))}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPurchase(purchase)}
                            className="rounded-md border border-blue-600 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeletePurchase(purchase)}
                            disabled={deletingId === purchase._id}
                            className="rounded-md border border-red-600 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === purchase._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )} 
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Bills</p>
          <h2 className="mt-2 text-2xl font-bold">{summary.totalBills}</h2>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Taxable Amount</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatMoney(summary.taxableAmount)}
          </h2>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">VAT Amount</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatMoney(summary.vatAmount)}
          </h2>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Grand Total</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatMoney(summary.grandTotal)}
          </h2>
        </div>
      </div>

      <EditPurchaseModal
        open={Boolean(editingPurchase)}
        purchase={editingPurchase}
        onClose={() => setEditingPurchase(null)}
        onSaved={loadPurchases}
      />
    </div>
  );
}

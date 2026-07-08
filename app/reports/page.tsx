"use client";

import { useEffect, useMemo, useState } from "react";
import { NEPALI_FISCAL_MONTHS } from "@/lib/vat-period";

type MonthlyRow = {
  month: string;
  purchaseCount: number;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
};

type ReportsData = {
  fiscalYear: string;
  companyName: string;
  taxPeriod: string;
  summary: {
    purchaseCount: number;
    taxableAmount: number;
    vatAmount: number;
    totalAmount: number;
  };
  monthlyRows: MonthlyRow[];
};

const fiscalYearOptions = ["2082", "2083"];

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ReportsPage() {
  const [fiscalYear, setFiscalYear] = useState("2082");
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports(selectedFiscalYear = fiscalYear) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/reports?fiscalYear=${encodeURIComponent(selectedFiscalYear)}`
      );
      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to load reports.");
      }

      setData(result.data);
    } catch (reportError: any) {
      setError(reportError?.message || "Failed to load reports.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        label: "Purchase Bills",
        value: data?.summary.purchaseCount || 0,
        tone: "bg-sky-50 text-sky-700",
      },
      {
        label: "Taxable Purchase",
        value: formatMoney(data?.summary.taxableAmount || 0),
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Payable VAT",
        value: formatMoney(data?.summary.vatAmount || 0),
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Total Purchase",
        value: formatMoney(data?.summary.totalAmount || 0),
        tone: "bg-violet-50 text-violet-700",
      },
    ],
    [data]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Purchase Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Month-wise purchase summary and payable VAT from Purchase Ledger.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <label className="space-y-2">
            <span className="block text-sm font-medium">Fiscal Year</span>
            <select
              value={fiscalYear}
              onChange={async (event) => {
                const nextYear = event.target.value;
                setFiscalYear(nextYear);
                await loadReports(nextYear);
              }}
              className="w-full rounded-lg border px-3 py-2"
            >
              {fiscalYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-5 ${card.tone}`}>
            <p className="text-sm font-medium">{card.label}</p>
            <h2 className="mt-2 text-2xl font-bold">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-neutral-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Month-wise VAT Report</h2>
            <p className="text-sm text-muted-foreground">
              Showing all fiscal months for {data?.fiscalYear || fiscalYear}.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            Company: <span className="font-medium text-foreground">{data?.companyName || "-"}</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading reports...
            </div>
          ) : (
            <table className="min-w-[760px] w-full">
              <thead className="bg-gray-100 text-left text-sm dark:bg-neutral-800">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3 text-right">Bills</th>
                  <th className="p-3 text-right">Taxable Amount</th>
                  <th className="p-3 text-right">Payable VAT</th>
                  <th className="p-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {(data?.monthlyRows || []).map((row) => (
                  <tr key={row.month} className="border-t text-sm">
                    <td className="p-3 font-medium">{row.month}</td>
                    <td className="p-3 text-right">{row.purchaseCount}</td>
                    <td className="p-3 text-right">{formatMoney(row.taxableAmount)}</td>
                    <td className="p-3 text-right">{formatMoney(row.vatAmount)}</td>
                    <td className="p-3 text-right">{formatMoney(row.totalAmount)}</td>
                  </tr>
                ))}

                {(data?.monthlyRows || []).every((row) => row.purchaseCount === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-gray-500">
                      No purchase ledger entries found for this fiscal year.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-neutral-900">
        <h2 className="text-lg font-semibold">Fiscal Months Included</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These are the months used by the purchase ledger and VAT report.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {NEPALI_FISCAL_MONTHS.map((month) => (
            <div key={month} className="rounded-lg border px-3 py-2 text-sm">
              {month}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

type CompanyFormState = {
  companyName: string;
  tradeName: string;
  panNumber: string;
  vatNumber: string;
  registrationNumber: string;
  email: string;
  phone: string;
  website: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  streetAddress: string;
  postalCode: string;
  fiscalYear: string;
  taxPeriod: string;
  vatRate: string;
  currency: string;
  dateFormat: string;
  purchasePrefix: string;
  salesPrefix: string;
  startingInvoiceNumber: string;
  autoIncrementInvoice: boolean;
  logoUrl: string;
};

const defaultState: CompanyFormState = {
  companyName: "",
  tradeName: "",
  panNumber: "",
  vatNumber: "",
  registrationNumber: "",
  email: "",
  phone: "",
  website: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  streetAddress: "",
  postalCode: "",
  fiscalYear: "2082",
  taxPeriod: "MAGH",
  vatRate: "13",
  currency: "NPR",
  dateFormat: "DD/MM/YYYY",
  purchasePrefix: "PUR",
  salesPrefix: "SAL",
  startingInvoiceNumber: "1",
  autoIncrementInvoice: true,
  logoUrl: "",
};

const screenshotFallbackState: CompanyFormState = {
  ...defaultState,
  companyName: "TERABYTE LINK PVT. LTD.",
  panNumber: "602444084",
  fiscalYear: "2082",
  taxPeriod: "MAGH",
};

const fiscalYearOptions = ["2082", "2083"];

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function CompanySettingsPage() {
  const [form, setForm] = useState<CompanyFormState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCompany() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/company");
        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || "Failed to load company settings.");
        }

        const company = result?.data;

        if (active && company) {
          setForm({
            ...defaultState,
            companyName: company.companyName || "",
            tradeName: company.tradeName || "",
            panNumber: company.panNumber || "",
            vatNumber: company.vatNumber || "",
            registrationNumber: company.registrationNumber || "",
            email: company.email || "",
            phone: company.phone || "",
            website: company.website || "",
            province: company.province || "",
            district: company.district || "",
            municipality: company.municipality || "",
            ward: company.ward || "",
            streetAddress: company.streetAddress || "",
            postalCode: company.postalCode || "",
            fiscalYear: company.fiscalYear || "2082",
            taxPeriod: company.taxPeriod || "MAGH",
            vatRate: String(company.vatRate ?? 13),
            currency: company.currency || "NPR",
            dateFormat: company.dateFormat || "DD/MM/YYYY",
            purchasePrefix: company.purchasePrefix || "PUR",
            salesPrefix: company.salesPrefix || "SAL",
            startingInvoiceNumber: String(company.startingInvoiceNumber ?? 1),
            autoIncrementInvoice:
              typeof company.autoIncrementInvoice === "boolean"
                ? company.autoIncrementInvoice
                : true,
            logoUrl: company.logoUrl || "",
          });
        } else if (active) {
          setForm({
            ...screenshotFallbackState,
          });
        }
      } catch (loadError: any) {
        if (active) {
          setError(loadError?.message || "Failed to load company settings.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCompany();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof CompanyFormState>(
    key: K,
    value: CompanyFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      const response = await fetch("/api/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          vatRate: Number(form.vatRate || 0),
          startingInvoiceNumber: Number(form.startingInvoiceNumber || 1),
        }),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to save company settings.");
      }

      setMessage("Company settings saved successfully.");
    } catch (saveError: any) {
      setError(saveError?.message || "Failed to save company settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Company Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the master company profile used across purchases and exports.
        </p>
      </div>

      {message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm sm:p-6">
          Loading company settings...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="A. Company Information">
            <Field label="Company Name">
              <input
                value={form.companyName}
                onChange={(event) => updateField("companyName", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Trade Name">
              <input
                value={form.tradeName}
                onChange={(event) => updateField("tradeName", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="PAN Number">
              <input
                value={form.panNumber}
                onChange={(event) => updateField("panNumber", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="VAT Number">
              <input
                value={form.vatNumber}
                onChange={(event) => updateField("vatNumber", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Registration Number">
              <input
                value={form.registrationNumber}
                onChange={(event) => updateField("registrationNumber", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Website">
              <input
                value={form.website}
                onChange={(event) => updateField("website", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
          </Section>

          <Section title="B. Address">
            <Field label="Province">
              <input
                value={form.province}
                onChange={(event) => updateField("province", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="District">
              <input
                value={form.district}
                onChange={(event) => updateField("district", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Municipality">
              <input
                value={form.municipality}
                onChange={(event) => updateField("municipality", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Ward">
              <input
                value={form.ward}
                onChange={(event) => updateField("ward", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Street Address">
              <input
                value={form.streetAddress}
                onChange={(event) => updateField("streetAddress", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Postal Code">
              <input
                value={form.postalCode}
                onChange={(event) => updateField("postalCode", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
          </Section>

          <Section title="C. Tax Settings">
            <Field label="Fiscal Year">
              <select
                value={form.fiscalYear}
                onChange={(event) => updateField("fiscalYear", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              >
                {fiscalYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tax Period">
              <input
                value={form.taxPeriod}
                onChange={(event) => updateField("taxPeriod", event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="VAT Rate">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.vatRate}
                onChange={(event) => updateField("vatRate", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Currency">
              <input
                value={form.currency}
                onChange={(event) => updateField("currency", event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Date Format">
              <input
                value={form.dateFormat}
                onChange={(event) => updateField("dateFormat", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
          </Section>

          <Section title="D. Invoice Settings">
            <Field label="Purchase Prefix">
              <input
                value={form.purchasePrefix}
                onChange={(event) => updateField("purchasePrefix", event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Sales Prefix">
              <input
                value={form.salesPrefix}
                onChange={(event) => updateField("salesPrefix", event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none transition focus:border-blue-500"
              />
            </Field>
            <Field label="Starting Invoice Number">
              <input
                type="number"
                min="1"
                value={form.startingInvoiceNumber}
                onChange={(event) => updateField("startingInvoiceNumber", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
            <div className="flex items-center gap-3 pt-8">
              <input
                id="autoIncrementInvoice"
                type="checkbox"
                checked={form.autoIncrementInvoice}
                onChange={(event) =>
                  updateField("autoIncrementInvoice", event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="autoIncrementInvoice"
                className="text-sm font-medium text-gray-700"
              >
                Auto Increment Invoice
              </label>
            </div>
          </Section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              E. Logo URL
            </h2>
            <Field label="Logo URL">
              <input
                value={form.logoUrl}
                onChange={(event) => updateField("logoUrl", event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </Field>
          </section>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

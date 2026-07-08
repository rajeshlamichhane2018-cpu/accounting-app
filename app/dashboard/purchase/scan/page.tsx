"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NEPALI_FISCAL_MONTHS, getNepaliVatPeriodFromDate } from "@/lib/vat-period";

type ScanResult = {
  date?: string;
  invoiceNumber?: string;
  supplierName?: string;
  supplierPan?: string;
  goodsOrService?: string;
  taxableAmount?: number;
  vatAmount?: number;
  totalAmount?: number;
  confidence?: number;
  rawText?: string;
  fiscalYear?: string;
  month?: string;
  taxPeriod?: string;
  periodWarning?: string;
};

type ReviewFormState = {
  fiscalYear: string;
  month: string;
  date: string;
  invoiceNumber: string;
  supplierName: string;
  supplierPan: string;
  goodsOrService: string;
  taxableAmount: string;
  vatAmount: string;
  totalAmount: string;
  remarks: string;
};

const fiscalYearOptions = ["2082", "2083"];

type ScanItemState = {
  id: string;
  fileName: string;
  previewUrl?: string;
  confidence?: number;
  rawText?: string;
  periodWarning?: string;
  form: ReviewFormState;
  saving: boolean;
  saved: boolean;
  error: string;
};

const initialReviewState: ReviewFormState = {
  fiscalYear: "",
  month: "",
  date: "",
  invoiceNumber: "",
  supplierName: "",
  supplierPan: "",
  goodsOrService: "",
  taxableAmount: "",
  vatAmount: "",
  totalAmount: "",
  remarks: "",
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatConfidence(value?: number) {
  if (typeof value !== "number") return "0%";
  return `${Math.round(value * 100)}%`;
}

function getPreviewDate(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createFormFromScan(scan: ScanResult): ReviewFormState {
  return {
    fiscalYear: scan.fiscalYear || "",
    month: scan.month || "",
    date: getPreviewDate(scan.date),
    invoiceNumber: scan.invoiceNumber || "",
    supplierName: scan.supplierName || "",
    supplierPan: scan.supplierPan || "",
    goodsOrService: scan.goodsOrService || "",
    taxableAmount: String(scan.taxableAmount ?? ""),
    vatAmount: String(scan.vatAmount ?? ""),
    totalAmount: String(scan.totalAmount ?? ""),
    remarks: "",
  };
}

function createScanItem(
  scan: ScanResult,
  fileName: string,
  previewUrl?: string
): ScanItemState {
  return {
    id: makeId(),
    fileName,
    previewUrl,
    confidence: scan.confidence,
    rawText: scan.rawText,
    periodWarning: scan.periodWarning,
    form: createFormFromScan(scan),
    saving: false,
    saved: false,
    error: "",
  };
}

async function scanSingleFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/purchase-ledger/scan", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Failed to scan bill.");
  }

  return result?.data as ScanResult & {
    batch?: boolean;
    items?: Array<ScanResult & { fileName?: string }>;
  };
}

function createNumberedItemLabel(base: string, index: number) {
  return `${base} (${index + 1})`;
}

export default function PurchaseScanPage() {
  const router = useRouter();
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreviewUrl, setSinglePreviewUrl] = useState("");
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkPreviewUrls, setBulkPreviewUrls] = useState<string[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [scanItems, setScanItems] = useState<ScanItemState[]>([]);
  const [scanError, setScanError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [scanNotice, setScanNotice] = useState("");
  const [scanning, setScanning] = useState(false);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    if (!singleFile) {
      setSinglePreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(singleFile);
    setSinglePreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [singleFile]);

  useEffect(() => {
    if (bulkFiles.length === 0) {
      setBulkPreviewUrls([]);
      return;
    }

    const urls = bulkFiles.map((file) => URL.createObjectURL(file));
    setBulkPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [bulkFiles]);

  const confidenceText = useMemo(() => {
    if (scanItems.length === 0) return "0%";
    const total = scanItems.reduce((sum, item) => sum + (item.confidence || 0), 0);
    return formatConfidence(total / scanItems.length);
  }, [scanItems]);

  function clearMessages() {
    setScanError("");
    setSaveError("");
    setScanNotice("");
  }

  function updateItemForm(
    itemId: string,
    field: keyof ReviewFormState,
    value: string
  ) {
    setScanItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        const nextForm = { ...item.form, [field]: value };

        if (field === "date") {
          const period = getNepaliVatPeriodFromDate(value);
          nextForm.fiscalYear = period?.fiscalYear || nextForm.fiscalYear;
          nextForm.month = period?.month || nextForm.month;
          return {
            ...item,
            form: nextForm,
            periodWarning:
              period?.warning ||
              (!period ? "Could not detect VAT period. Please select manually." : undefined),
            saved: false,
            error: "",
          };
        }

        return {
          ...item,
          form: nextForm,
          saved: false,
          error: "",
        };
      })
    );
  }

  function replaceItems(nextItems: ScanItemState[]) {
    setScanItems((current) => [...current, ...nextItems]);
  }

  async function scanSingle() {
    if (!singleFile) {
      setScanError("Please choose a bill photo first.");
      return;
    }

    try {
      setScanning(true);
      clearMessages();

      const data = await scanSingleFile(singleFile);
      replaceItems([createScanItem(data, singleFile.name, singlePreviewUrl)]);
      setScanNotice("Single photo scanned. Please review the extracted data below.");
    } catch (error: any) {
      setScanError(error?.message || "Failed to scan bill photo.");
    } finally {
      setScanning(false);
    }
  }

  async function scanBulkPhotos() {
    if (bulkFiles.length === 0) {
      setScanError("Please choose one or more bill photos first.");
      return;
    }

    try {
      setScanning(true);
      clearMessages();

      const nextItems: ScanItemState[] = [];

      for (let index = 0; index < bulkFiles.length; index += 1) {
        const file = bulkFiles[index];
        const data = await scanSingleFile(file);
        nextItems.push(
          createScanItem(data, file.name, bulkPreviewUrls[index])
        );
      }

      replaceItems(nextItems);
      setScanNotice(`Scanned ${nextItems.length} photo(s). Review each item before saving.`);
    } catch (error: any) {
      setScanError(error?.message || "Failed to scan one or more photos.");
    } finally {
      setScanning(false);
    }
  }

  async function scanZipUpload() {
    if (!zipFile) {
      setScanError("Please choose a ZIP file first.");
      return;
    }

    try {
      setScanning(true);
      clearMessages();

      const formData = new FormData();
      formData.append("file", zipFile);

      const response = await fetch("/api/purchase-ledger/scan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to scan ZIP file.");
      }

      const data = result?.data;
      const zipItems = Array.isArray(data?.items) ? data.items : [];

      if (zipItems.length === 0) {
        throw new Error("ZIP file did not contain any supported bill images.");
      }

      const nextItems = zipItems.map((item: ScanResult & { fileName?: string }) =>
        createScanItem(item, item.fileName || "ZIP image")
      );

      replaceItems(nextItems);
      setScanNotice(`Scanned ${nextItems.length} image(s) from ZIP. Review each item before saving.`);
    } catch (error: any) {
      setScanError(error?.message || "Failed to scan ZIP file.");
    } finally {
      setScanning(false);
    }
  }

  async function saveItem(itemId: string, redirectAfterSave = true) {
    const item = scanItems.find((entry) => entry.id === itemId);
    if (!item) return false;

    if (
      !item.form.date ||
      !item.form.invoiceNumber.trim() ||
      !item.form.supplierName.trim() ||
      !item.form.supplierPan.trim() ||
      !item.form.fiscalYear.trim() ||
      !item.form.month.trim()
    ) {
      setScanItems((current) =>
        current.map((entry) =>
          entry.id === itemId
            ? { ...entry, error: "Please fill all required fields before saving." }
            : entry
        )
      );
      return false;
    }

    const totalAmount = toNumber(item.form.totalAmount);
    const payload = {
      fiscalYear: item.form.fiscalYear.trim(),
      month: item.form.month.trim(),
      date: item.form.date,
      invoiceNumber: item.form.invoiceNumber.trim(),
      supplierName: item.form.supplierName.trim(),
      supplierPan: item.form.supplierPan.trim(),
      goodsOrService: item.form.goodsOrService.trim(),
      taxableAmount: toNumber(item.form.taxableAmount),
      vatAmount: toNumber(item.form.vatAmount),
      totalAmount,
      grossAmount: totalAmount,
      exemptAmount: 0,
      quantity: 1,
      unit: "PCS",
      source: "ocr",
      remarks: item.form.remarks.trim() || "Scanned from bill photo",
    };

    setScanItems((current) =>
      current.map((entry) =>
        entry.id === itemId ? { ...entry, saving: true, error: "" } : entry
      )
    );

    try {
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

      setScanItems((current) =>
        current.map((entry) =>
          entry.id === itemId
            ? { ...entry, saving: false, saved: true, error: "" }
            : entry
        )
      );

      if (redirectAfterSave) {
        router.push("/dashboard/purchase");
      }

      return true;
    } catch (error: any) {
      setScanItems((current) =>
        current.map((entry) =>
          entry.id === itemId
            ? {
                ...entry,
                saving: false,
                saved: false,
                error: error?.message || "Failed to save purchase.",
              }
            : entry
        )
      );
      return false;
    }
  }

  async function saveAll() {
    if (scanItems.length === 0) return;

    try {
      setSavingAll(true);
      setSaveError("");

      let allSaved = true;

      for (const item of scanItems) {
        if (item.saved) continue;
        const saved = await saveItem(item.id, false);
        if (!saved) {
          allSaved = false;
        }
      }

      if (allSaved) {
        router.push("/dashboard/purchase");
      }
    } catch (error: any) {
      setSaveError(error?.message || "Failed to save scanned bills.");
    } finally {
      setSavingAll(false);
    }
  }

  function resetSingleSelection(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setSingleFile(selected);
    setBulkFiles([]);
    setZipFile(null);
    clearMessages();
    if (!selected) {
      setSinglePreviewUrl("");
    }
  }

  function resetBulkSelection(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setBulkFiles(selected);
    setSingleFile(null);
    setZipFile(null);
    clearMessages();
  }

  function resetZipSelection(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setZipFile(selected);
    setSingleFile(null);
    setBulkFiles([]);
    clearMessages();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          AI Bill Scanner
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Capture bills from mobile camera, bulk photos, or ZIP upload. Review everything before saving.
        </p>
      </div>

      {scanError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {scanError}
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}

      {scanNotice ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {scanNotice}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900">A. Camera / Single Photo</h2>
          <p className="mt-1 text-sm text-gray-500">
            Use your phone camera to click a bill and upload it directly.
          </p>

          <div className="mt-4 space-y-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={resetSingleSelection}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:hover:bg-blue-700"
            />

            {singlePreviewUrl ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={singlePreviewUrl}
                  alt="Single bill preview"
                  className="max-h-72 w-full object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                Camera preview will appear here.
              </div>
            )}

            <button
              type="button"
              onClick={scanSingle}
              disabled={scanning || !singleFile}
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {scanning ? "Scanning..." : "Scan Photo"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900">B. Bulk Photo Upload</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select multiple bill photos and scan them one by one.
          </p>

          <div className="mt-4 space-y-4">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
              multiple
              onChange={resetBulkSelection}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white file:hover:bg-purple-700"
            />

            {bulkPreviewUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {bulkPreviewUrls.map((url, index) => (
                  <div
                    key={`${bulkFiles[index]?.name || "bulk"}-${index}`}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={url}
                      alt={bulkFiles[index]?.name || `Bill ${index + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <div className="border-t px-3 py-2 text-xs text-gray-600">
                      {createNumberedItemLabel(bulkFiles[index]?.name || "Bill", index)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                Multiple photo previews will appear here.
              </div>
            )}

            <button
              type="button"
              onClick={scanBulkPhotos}
              disabled={scanning || bulkFiles.length === 0}
              className="w-full rounded-lg bg-purple-600 px-5 py-2.5 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {scanning ? "Scanning..." : "Scan Photos"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-gray-900">C. ZIP Upload</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload a ZIP file containing multiple bill photos.
          </p>

          <div className="mt-4 space-y-4">
            <input
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              onChange={resetZipSelection}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white file:hover:bg-emerald-700"
            />

            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
              {zipFile ? (
                <span>{zipFile.name}</span>
              ) : (
                <span>ZIP preview is not shown here. Scanned items will appear below.</span>
              )}
            </div>

            <button
              type="button"
              onClick={scanZipUpload}
              disabled={scanning || !zipFile}
              className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {scanning ? "Scanning..." : "Scan ZIP"}
            </button>
          </div>
        </section>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Scan Summary</h2>
            <p className="mt-1 text-sm text-gray-500">
              Confidence, OCR text, and period detection for saved scan items.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            Average confidence: <span className="font-semibold text-gray-900">{confidenceText}</span>
          </div>
        </div>

        {scanItems.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-4 py-14 text-center text-sm text-gray-500">
            No scanned bills yet. Use one of the upload options above.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={saveAll}
                disabled={savingAll}
                className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingAll ? "Saving..." : "Save All"}
              </button>
            </div>

            {scanItems.map((item, index) => (
              <ScanItemCard
                key={item.id}
                item={item}
                index={index}
                onChange={updateItemForm}
                onSave={async () => {
                  await saveItem(item.id, true);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScanItemCard({
  item,
  index,
  onChange,
  onSave,
}: {
  item: ScanItemState;
  index: number;
  onChange: (itemId: string, field: keyof ReviewFormState, value: string) => void;
  onSave: () => Promise<void>;
}) {
  const periodText =
    item.form.fiscalYear || item.form.month
      ? `${item.form.fiscalYear || "-"} / ${item.form.month || "-"}`
      : "-";

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void onSave();
      }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
    >
      <div className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">
              {createNumberedItemLabel(item.fileName, index)}
            </h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
              {formatConfidence(item.confidence)}
            </span>
          </div>

          {item.previewUrl ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <img
                src={item.previewUrl}
                alt={item.fileName}
                className="max-h-72 w-full object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-sm text-gray-500">
              Preview unavailable for ZIP item.
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-900">Detected Period:</span>{" "}
              {periodText}
            </p>
            {item.periodWarning ? (
              <p className="mt-2 text-amber-700">{item.periodWarning}</p>
            ) : null}
            {item.rawText ? (
              <p className="mt-3 text-xs leading-5 text-gray-500">
                <span className="font-medium text-gray-700">OCR:</span> {item.rawText}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          {item.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {item.error}
            </div>
          ) : null}

          {item.saved ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Saved to Purchase Ledger.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Fiscal Year <span className="text-red-500">*</span>
              </span>
              <select
                value={item.form.fiscalYear}
                onChange={(event) => onChange(item.id, "fiscalYear", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
                required
              >
                {fiscalYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Month <span className="text-red-500">*</span>
              </span>
              <select
                value={item.form.month}
                onChange={(event) => onChange(item.id, "month", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 uppercase outline-none transition focus:border-blue-500"
                required
              >
                <option value="">Select month</option>
                {NEPALI_FISCAL_MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </span>
              <input
                type="date"
                value={item.form.date}
                onChange={(event) => onChange(item.id, "date", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Invoice Number <span className="text-red-500">*</span>
              </span>
              <input
                value={item.form.invoiceNumber}
                onChange={(event) => onChange(item.id, "invoiceNumber", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Supplier Name <span className="text-red-500">*</span>
              </span>
              <input
                value={item.form.supplierName}
                onChange={(event) => onChange(item.id, "supplierName", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Supplier PAN <span className="text-red-500">*</span>
              </span>
              <input
                value={item.form.supplierPan}
                onChange={(event) => onChange(item.id, "supplierPan", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="block text-sm font-medium text-gray-700">
                Goods / Service
              </span>
              <input
                value={item.form.goodsOrService}
                onChange={(event) => onChange(item.id, "goodsOrService", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Taxable Amount
              </span>
              <input
                type="number"
                step="0.01"
                value={item.form.taxableAmount}
                onChange={(event) => onChange(item.id, "taxableAmount", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                VAT Amount
              </span>
              <input
                type="number"
                step="0.01"
                value={item.form.vatAmount}
                onChange={(event) => onChange(item.id, "vatAmount", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-700">
                Total Amount
              </span>
              <input
                type="number"
                step="0.01"
                value={item.form.totalAmount}
                onChange={(event) => onChange(item.id, "totalAmount", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="block text-sm font-medium text-gray-700">
                Remarks
              </span>
              <textarea
                rows={4}
                value={item.form.remarks}
                onChange={(event) => onChange(item.id, "remarks", event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-blue-500"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="submit"
              disabled={item.saving || item.saved}
              className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {item.saving ? "Saving..." : item.saved ? "Saved" : "Save Bill"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

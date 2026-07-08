export type VatPeriodResult = {
  fiscalYear: string;
  month: string;
  taxPeriod: string;
  warning?: string;
};

const nepaliMonths = [
  "POUSH",
  "MAGH",
  "FALGUN",
  "CHAITRA",
  "BAISAKH",
  "JESTHA",
  "ASHADH",
  "SHRAWAN",
  "BHADRA",
  "ASHWIN",
  "KARTIK",
  "MANGSIR",
] as const;

function parseDateInput(dateInput: string | Date) {
  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime()) ? null : new Date(dateInput);
  }

  const trimmed = dateInput.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const parsed = new Date(year, month, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getNepaliVatPeriodFromDate(
  dateInput?: string | Date
): VatPeriodResult | null {
  if (!dateInput) return null;

  const date = parseDateInput(dateInput);
  if (!date) return null;

  const adMonthIndex = date.getMonth();
  const month = nepaliMonths[adMonthIndex];

  // TODO: Replace fallback with accurate AD to BS Nepali calendar conversion later.
  const fiscalYear = String(adMonthIndex >= 6 ? date.getFullYear() + 57 : date.getFullYear() + 56);

  return {
    fiscalYear,
    month,
    taxPeriod: month,
  };
}

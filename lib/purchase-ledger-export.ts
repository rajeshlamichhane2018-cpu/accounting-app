import ExcelJS from "exceljs";

export type PurchaseLedgerExportRow = {
  date?: string | Date;
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
  importAmount?: number;
  customsOffice?: string;
  customsDeclarationNo?: string;
  customsDeclarationDate?: string | Date;
  totalAmount?: number;
  remarks?: string;
};

type ExportOptions = {
  companyName?: string;
  panNo?: string;
  fiscalYear?: string;
  month?: string;
  rows: PurchaseLedgerExportRow[];
};

const SHEET_NAME = "Purchase Ledger";
const TEMPLATE_BODY_ROWS = 16;
const TABLE_FILL = "FFF2C9C9";
const HEADER_FILL = "FFF4CFCF";
const BORDER_COLOR = "FF1A1A1A";
const GROUP_FONT = { name: "Nirmala UI", bold: true, size: 11 };
const BODY_FONT = { name: "Nirmala UI", size: 10 };
const NUM_FMT = '#,##0.00;[Red]-#,##0.00';

type ColumnKey =
  | "date"
  | "invoiceNumber"
  | "supplierName"
  | "supplierPan"
  | "goodsOrService"
  | "quantity"
  | "unit"
  | "grossAmount"
  | "exemptAmount"
  | "taxableAmount"
  | "vatAmount"
  | "importAmount"
  | "customsOffice"
  | "customsDeclarationNo"
  | "customsDeclarationDate";

type ColumnDefinition = {
  key: ColumnKey;
  width: number;
  label: string;
  numFmt?: string;
};

const columnDefinitions: ColumnDefinition[] = [
  { key: "date", label: "मिति", width: 12, numFmt: "dd/mm/yyyy" },
  { key: "invoiceNumber", label: "बीजक नम्बर", width: 12 },
  { key: "supplierName", label: "खरीददाताको नाम", width: 16 },
  { key: "supplierPan", label: "खरीददाताको स्थायी लेखा नम्बर", width: 16 },
  { key: "goodsOrService", label: "वस्तु वा सेवाको नाम", width: 18 },
  { key: "quantity", label: "वस्तु वा सेवाको परिमाण", width: 14, numFmt: NUM_FMT },
  { key: "unit", label: "वस्तु वा सेवाको एकाइ", width: 12 },
  { key: "grossAmount", label: "जम्मा खरिद मूल्य (र)", width: 14, numFmt: NUM_FMT },
  { key: "exemptAmount", label: "स्थानीय कर छुटको खरिद मूल्य (र)", width: 14, numFmt: NUM_FMT },
  { key: "taxableAmount", label: "करयोग्य खरिद मूल्य (र)", width: 14, numFmt: NUM_FMT },
  { key: "vatAmount", label: "कर (र)", width: 12, numFmt: NUM_FMT },
  { key: "importAmount", label: "आयात गरिएको वस्तु वा सेवाको मूल्य (र)", width: 14, numFmt: NUM_FMT },
  { key: "customsOffice", label: "भन्सार कार्यालय", width: 13 },
  { key: "customsDeclarationNo", label: "भन्सार प्रज्ञापनपत्र नम्बर", width: 14 },
  { key: "customsDeclarationDate", label: "भन्सार प्रज्ञापनपत्र मिति", width: 13, numFmt: "dd/mm/yyyy" },
];

type Totals = {
  grossAmount: number;
  exemptAmount: number;
  taxableAmount: number;
  vatAmount: number;
  importAmount: number;
};

function toDate(value?: string | Date) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function applyBorder(cell: ExcelJS.Cell, style: ExcelJS.BorderStyle = "thin") {
  cell.border = {
    top: { style, color: { argb: BORDER_COLOR } },
    left: { style, color: { argb: BORDER_COLOR } },
    bottom: { style, color: { argb: BORDER_COLOR } },
    right: { style, color: { argb: BORDER_COLOR } },
  };
}

function applyFill(cell: ExcelJS.Cell, argb = TABLE_FILL) {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb },
  };
}

function mergeAndStyle(
  worksheet: ExcelJS.Worksheet,
  range: string,
  value: string,
  style: {
    font?: Partial<ExcelJS.Font>;
    alignment?: Partial<ExcelJS.Alignment>;
    fill?: string;
  }
) {
  worksheet.mergeCells(range);
  const cell = worksheet.getCell(range.split(":")[0]);
  cell.value = value;
  cell.font = { name: "Nirmala UI", ...(style.font || {}) };
  cell.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
    ...(style.alignment || {}),
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: style.fill || HEADER_FILL },
  };
  applyBorder(cell, "medium");
}

function setPageSetup(worksheet: ExcelJS.Worksheet, endRow: number) {
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalDpi: 300,
    verticalDpi: 300,
    margins: {
      left: 0.2,
      right: 0.2,
      top: 0.4,
      bottom: 0.4,
      header: 0.15,
      footer: 0.15,
    },
  };

  worksheet.pageSetup.printArea = `A1:O${endRow}`;
  worksheet.pageSetup.printTitlesRow = "1:5";
  worksheet.views = [{ state: "frozen", ySplit: 5 }];
}

function drawHeader(
  worksheet: ExcelJS.Worksheet,
  companyName: string,
  panNo: string,
  fiscalYear: string,
  month: string
) {
  mergeAndStyle(worksheet, "A1:O1", "खरिद खाता", {
    font: { bold: true, size: 18 },
  });
  mergeAndStyle(worksheet, "A2:O2", "(नियम २३ को उपनियम (१) को खण्ड (ज) संग सम्बन्धित)", {
    font: { bold: true, size: 11 },
  });
  mergeAndStyle(
    worksheet,
    "A3:O3",
    `करदाता दर्ता नं (PAN) :- ${panNo || "__________"}  करदाताको नाम:- ${
      companyName || "________________"
    }  साल - ${fiscalYear || "__________"}  कर अवधि:- ${month || "__________"}`,
    {
      font: { bold: true, size: 10 },
    }
  );

  worksheet.getRow(1).height = 28;
  worksheet.getRow(2).height = 22;
  worksheet.getRow(3).height = 22;
}

function drawTableHeader(worksheet: ExcelJS.Worksheet) {
  mergeAndStyle(worksheet, "A4:G4", "बीजक", {
    font: { bold: true, size: 11 },
  });
  mergeAndStyle(worksheet, "H4:K4", "करयोग्य खरिद", {
    font: { bold: true, size: 11 },
  });
  mergeAndStyle(worksheet, "L4:O4", "आयात", {
    font: { bold: true, size: 11 },
  });

  const row = worksheet.getRow(5);
  row.height = 78;

  columnDefinitions.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    cell.value = column.label;
    cell.font = GROUP_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    applyBorder(cell, "medium");
    applyFill(cell);
  });
}

function drawBody(
  worksheet: ExcelJS.Worksheet,
  rows: PurchaseLedgerExportRow[],
  startRow: number
) {
  const bodyRowCount = Math.max(rows.length, TEMPLATE_BODY_ROWS);
  let rowIndex = startRow;
  const totals: Totals = {
    grossAmount: 0,
    exemptAmount: 0,
    taxableAmount: 0,
    vatAmount: 0,
    importAmount: 0,
  };

  for (let i = 0; i < bodyRowCount; i += 1) {
    const source = rows[i];
    const row = worksheet.getRow(rowIndex);
    row.height = 22;

    const values = {
      date: toDate(source?.date),
      invoiceNumber: source?.invoiceNumber || "",
      supplierName: source?.supplierName || "",
      supplierPan: source?.supplierPan || "",
      goodsOrService: source?.goodsOrService || "",
      quantity: source?.quantity ?? null,
      unit: source?.unit || "",
      grossAmount: source?.grossAmount ?? null,
      exemptAmount: source?.exemptAmount ?? null,
      taxableAmount: source?.taxableAmount ?? null,
      vatAmount: source?.vatAmount ?? null,
      importAmount: source?.importAmount ?? null,
      customsOffice: source?.customsOffice || "",
      customsDeclarationNo: source?.customsDeclarationNo || "",
      customsDeclarationDate: toDate(source?.customsDeclarationDate),
    };

    columnDefinitions.forEach((column, columnIndex) => {
      const cell = row.getCell(columnIndex + 1);
      const value = values[column.key];
      const isDate = value instanceof Date;
      const isNumeric =
        typeof value === "number" &&
        ["quantity", "grossAmount", "exemptAmount", "taxableAmount", "vatAmount", "importAmount"].includes(column.key);

      cell.value = value as ExcelJS.CellValue;
      cell.font = BODY_FONT;
      cell.alignment = {
        horizontal: isNumeric ? "right" : column.key === "date" || column.key === "customsDeclarationDate" ? "center" : "left",
        vertical: "middle",
        wrapText: true,
      };
      if (column.numFmt && (isDate || typeof value === "number")) {
        cell.numFmt = column.numFmt;
      }
      applyBorder(cell);
      applyFill(cell);
    });

    if (typeof source?.grossAmount === "number") totals.grossAmount += source.grossAmount;
    if (typeof source?.exemptAmount === "number") totals.exemptAmount += source.exemptAmount;
    if (typeof source?.taxableAmount === "number") totals.taxableAmount += source.taxableAmount;
    if (typeof source?.vatAmount === "number") totals.vatAmount += source.vatAmount;
    if (typeof source?.importAmount === "number") totals.importAmount += source.importAmount;

    rowIndex += 1;
  }

  return { endRow: rowIndex - 1, totals };
}

function drawTotals(
  worksheet: ExcelJS.Worksheet,
  rowIndex: number,
  bodyStartRow: number,
  bodyEndRow: number,
  totals: Totals
) {
  const row = worksheet.getRow(rowIndex);
  row.height = 20;
  worksheet.mergeCells(`A${rowIndex}:G${rowIndex}`);

  const labelCell = row.getCell(1);
  labelCell.value = "GRAND TOTAL";
  labelCell.font = { name: "Nirmala UI", bold: true, size: 11 };
  labelCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  applyBorder(labelCell, "medium");
  applyFill(labelCell);

  const totalMap: Array<[number, number]> = [
    [8, totals.grossAmount],
    [9, totals.exemptAmount],
    [10, totals.taxableAmount],
    [11, totals.vatAmount],
    [12, totals.importAmount],
  ];

  totalMap.forEach(([columnIndex, value]) => {
    const cell = row.getCell(columnIndex);
    const columnLetter = String.fromCharCode(64 + columnIndex);
    cell.value = {
      formula: `SUM(${columnLetter}${bodyStartRow}:${columnLetter}${bodyEndRow})`,
      result: value,
    } as ExcelJS.CellValue;
    cell.numFmt = NUM_FMT;
    cell.font = { name: "Nirmala UI", bold: true, size: 10 };
    cell.alignment = { horizontal: "right", vertical: "middle" };
    applyBorder(cell, "medium");
    applyFill(cell);
  });

  [13, 14, 15].forEach((columnIndex) => {
    const cell = row.getCell(columnIndex);
    applyBorder(cell, "medium");
    applyFill(cell);
  });
}

export async function buildPurchaseLedgerWorkbook({
  companyName = "",
  panNo = "",
  fiscalYear = "",
  month = "",
  rows,
}: ExportOptions) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Accounting App";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(SHEET_NAME);
  worksheet.properties.defaultRowHeight = 20;
  worksheet.columns = columnDefinitions.map((column) => ({
    key: column.key,
    width: column.width,
  }));

  drawHeader(worksheet, companyName, panNo, fiscalYear, month);
  drawTableHeader(worksheet);

  const bodyStartRow = 6;
  const { endRow: bodyEndRow, totals } = drawBody(worksheet, rows, bodyStartRow);
  const totalRowIndex = bodyEndRow + 1;
  drawTotals(worksheet, totalRowIndex, bodyStartRow, bodyEndRow, totals);

  columnDefinitions.forEach((column, index) => {
    worksheet.getColumn(index + 1).width = column.width;
  });

  setPageSetup(worksheet, totalRowIndex);

  return workbook;
}

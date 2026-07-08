import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getNepaliVatPeriodFromDate } from "@/lib/vat-period";
import { scanBillImage } from "@/lib/bill-scanner";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const allowedZipTypes = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "multipart/x-zip",
]);

const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);

export const runtime = "nodejs";

function buildScannedResponse(scanned: Awaited<ReturnType<typeof scanBillImage>>) {
  const period = getNepaliVatPeriodFromDate(scanned.date);

  return {
    ...scanned,
    fiscalYear: period?.fiscalYear || "",
    month: period?.month || "",
    taxPeriod: period?.taxPeriod || "",
    periodWarning:
      period?.warning ||
      (!period ? "Could not detect VAT period. Please select manually." : undefined),
  };
}

function getFileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

type ScannedResponse = ReturnType<typeof buildScannedResponse>;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload an image file.",
        },
        { status: 400 }
      );
    }

    if (!allowedImageTypes.has(fileEntry.type) && !allowedZipTypes.has(fileEntry.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, JPEG, PNG, WEBP, or ZIP files are allowed.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await fileEntry.arrayBuffer());

    if (allowedZipTypes.has(fileEntry.type) || fileEntry.name.toLowerCase().endsWith(".zip")) {
      const zip = await JSZip.loadAsync(buffer);
      const entries = Object.values(zip.files).filter((entry) => !entry.dir);
      const images = entries.filter((entry) =>
        allowedImageExtensions.has(getFileExtension(entry.name))
      );

      if (images.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "ZIP file does not contain any supported bill images.",
          },
          { status: 400 }
        );
      }

      const items: Array<ScannedResponse & { fileName: string }> = [];

      for (const entry of images) {
        const entryBuffer = Buffer.from(await entry.async("uint8array"));
        const scanned = await scanBillImage(entryBuffer);
        items.push({
          fileName: entry.name,
          ...buildScannedResponse(scanned),
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          batch: true,
          items,
        },
      });
    }

    const scanned = await scanBillImage(buffer);

    return NextResponse.json({
      success: true,
      data: buildScannedResponse(scanned),
    });
  } catch (error: any) {
    console.error("Purchase Ledger Scan Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to scan bill image.",
      },
      { status: 500 }
    );
  }
}

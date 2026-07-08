import mongoose, { Schema, InferSchemaType } from "mongoose";

const PurchaseLedgerSchema = new Schema(
  {
    // Company
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: false,
      index: true,
    },

    // VAT Period
    fiscalYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    month: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // Purchase Info
    date: {
      type: Date,
      required: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    supplierName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    supplierPan: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Goods / Service
    goodsOrService: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    // Amounts
    grossAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    exemptAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    vatAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Import (Optional)
    importAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    customsOffice: {
      type: String,
      default: "",
    },

    customsDeclarationNo: {
      type: String,
      default: "",
    },

    customsDeclarationDate: Date,

    remarks: {
      type: String,
      default: "",
    },

    // AI Ready
    source: {
      type: String,
      enum: ["manual", "excel", "ocr"],
      default: "manual",
      index: true,
    },

    attachment: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "posted"],
      default: "posted",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Duplicate Protection
 *
 * एउटै Company + Fiscal Year + Month + Supplier PAN + Invoice
 * दुई पटक save हुन नदिने
 */

PurchaseLedgerSchema.index(
  {
    companyId: 1,
    fiscalYear: 1,
    month: 1,
    supplierPan: 1,
    invoiceNumber: 1,
  },
  {
    unique: true,
  }
);

/**
 * Search Optimization
 */

PurchaseLedgerSchema.index({
  supplierName: "text",
  invoiceNumber: "text",
});

export type PurchaseLedger =
  InferSchemaType<typeof PurchaseLedgerSchema>;

export default mongoose.models.PurchaseLedger ||
  mongoose.model("PurchaseLedger", PurchaseLedgerSchema);

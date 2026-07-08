import mongoose, { Schema } from "mongoose";

const CompanySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    tradeName: {
      type: String,
      default: "",
      trim: true,
    },
    panNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vatNumber: {
      type: String,
      default: "",
      trim: true,
    },
    registrationNumber: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    province: {
      type: String,
      default: "",
      trim: true,
    },
    district: {
      type: String,
      default: "",
      trim: true,
    },
    municipality: {
      type: String,
      default: "",
      trim: true,
    },
    ward: {
      type: String,
      default: "",
      trim: true,
    },
    streetAddress: {
      type: String,
      default: "",
      trim: true,
    },
    postalCode: {
      type: String,
      default: "",
      trim: true,
    },
    fiscalYear: {
      type: String,
      default: "2082",
      trim: true,
    },
    taxPeriod: {
      type: String,
      default: "MAGH",
      trim: true,
      uppercase: true,
    },
    vatRate: {
      type: Number,
      default: 13,
      min: 0,
    },
    currency: {
      type: String,
      default: "NPR",
      trim: true,
      uppercase: true,
    },
    dateFormat: {
      type: String,
      default: "DD/MM/YYYY",
      trim: true,
    },
    purchasePrefix: {
      type: String,
      default: "PUR",
      trim: true,
      uppercase: true,
    },
    salesPrefix: {
      type: String,
      default: "SAL",
      trim: true,
      uppercase: true,
    },
    startingInvoiceNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    autoIncrementInvoice: {
      type: Boolean,
      default: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);

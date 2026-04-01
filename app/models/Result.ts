import mongoose, { Document, Schema, Types } from "mongoose";

export interface IResult extends Document {
  userId: Types.ObjectId;
  fileName: string;
  totalPages: number;
  printedPageSequence: (number | null)[];
  pageSummary: {
    printedPage: number | null;
    range: string | null;
    questionStarts: number[];
  }[];
}

const ResultSchema = new Schema<IResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    totalPages: { type: Number, required: true },
    printedPageSequence: { type: [Schema.Types.Mixed], required: true },
    pageSummary: {
      type: [
        {
          printedPage: Schema.Types.Mixed,
          range: Schema.Types.Mixed,
          questionStarts: { type: [Number], default: [] },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);

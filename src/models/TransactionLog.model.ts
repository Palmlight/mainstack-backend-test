import { TransactionStatus, TransactionTypes } from '@/constants';
import { InferSchemaType, model, Schema } from 'mongoose';

const TransactionLogSchema = new Schema(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionTypes),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      required: true,
    },
    errorMessage: {
      type: String,
    },
    description: {
      type: String,
    },
    meta: {
      type: Object,
    },
  },
  {
    timestamps: true,
  },
);

export type ITransactionLog = InferSchemaType<typeof TransactionLogSchema>;

export const TransactionLogModel = model<ITransactionLog>(
  'TransactionLog',
  TransactionLogSchema,
);

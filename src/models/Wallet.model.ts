import { Currency } from '@/constants';
import { InferSchemaType, model, Schema } from 'mongoose';

const WalletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: Currency.USD,
      enum: Object.values(Currency),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

WalletSchema.index({ user: 1, currency: 1 }, { unique: true });

export type IWallet = InferSchemaType<typeof WalletSchema>;

export const WalletModel = model<IWallet>('Wallet', WalletSchema);

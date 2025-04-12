import { model, Schema, InferSchemaType } from 'mongoose';

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

UserSchema.index({ username: 1 });

export type IUser = InferSchemaType<typeof UserSchema>;

export const UserModel = model<IUser>('User', UserSchema);

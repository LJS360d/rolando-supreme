import { Document } from 'mongoose';

export class BaseDocument extends Document {
	updatedAt?: NativeDate;
}

import { Schema, model } from 'mongoose';
import { BaseDocument } from './common/base.document.model';

export interface GuildDocument extends BaseDocument {
	name: string;
	replyRate: number;
	storagePath: string;
}

const GuildSchema = new Schema<GuildDocument>({
	id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	replyRate: { type: Number, default: 10 },
	storagePath: { type: String, required: true },
});

export const GuildModel = model<GuildDocument>('Guild', GuildSchema);

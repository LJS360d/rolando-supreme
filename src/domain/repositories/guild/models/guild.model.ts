import { Schema, model, now } from 'mongoose';
import { Language } from '../../../types/languages';
import { BaseDocument } from '../../common/base.document.model';

export interface GuildDocument extends BaseDocument {
	name: string;
	replyRate: number;
	contributed: boolean;
	language: Language;
}

const GuildSchema = new Schema<GuildDocument>({
	id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	replyRate: { type: Number, default: 10 },
	contributed: { type: Boolean, default: false },
	language: { type: String, default: Language.english },
	updatedAt: { type: Date, default: now() },
});

export const GuildModel = model<GuildDocument>('Guild', GuildSchema);

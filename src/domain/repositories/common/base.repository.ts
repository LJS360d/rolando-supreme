import { Model, Document, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
	public entity: Model<T>;

	async getOne(id: string): Promise<T | null> {
		return await this.entity.findOne({ id }).exec();
	}

	async getAll(): Promise<T[]> {
		return await this.entity.find().exec();
	}

	async create(fields: any): Promise<T> {
		return await this.entity.create(fields);
	}

	async update(id: string, fields: UpdateQuery<T>) {
		return await this.entity.updateOne({ id }, fields, { new: true }).exec();
	}

	async delete(id: string) {
		return await this.entity.deleteOne({ id }).exec();
	}
}

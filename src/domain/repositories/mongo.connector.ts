import { Logger } from 'fonzi2';
import mongoose, { Connection } from 'mongoose';

export async function connectMongo(uri: string): Promise<Connection | undefined> {
	const load = Logger.loading('Connecting to MongoDB...');
	try {
		await mongoose.connect(uri, {
			dbName: 'rolando-supreme',
			appName: 'rolando-supreme',
		});
		const db = mongoose.connection;
		load.success('Connected to MongoDB!');
		return db;
	} catch (error) {
		load.fail('Failed to connect to MongoDB!');
		return;
	}
}

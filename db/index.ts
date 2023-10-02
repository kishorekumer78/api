import mongoose from 'mongoose';

const dbUrl = process.env.MONGO_URL || '';

export const connectDb = async () => {
	try {
		const conn = await mongoose.connect(dbUrl);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error: any) {
		console.log(error.message);

		// Exit process with failure
		process.exit(1);
	}
};

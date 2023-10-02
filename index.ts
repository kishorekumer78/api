import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDb } from './db';

// create server
app.listen(process.env.PORT, async () => {
	console.log(`Server running on port ${process.env.PORT}`);
	await connectDb();
});

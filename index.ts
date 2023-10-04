import dotenv from 'dotenv';
dotenv.config();
// cloudinary config
import { v2 as cloudinary } from 'cloudinary';

// cloudinary config
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET
});

import app from './app';
import { connectDb } from './db';
// create server
app.listen(process.env.PORT, async () => {
	console.log(`Server running on port ${process.env.PORT}`);
	await connectDb();
});

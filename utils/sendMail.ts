import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

import { EmailOptions } from './types';

const transporter: Transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: parseInt(process.env.SMTP_PORT || '465'),
	service: process.env.SMTP_SERVICE,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD
	}
});

export const sendMail = async (options: EmailOptions) => {
	const { email, subject, templateFileName, data } = options;

	// get the path of email template
	const templatePath = path.join(__dirname, `../mails`, templateFileName);

	// render the email template with ejs
	const html = await ejs.renderFile(templatePath, data);

	const mailOptions = {
		from: process.env.SMTP_SENDER,
		to: email,
		subject: subject,
		html: html
	};

	await transporter.sendMail(mailOptions);
};

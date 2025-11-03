"use node";

import nodemailer from "nodemailer";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendGoalEmail = action({
    args: {
        email: v.string(),
        subject: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const GMAIL_USER = process.env.GMAIL_USER;
        const GMAIL_PASS = process.env.GMAIL_PASS;

        if (!GMAIL_USER || !GMAIL_PASS) {
            throw new Error("Missing Gmail credentials in environment variables.");
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS, // use app password here
            },
        });

        // Send the email
        const info = await transporter.sendMail({
            from: `"Nutrify" <${GMAIL_USER}>`,
            to: args.email,
            subject: args.subject,
            html: `<p>${args.message}</p>`,
        });

        console.log("✅ Email sent:", info.messageId);
        return info;
    },
});

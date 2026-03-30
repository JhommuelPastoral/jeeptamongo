import nodemailer from "nodemailer";
import isSessionAuth from "@/helpers/isSessionAuth";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const isAuthenticated = await isSessionAuth();
    if (!isAuthenticated) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const { email, subject, message } = await req.json();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"MongoJeep" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background:#0f172a; color:#ffffff; padding:20px; text-align:center;">
              <h1 style="margin:0;">MongoJeep</h1>
              <p style="margin:0; font-size:14px;">Your website has received a new message</p>
            </div>

            <!-- Body -->
            <div style="padding:20px; color:#333;">
              <p><strong>From:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              
              <div style="margin-top:15px; padding:15px; background:#f9fafb; border-radius:8px;">
                <p style="margin:0;">${message}</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
              MongoJeep System • This message was sent from your website
            </div>

          </div>
        </div>
      `,
    });

    return Response.json({ success: true, info });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}
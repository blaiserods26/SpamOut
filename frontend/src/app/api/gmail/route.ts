import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const token = await getToken({ req: req as any });
  if (!token?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken as string });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const response = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
    const messages = response.data.messages || [];

    const emails = await Promise.all(
      messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id as string,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "To", "Date"],
        });
        return msg.data;
      })
    );

    return NextResponse.json({ emails });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error fetching emails" }, { status: 500 });
  }
}

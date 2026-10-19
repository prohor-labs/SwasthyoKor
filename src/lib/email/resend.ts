import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "Swasthyokor <swasthyokor@prohor.dev>";

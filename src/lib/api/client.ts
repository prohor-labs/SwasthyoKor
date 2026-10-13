import axios from "axios";
import https from "node:https";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

const isServer = typeof window === "undefined";
const httpsAgent =
  isServer && API_BASE_URL.startsWith("https://")
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  httpsAgent,
  headers: {
    "Content-Type": "application/json",
  },
});

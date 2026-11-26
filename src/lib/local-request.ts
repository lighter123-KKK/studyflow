export function isLocalPost(request: Request): boolean {
  const host = request.headers.get("host") ?? "";
  const forwardedHost = request.headers.get("x-forwarded-host");
  return /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host) &&
    request.headers.get("origin") === `http://${host}` &&
    (!forwardedHost || forwardedHost === host);
}
import { timingSafeEqual } from "node:crypto";
export function isPresentationPost(request: Request): boolean {
  const origin = process.env.STUDYFLOW_DEMO_ORIGIN?.trim();
  return Boolean(origin?.startsWith("https://") && request.headers.get("origin") === origin);
}

export function isDemoPost(request: Request): boolean {
  const expected = process.env.STUDYFLOW_DEMO_CODE?.trim();
  const provided = request.headers.get("x-studyflow-demo-code");
  if (!isPresentationPost(request) || !expected || !provided) return false;
  const actualBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

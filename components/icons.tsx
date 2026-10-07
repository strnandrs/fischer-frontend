// Shared inline-SVG icon set. Generated from assets/svg/{fischer,fischertechnik}/*.svg (classes inlined as
// attributes; colors = currentColor; stroke width overridable per instance via the strokeWidth prop).
// Social glyphs are simple 24px marks. Names match the `icons` + `social-platforms` datasource values.
import type { CSSProperties } from "react";

const ICONS = {
 "globe": {
  "viewBox": "0 0 44 44",
  "body": "<g><g transform=\"translate(-44.124 29.157) rotate(-60)\"><path d=\"M36,44.2c1.3,1,2.1,2.3,2.3,4c1.3-0.1,2.3-1.9,3.7-1c1.2,1.2,2.8,0.3,4.2-0.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/><path d=\"M29.6,56.3l3.5-3c2.1-0.5,2.7,0.7,4-0.4c0.7-1.6,0-4.1-1.7-4.1l-2.6,0.7l-1.6-1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/><path d=\"M49,56l-3.6-0.7c0.8,2.1,0.5,3.2-1,3.3c-1.8-0.2-3.5-1.2-4.6-2.6c-0.7,1.8-2.1,1.5-2.2,3.4 l0.5,4.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/></g><circle cx=\"22\" cy=\"22\" r=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/></g>"
 },
 "book-open": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(-1.375 -2.375)\"><path d=\"M13.4,15.4h6c2.2,0,4,1.8,4,4v14c0-1.7-1.3-3-3-3h-7V15.4z\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/><path d=\"M33.4,15.4h-6c-2.2,0-4,1.8-4,4v14c0-1.7,1.3-3,3-3h7V15.4z\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/></g>"
 },
 "shopping-cart": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(12 13)\"><circle cx=\"7.2\" cy=\"17.1\" r=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/><circle cx=\"17.2\" cy=\"17.1\" r=\"1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/><path d=\"M0-0.1h3.6L6.1,12c0.2,0.9,0.9,1.5,1.8,1.5h8.8c0.9,0,1.6-0.6,1.8-1.5L20,4.4H4.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\"/></g>"
 },
 "phone": {
  "viewBox": "0 0 44 44",
  "body": "<g><path d=\"M26.3696 10.6746C28.0809 11.0085 29.6536 11.8454 30.8865 13.0783C32.1193 14.3112 32.9563 15.8839 33.2901 17.5951\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,2.29)\"/><path d=\"M26.3696 3.6665C29.925 4.06147 33.2404 5.65361 35.7714 8.1815C38.3025 10.7094 39.8988 14.0228 40.2982 17.5776\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,2.29)\"/><path d=\"M38.5462 31.5588V36.8149C38.5482 37.3028 38.4482 37.7858 38.2528 38.2329C38.0573 38.68 37.7706 39.0813 37.411 39.4112C37.0515 39.741 36.627 39.9922 36.1648 40.1485C35.7025 40.3048 35.2128 40.3629 34.7268 40.3189C29.3355 39.7331 24.1568 37.8909 19.6068 34.9402C15.3736 32.2503 11.7846 28.6612 9.09461 24.428C6.13364 19.8574 4.29097 14.6535 3.71588 9.23795C3.6721 8.75346 3.72968 8.26516 3.88495 7.80414C4.04023 7.34312 4.28979 6.91948 4.61777 6.56019C4.94574 6.20091 5.34493 5.91385 5.78992 5.71729C6.23491 5.52074 6.71595 5.41899 7.20242 5.41853H12.4585C13.3088 5.41016 14.1331 5.71126 14.7778 6.2657C15.4225 6.82013 15.8436 7.59008 15.9626 8.43202C16.1844 10.1141 16.5958 11.7657 17.189 13.3552C17.4247 13.9823 17.4757 14.6638 17.336 15.319C17.1963 15.9742 16.8716 16.5756 16.4006 17.052L14.1755 19.2771C16.6696 23.6634 20.3014 27.2951 24.6877 29.7893L26.9127 27.5642C27.3891 27.0931 27.9905 26.7685 28.6457 26.6288C29.3009 26.489 29.9824 26.54 30.6095 26.7758C32.1991 27.3689 33.8507 27.7803 35.5327 28.0022C36.3838 28.1222 37.1611 28.5509 37.7167 29.2067C38.2723 29.8625 38.5675 30.6996 38.5462 31.5588Z\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,2.29)\"/></g>"
 },
 "phone-call": {
  "viewBox": "0 0 44 44",
  "body": "<path d=\"M24.5,15.5c2,0.4,3.6,2,4,4 M24.5,11.5c4.2,0.5,7.5,3.8,8,7.9 M31.4,27.5v3c0,1.1-0.9,2-2,2 c-0.1,0-0.1,0-0.2,0c-3.1-0.3-6-1.4-8.6-3.1c-2.4-1.5-4.5-3.6-6-6c-1.7-2.6-2.7-5.6-3.1-8.7c-0.1-1.1,0.7-2.1,1.8-2.2 c0.1,0,0.1,0,0.2,0h3c1,0,1.9,0.7,2,1.7c0.1,1,0.4,1.9,0.7,2.8c0.3,0.7,0.1,1.6-0.4,2.1l-1.3,1.3c1.4,2.5,3.5,4.6,6,6l1.3-1.3 c0.6-0.5,1.4-0.7,2.1-0.4c0.9,0.3,1.8,0.6,2.8,0.7C30.7,25.6,31.5,26.4,31.4,27.5z\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
 },
 "users": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(-0.375 -2.37)\"><path d=\"M27.4,33.4v-2c0-2.2-1.8-4-4-4h-8c-2.2,0-4,1.8-4,4v2\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"19.4\" cy=\"19.4\" r=\"4\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M33.4,33.4v-2c0-1.8-1.2-3.4-3-3.9\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M26.4,15.5c2.1,0.5,3.4,2.7,2.9,4.9c-0.4,1.4-1.5,2.5-2.9,2.9\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>"
 },
 "info": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(-5578.438 -370.404)\"><circle cx=\"5600.4\" cy=\"392.4\" r=\"10\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"translate(5589.29 376.702)\"><line x1=\"11.4\" x2=\"11.4\" y1=\"20.1\" y2=\"14.6\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><line x1=\"11.4\" x2=\"11.4\" y1=\"11.4\" y2=\"11.4\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g></g>"
 },
 "arrow-right": {
  "viewBox": "0 0 44 44",
  "body": "<path d=\"M24.8,8.9l-3.5,3.6l7.3,7.1H6.2v5h22.3l-7.2,6.9l3.5,3.6l13-13.1L24.8,8.9z\" fill=\"currentColor\" fill=\"currentColor\"/>"
 },
 "chevron-down": {
  "viewBox": "0 0 44 44",
  "body": "<path d=\"M16,19l6,6l6-6\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,1.25)\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
 },
 "search": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(-33.488 -320.904)\"><circle cx=\"53.1\" cy=\"340.6\" r=\"6.6\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,1.25)\"/><line x1=\"64.5\" x2=\"59.3\" y1=\"351.9\" y2=\"347.3\" stroke-linecap=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,1.25)\"/></g>"
 },
 "user": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(-3.375 -2.375)\"><path d=\"M33.4,33.4v-2c0-2.2-1.8-4-4-4h-8c-2.2,0-4,1.8-4,4v2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,1.25)\"/><circle cx=\"25.4\" cy=\"19.4\" r=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,1.25)\"/></g>"
 },
 "facebook": {
  "viewBox": "0 0 24 24",
  "body": "<path fill=\"currentColor\" d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/>"
 },
 "instagram": {
  "viewBox": "0 0 24 24",
  "body": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"17.5\" cy=\"6.5\" r=\"1.2\" fill=\"currentColor\"/>"
 },
 "youtube": {
  "viewBox": "0 0 24 24",
  "body": "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.3 5 12 5 12 5s-6.3 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.76 2 12 2 12s0 3.24.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.7 19 12 19 12 19s6.3 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.24 22 12 22 12s0-3.24-.4-4.8ZM10 15V9l5.2 3Z\"/>"
 },
 "linkedin": {
  "viewBox": "0 0 24 24",
  "body": "<path fill=\"currentColor\" d=\"M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z\"/>"
 },
 "x": {
  "viewBox": "0 0 24 24",
  "body": "<path fill=\"currentColor\" d=\"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z\"/>"
 },
 "models": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(10 10.195)\"><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M20.2,23.2h-9c-1.6,0-3-1.3-3-3s1.3-3,3-3h9c1.6,0,3,1.3,3,3S21.9,23.2,20.2,23.2z\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21.7,17.6v-4.9c0-0.8-0.7-1.5-1.5-1.5h-1.5c-0.8,0-1.5-0.7-1.5-1.5V8.3c0-0.8-0.7-1.5-1.5-1.5 c0,0,0,0,0,0h-4.5c-0.8,0-1.5,0.7-1.5,1.5v9.4\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.8,11.5L1.3,3.7C0.7,3.1,0.6,2.1,1.1,1.5l0,0C1.7,0.8,2.6,0.6,3.3,1l9.9,5.7\"/><g><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12,20.6c-0.2,0-0.4-0.2-0.4-0.4c0-0.2,0.2-0.4,0.4-0.4\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12,20.6c0.2,0,0.4-0.2,0.4-0.4c0-0.2-0.2-0.4-0.4-0.4\"/></g><g><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15.7,20.6c-0.2,0-0.4-0.2-0.4-0.4c0-0.2,0.2-0.4,0.4-0.4l0,0\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M15.7,20.6c0.2,0,0.4-0.2,0.4-0.4c0-0.2-0.2-0.4-0.4-0.4\"/></g><g><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5,20.6c-0.2,0-0.4-0.2-0.4-0.4c0-0.2,0.2-0.4,0.4-0.4l0,0\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5,20.6c0.2,0,0.4-0.2,0.4-0.4c0-0.2-0.2-0.4-0.4-0.4\"/></g><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.6,5.8V11c1.5,0,2.8,1.2,2.8,2.7c0,1.5-1.2,2.8-2.7,2.8c0,0-0.1,0-0.1,0 c-0.8,0-1.6-0.4-2.1-1\"/></g>"
 },
 "age": {
  "viewBox": "0 0 44 44",
  "body": "<g transform=\"translate(10.353 10.353)\"><g transform=\"translate(0.647 0.647)\"><line fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" x1=\"18.7\" x2=\"18.7\" y1=\"0\" y2=\"6.6\"/><line fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" x1=\"22\" x2=\"15.4\" y1=\"3.3\" y2=\"3.3\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21.4,7.5c1.9,5.8-1.2,12-6.9,13.9s-12-1.2-13.9-6.9s1.2-12,6.9-13.9c2.3-0.8,4.7-0.8,7,0\"/></g><g transform=\"translate(4.194 9.424)\"><g transform=\"translate(0 0.135)\"><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M0,4.4L1.9,0l1.9,4.4\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M0.6,3.4h2.6\"/></g><g transform=\"translate(5.3)\"><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.8,4.4V2.9H2.3\"/><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3.8,3L3.8,3c0,1.7-3.7,2.3-3.8-0.7s3.4-2.6,3.6-1.1\"/></g><g transform=\"translate(11.475 0.087)\"><path fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M2.7,0H0v4.3h2.8\"/><line fill=\"none\" stroke=\"currentColor\" style=\"stroke-width:var(--icon-sw,0.667)\" stroke-linecap=\"round\" stroke-linejoin=\"round\" x1=\"0\" x2=\"1.7\" y1=\"2.1\" y2=\"2.1\"/></g></g></g>"
 }
} as const;

export type IconName = "models" | "age" | "globe" | "book-open" | "shopping-cart" | "phone" | "phone-call" | "users" | "info" | "arrow-right" | "chevron-down" | "search" | "user" | "facebook" | "instagram" | "youtube" | "linkedin" | "x";
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export function Icon({
  name,
  className,
  strokeWidth,
  title,
}: {
  name?: string;
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  const def = name ? (ICONS as Record<string, { viewBox: string; body: string }>)[name] : undefined;
  if (!def) return null;
  const style = strokeWidth != null ? ({ "--icon-sw": strokeWidth } as CSSProperties) : undefined;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={def.viewBox}
      fill="none"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : "") + def.body }}
    />
  );
}

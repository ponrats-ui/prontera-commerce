export const defaultLocale = "en-US";

export const locales = ["en-US", "th-TH", "ja-JP", "en-SG", "vi-VN"] as const;

export type LocaleCode = (typeof locales)[number];

export function isLocaleCode(value: string): value is LocaleCode {
  return locales.includes(value as LocaleCode);
}

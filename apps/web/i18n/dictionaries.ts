import { defaultLocale, isLocaleCode, type LocaleCode } from "./config";

type Messages = typeof import("../messages/en-US.json");

const dictionaries = {
  "en-US": () =>
    import("../messages/en-US.json").then((module) => module.default),
  "th-TH": () =>
    import("../messages/th-TH.json").then((module) => module.default),
  "ja-JP": () =>
    import("../messages/ja-JP.json").then((module) => module.default),
  "en-SG": () =>
    import("../messages/en-SG.json").then((module) => module.default),
  "vi-VN": () =>
    import("../messages/vi-VN.json").then((module) => module.default),
} satisfies Record<LocaleCode, () => Promise<Messages>>;

export async function getDictionary(locale: string): Promise<Messages> {
  const localeCode = isLocaleCode(locale) ? locale : defaultLocale;

  return dictionaries[localeCode]();
}

export const i18n = {
  locales: [
    {
      lang: "rw",
      image: "/assets/images/rwanda.png",
    },
    {
      lang: "sw",
      image: "/assets/images/Tanzania.png",
    },
    {
      lang: "en",
      image: "https://cdn-icons-png.flaticon.com/128/9906/9906532.png",
    },
    {
      lang: "fr",
      image: "https://cdn-icons-png.flaticon.com/128/197/197560.png",
    },
    
  ],
  defaultLocale: "en",
};

export type I18nConfig = typeof i18n;
export type Locale = I18nConfig["locales"][number];

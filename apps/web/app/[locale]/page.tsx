import { notFound } from "next/navigation";
import { getDictionary } from "../../i18n/dictionaries";
import { isLocaleCode, locales } from "../../i18n/config";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocaleCode(locale)) {
    notFound();
  }

  const messages = await getDictionary(locale);

  return (
    <main>
      <h1>{messages.home.title}</h1>
      <p>{messages.home.description}</p>
    </main>
  );
}

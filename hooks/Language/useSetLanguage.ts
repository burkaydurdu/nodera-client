import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/core/locale";

const useSetLanguage = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLanguage = async (locale: Locale) => {
    await setLocale(locale);
    startTransition(() => {
      router.refresh();
    });
  };

  return { setLanguage, isPending };
};

export default useSetLanguage;

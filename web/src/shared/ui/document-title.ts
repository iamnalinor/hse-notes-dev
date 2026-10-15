import { useEffect } from "react";

const SITE = "Конспекты ПИ ФКН";

export const useDocumentTitle = (title: string | undefined): void => {
  useEffect(() => {
    document.title = title === undefined ? SITE : `${title} — ${SITE}`;
  }, [title]);
};

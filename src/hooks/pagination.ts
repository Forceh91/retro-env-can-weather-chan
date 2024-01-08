import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { useEffect, useState } from "react";

export function usePagination(
  maxPages: number,
  onComplete?: () => void,
  displayLength: number = SCREEN_DEFAULT_DISPLAY_LENGTH
) {
  const [page, setPage] = useState(1);

  // page changer
  useEffect(() => {
    setTimeout(() => {
      if (page < maxPages) setPage(page + 1);
      else onComplete ? onComplete() : setPage(1);
    }, displayLength * 1000);
  }, [page]);

  return { page };
}

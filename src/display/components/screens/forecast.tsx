import { useEffect } from "react";
import { AutomaticScreenProps } from "types/screen.types";

type ForecastScreenProps = {};

export function ForecastScreen(props: ForecastScreenProps & AutomaticScreenProps) {
  const { onComplete } = props ?? {};

  useEffect(() => {});
  return <>Screen 1</>;
}

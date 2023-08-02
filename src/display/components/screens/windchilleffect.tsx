import { isWindchillSeason } from "lib/date";
import { useEffect } from "react";
import { AutomaticScreenProps } from "types";

type WindchillEffectScreenProps = {} & AutomaticScreenProps;

export function WindchillEffectScreen(props: WindchillEffectScreenProps) {
  const { onComplete } = props ?? {};

  useEffect(() => {
    console.log("wcs", isWindchillSeason());
    if (!isWindchillSeason()) onComplete();
  }, []);

  if (!isWindchillSeason()) return <></>;

  return (
    <div id="windchill_effects_screen">
      <div>{"".padStart(5)}Effect of Windchill</div>
      <ol>
        <li>
          <span>1350-1600 Uncomfortably Cold</span>
        </li>
        <li>
          <span>1600-1800 Risk of Frostbite</span>
        </li>
        <li>
          <span>1800-2000 Exposed skin freezes</span>
          <br />
          <span>{"".padStart(10)}in a few minutes</span>
        </li>
        <li>
          <span>2000-2300 Exposed skin freezes</span>
          <br />
          <span>{"".padStart(10)}in one minute</span>
        </li>
        <li>
          <span>Over 2300 Hazardous conditions</span>
        </li>
      </ol>
    </div>
  );
}

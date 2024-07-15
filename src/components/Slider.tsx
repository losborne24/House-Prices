import Slider from "@mui/material/Slider";
import { Box, FormControl, FormLabel } from "@mui/material";
import { useEffect, useState } from "react";
import * as _ from "lodash";

function valuetext(value: number) {
  return `${value}`;
}

export default function SimpleSlider({
  label,
  range,
  step,
  value,
  maxValue,
  setValue,
}: {
  label: string;
  step: number;
  value: number;
  range: number[];
  maxValue: number;
  setValue: (option: number) => void;
}) {
  const [marks, setMarks] = useState<{ value: number; label: string }[]>([]);
  const handleChange = (event: Event, newValue: number | number[]): void => {
    if (newValue > maxValue) {
      return setValue(maxValue);
    }
    return setValue(newValue as number);
  };

  useEffect(() => {
    const steps = _.range(range[0], range[1] + step, step);
    setMarks(steps.map((step) => ({ value: step, label: String(step) })));
  }, [range, step]);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Box sx={{ px: 2 }}>
        <Slider
          value={value}
          onChange={handleChange}
          track="inverted"
          defaultValue={range[0]}
          getAriaValueText={valuetext}
          valueLabelDisplay="auto"
          step={step}
          marks={marks}
          min={range[0]}
          max={range[1]}
        />
      </Box>
    </FormControl>
  );
}

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export interface RadioOption {
  label: string;
  value: string;
}

export default function RadioButtons({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: RadioOption[];
  onChange: (option: string) => void;
}) {
  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">{label}</FormLabel>
      <RadioGroup
        aria-labelledby="demo-controlled-radio-buttons-group"
        row
        name="controlled-radio-buttons-group"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.label}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { Checkbox, FormGroup } from "@mui/material";
import * as _ from "lodash";
export interface CheckboxOption {
  label: string;
  value: string;
}

export interface CheckboxSelectionMap {
  [value: string]: boolean;
}

export default function Checkboxes({
  label,
  options,
  selection,
  setSelection,
}: {
  label: string;
  selection: CheckboxSelectionMap;
  options: CheckboxOption[];
  setSelection: (selection: CheckboxSelectionMap) => void;
}) {
  function handleChange(isChecked: boolean, option: CheckboxOption): void {
    if (option.value === "A") {
      return setSelection(
        _.reduce(
          options,
          (acc: CheckboxSelectionMap, option: CheckboxOption) => {
            return { ...acc, [option.value]: isChecked };
          },
          {}
        )
      );
    }
    if (!isChecked) {
      return setSelection({
        ...selection,
        A: false,
        [option.value]: isChecked,
      });
    }
    return setSelection({
      ...selection,
      [option.value]: isChecked,
    });
  }

  return (
    <FormGroup>
      <FormLabel>{label}</FormLabel>
      <div className="flex flex-row">
        {options.map((option) => (
          <FormControlLabel
            key={option.label}
            label={option.label}
            control={
              <Checkbox
                checked={selection[option.value]}
                onChange={(event) => handleChange(event.target.checked, option)}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
          />
        ))}
      </div>
    </FormGroup>
  );
}

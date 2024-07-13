"use client";
import Checkboxes, { CheckboxSelectionMap } from "@/components/Checkboxes";
import RadioButtons from "@/components/RadioButtons";
import { useState } from "react";
import SimpleSlider from "@/components/Slider";
import { Box, Button } from "@mui/material";
import * as _ from "lodash";

export interface PropertyFilters {
  startYear: number;
  isFreehold?: boolean;
  isNewBuild?: boolean;
  propertyTypes?: string[];
}

export default function PropertyForm({
  onSubmit,
}: {
  onSubmit: (filter: PropertyFilters) => void;
}) {
  const [tenure, setTenure] = useState<string>("A");
  const [propertyType, setPropertyType] = useState<CheckboxSelectionMap>({
    A: true,
    D: true,
    S: true,
    T: true,
    F: true,
  });
  const [age, setAge] = useState<string>("A");
  const [year, setYear] = useState<number>(2020);

  const submitHandler = () => {
    const filter: PropertyFilters = { startYear: year };
    if (tenure !== "A") {
      filter.isFreehold = tenure === "F";
    }
    if (age !== "A") {
      filter.isNewBuild = age === "N";
    }
    if (!propertyType.A) {
      filter.propertyTypes = _.keys(_.pickBy(propertyType, (type) => !!type));
      console.log(filter);
    }

    onSubmit(filter);
  };

  return (
    <Box className="flex flex-col items-start justify-between p-8">
      <RadioButtons
        label="Tenure"
        value={tenure}
        options={[
          { label: "All", value: "A" },
          { label: "Freehold", value: "F" },
          { label: "Leasehold", value: "L" },
        ]}
        onChange={setTenure}
      ></RadioButtons>
      <Checkboxes
        label="Property Type"
        selection={propertyType}
        options={[
          { label: "All", value: "A" },
          { label: "Detached", value: "D" },
          { label: "Semi-Detached", value: "S" },
          { label: "Terraced", value: "T" },
          { label: "Flat/Maisonette", value: "F" },
        ]}
        setSelection={setPropertyType}
      />
      <RadioButtons
        label="Property Age"
        value={age}
        options={[
          { label: "All", value: "A" },
          { label: "New Build", value: "N" },
          { label: "Existing Property", value: "E" },
        ]}
        onChange={setAge}
      />
      <SimpleSlider
        label="Year"
        value={year}
        setValue={setYear}
        maxValue={2023}
        step={1}
        range={[2020, 2024]}
      />{" "}
      <Button onClick={submitHandler}>Submit</Button>
    </Box>
  );
}

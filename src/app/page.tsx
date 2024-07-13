"use client";
import MapboxExample from "@/containers/MapboxExample";
import PropertyForm, { PropertyFilters } from "@/containers/PropertyForm";
import { useState } from "react";

export default function Home() {
  const postcodesGeoJson: Record<
    string,
    any[]
  > = require("../data/postcodes.json");
  const dataSet = require("../data/dataset.json");
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({
    startYear: 2020,
  });
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <PropertyForm onSubmit={setPropertyFilters} />
      <MapboxExample
        propertyFilters={propertyFilters}
        dataSet={dataSet}
        postcodesGeoJson={postcodesGeoJson}
      />
    </main>
  );
}

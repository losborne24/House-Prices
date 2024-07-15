"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PropertyFilters } from "./PropertyForm";
import * as _ from "lodash";

mapboxgl.accessToken =
  "pk.eyJ1IjoibG9zYm9ybmUyNCIsImEiOiJja2JobXZydTkwNncwMndtYmtmeGV6azc3In0.sNYGeQl6T7kSY9x3sij6Ww";

export interface Property {
  price: number;
  year: string;
  propertyType: string;
  isNewBuild: boolean;
  isFreehold: boolean;
}

const MapboxExample = ({
  postcodesGeoJson,
  dataSet,
  propertyFilters,
}: {
  postcodesGeoJson: any;
  dataSet: Record<string, Property[]>;
  propertyFilters: PropertyFilters;
}) => {
  const mapContainerRef = useRef<any>();
  const mapRef = useRef<any>();
  const [postcodeProps, setPostcodeProps] = useState<Property | undefined>(
    undefined
  );

  useEffect(() => {
    if (!mapRef.current?.getSource("states")) return;
    const priceMap = getPriceMap();
    const newGeoJson = {
      ...postcodesGeoJson,
      features: _.map(postcodesGeoJson.features, (feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          volume: priceMap[feature.properties.name]?.volume,
          price: priceMap[feature.properties.name]?.price,
        },
      })),
    };
    mapRef.current.getSource("states").setData(newGeoJson);
  }, [propertyFilters]);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v12",
      center: [1.89, 52.4823],
      zoom: 6,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    let hoveredPolygonId: string | null = null;

    mapRef.current.on("load", () => {
      mapRef.current.addSource("states", {
        type: "geojson",
        data: postcodesGeoJson,
        generateId: true,
      });
      const color = [
        "interpolate",
        ["linear"],
        ["coalesce", ["get", "price"], 0],
        0,
        "#fbe6c5",
        200000,
        "#f5ba98",
        300000,
        "#ee8a82",
        500000,
        "#dc7176",
        800000,
        "#c8586c",
        1300000,
        "#9c3f5d",
        2100000,
        "#70284a",
      ];
      // The feature-state dependent fill-opacity expression will render the hover effect
      // when a feature's hover state is set to true.
      mapRef.current.addLayer({
        id: "state-fills",
        type: "fill",
        source: "states",
        layout: {},
        paint: {
          "default-fill-color": "#eee",
          "fill-color": color,
          "fill-opacity": [
            "case",
            ["==", ["coalesce", ["get", "price"], 0], 0],
            0,
            ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.75],
          ],
        },
      });

      mapRef.current.addLayer({
        id: "state-borders",
        type: "line",
        source: "states",
        layout: {},
        paint: {
          "line-color": color,
          "line-width": 2,
          "line-opacity": [
            "case",
            ["==", ["coalesce", ["get", "price"], 0], 0],
            0,
            1,
          ],
        },
      });

      mapRef.current.on("mousemove", "state-fills", (e: any) => {
        if (e.features.length > 0) {
          if (hoveredPolygonId !== null) {
            mapRef.current.setFeatureState(
              { source: "states", id: hoveredPolygonId },
              { hover: false }
            );
          }
          hoveredPolygonId = e.features[0].id;
          mapRef.current.setFeatureState(
            { source: "states", id: hoveredPolygonId },
            { hover: true }
          );
          setPostcodeProps(e.features[0].properties);
        }
      });

      mapRef.current.on("mouseleave", "state-fills", () => {
        if (hoveredPolygonId !== null) {
          mapRef.current.setFeatureState(
            { source: "states", id: hoveredPolygonId },
            { hover: false }
          );
        }
        hoveredPolygonId = null;
      });
      //---
      mapRef.current.addLayer({
        id: "poi-labels",
        type: "symbol",
        source: "states",
        minzoom: 8,
        layout: {
          "text-field": [
            "let",
            "price",
            [
              "slice",
              [
                "number-format",
                ["get", "price"],
                {
                  currency: "GBP",
                },
              ],
              0,
              -7,
            ],
            [
              "case",
              ["==", ["var", "price"], ""],
              "",
              ["concat", ["var", "price"], "K"],
            ],
          ],
          "text-size": 11,
        },
      });
    });
  }, []);

  const getPriceMap = (): Record<string, { volume: number; price: number }> => {
    const priceMap = getPropertyPricesFromFilters();

    return _.reduce(
      priceMap,
      (acc, properties, postcode) => {
        const sum = properties.reduce((a, b) => a + b, 0);
        const volume = properties.length;
        const price = volume
          ? Math.round(Math.round(sum / volume) / 1000) * 1000
          : 0;
        return { ...acc, [postcode]: { volume, price } };
      },
      {}
    );
  };

  const getPropertyPricesFromFilters = (): Record<string, number[]> => {
    return _.mapValues(dataSet, (properties) =>
      _.filter(properties, (property) => {
        if (_.has(propertyFilters, "isFreehold")) {
          if (property.isFreehold !== propertyFilters.isFreehold) {
            return false;
          }
        }
        if (_.has(propertyFilters, "isNewBuild")) {
          if (property.isNewBuild !== propertyFilters.isNewBuild) {
            return false;
          }
        }

        if (_.has(propertyFilters, "propertyTypes")) {
          if (!propertyFilters.propertyTypes?.includes(property.propertyType)) {
            return false;
          }
        }
        if (propertyFilters.startYear > Number(property.year)) {
          return false;
        }
        return true;
      }).map((properties) => properties.price)
    );
  };

  return (
    <div
      className="flex-grow"
      style={{ position: "relative", height: "100%", width: "100%" }}
    >
      <div
        id="map"
        ref={mapContainerRef}
        style={{ height: "500px", width: "100%" }}
      />
      <div
        style={{
          position: "absolute",
          height: "100px",
          width: "300px",
          top: "20px",
          right: "20px",
          backgroundColor: "white",
        }}
      >
        {JSON.stringify(postcodeProps)}
        {/* Average: {avgPrice} */}
        <br></br>
        {/* Volume: {volume} */}
        <br></br>
        {/* {description} */}
      </div>
    </div>
  );
};

export default MapboxExample;

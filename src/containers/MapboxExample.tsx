"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { PropertyFilters } from "./PropertyForm";
import * as _ from "lodash";

mapboxgl.accessToken =
  "pk.eyJ1IjoibG9zYm9ybmUyNCIsImEiOiJja2JobXZydTkwNncwMndtYmtmeGV6azc3In0.sNYGeQl6T7kSY9x3sij6Ww";
const GBP = new Intl.NumberFormat("en-gb", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
});

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
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("test");
  const [avgPrice, setAvgPrice] = useState<string>("0");
  const [volume, setVolume] = useState<number>(0);

  useEffect(() => {
    const data: Property[] = getPropertiesFromFilters();
    const priceArr = (data || []).map((d) => d.price);
    const sum = priceArr.reduce((a, b) => a + b, 0);
    const priceArrLength = priceArr.length;
    setVolume(priceArrLength || 0);
    setAvgPrice(
      GBP.format(
        priceArrLength
          ? Math.ceil(Math.round(sum / priceArrLength) / 1000) * 1000
          : 0
      )
    );
  }, [name, propertyFilters]);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-100.486052, 37.830348],
      zoom: 2,
    });

    let hoveredPolygonId = null;

    mapRef.current.on("load", () => {
      mapRef.current.addSource("states", {
        type: "geojson",
        data: postcodesGeoJson,
        generateId: true,
      });

      // The feature-state dependent fill-opacity expression will render the hover effect
      // when a feature's hover state is set to true.
      mapRef.current.addLayer({
        id: "state-fills",
        type: "fill",
        source: "states",
        layout: {},
        paint: {
          "fill-color": "#627BC1",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.5,
          ],
        },
      });

      mapRef.current.addLayer({
        id: "state-borders",
        type: "line",
        source: "states",
        layout: {},
        paint: {
          "line-color": "#627BC1",
          "line-width": 2,
        },
      });

      mapRef.current.on("mousemove", "state-fills", (e) => {
        if (e.features.length > 0) {
          if (hoveredPolygonId !== null) {
            mapRef.current.setFeatureState(
              { source: "states", id: hoveredPolygonId },
              { hover: false }
            );
          }
          hoveredPolygonId = e.features[0].id;
          setName(e.features[0].properties.name);
          setDescription(e.features[0].properties.description);
          mapRef.current.setFeatureState(
            { source: "states", id: hoveredPolygonId },
            { hover: true }
          );
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
      // mapRef.current.addLayer({
      //   id: "poi-labels",
      //   type: "symbol",
      //   source: "states",
      //   layout: {
      //     "text-field": ["get", "name"],
      //     "text-variable-anchor": ["top", "bottom", "left", "right"],
      //     "text-radial-offset": 0.5,
      //     "text-justify": "auto",
      //   },
      // });

      // mapRef.current.setFilter("state-fills", [
      //   "in",
      //   "AB",
      //   ["string", ["get", "name"]],
      // ]);
    });
  }, []);

  const getPropertiesFromFilters = () => {
    return _.filter(dataSet[name], (property) => {
      if (_.has(propertyFilters, "isFreehold")) {
        if (property.isFreehold !== propertyFilters.isFreehold) {
          return false;
        }
      }
      if (_.has(propertyFilters, "isNewBuild")) {
        console.log({
          data: property.isNewBuild,
          filter: propertyFilters.isNewBuild,
        });
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
    });
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
        Average: {avgPrice}
        <br></br>
        Volume: {volume}
        <br></br>
        {description}
      </div>
    </div>
  );
};

export default MapboxExample;

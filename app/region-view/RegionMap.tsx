"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Region {
  region: string;
  country: string;
  lat: number;
  lng: number;
  revenue: number;
  spend: number;
}

export default function RegionMap({
  regional_performance,
}: {
  regional_performance: Region[];
}) {
  return (
    <MapContainer
      center={[25, 50]} // Middle East center
      zoom={5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {regional_performance.map((region, idx) => (
        <CircleMarker
          key={idx}
          center={[region.lat, region.lng]}
          radius={Math.sqrt(region.revenue) / 20} // Bigger revenue = bigger circle
          pathOptions={{ color: "red", weight: 1, fillOpacity: 0.6 }}
        >
          <Tooltip direction="top">
            <div className="text-sm">
              <strong>{region.region}</strong> ({region.country})
              <br />
              Revenue: ${region.revenue.toLocaleString()}
              <br />
              Spend: ${region.spend.toLocaleString()}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

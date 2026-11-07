import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import type { LatLngExpression, LeafletMouseEvent } from "leaflet";

import "leaflet/dist/leaflet.css";
import "./BranchLocationPicker.css";

export interface BranchLocation {
  latitude: number;
  longitude: number;
}

interface BranchLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (location: BranchLocation) => void;
}

const DEFAULT_CENTER: [number, number] = [35.6892, 51.389];

const locationIcon = L.divIcon({
  className: "branch-location-marker",
  html: '<div class="branch-location-marker-inner"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function MapEvents({
  onChange,
}: {
  onChange: (location: BranchLocation) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function MapCenterUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center[0], center[1], zoom]);

  return null;
}

export function BranchLocationPicker({
  latitude,
  longitude,
  onChange,
}: BranchLocationPickerProps) {
  const hasLocation =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const center: [number, number] = hasLocation
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  const position: LatLngExpression | null = hasLocation
    ? [latitude, longitude]
    : null;

  const handleChange = (lat: number, lng: number) => {
    onChange({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            موقعیت شعبه روی نقشه
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            برای انتخاب موقعیت روی نقشه کلیک کن یا نشانگر را جابه‌جا کن.
          </p>
        </div>
      </div>

      <div className="branch-location-map overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={center}
          zoom={hasLocation ? 15 : 6}
          scrollWheelZoom
          className="h-[380px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenterUpdater center={center} zoom={hasLocation ? 15 : 6} />

          <MapEvents onChange={onChange} />

          {position && (
            <Marker
              position={position}
              icon={locationIcon}
              draggable
              eventHandlers={{
                dragend(event) {
                  const marker = event.target;
                  const location = marker.getLatLng();

                  handleChange(location.lat, location.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="text-xs text-gray-500">
            عرض جغرافیایی (Latitude)
          </span>

          <p
            className="mt-1 font-mono text-sm font-semibold text-gray-800"
            dir="ltr"
          >
            {latitude !== null ? latitude.toFixed(6) : "انتخاب نشده"}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <span className="text-xs text-gray-500">
            طول جغرافیایی (Longitude)
          </span>

          <p
            className="mt-1 font-mono text-sm font-semibold text-gray-800"
            dir="ltr"
          >
            {longitude !== null ? longitude.toFixed(6) : "انتخاب نشده"}
          </p>
        </div>
      </div>

      {!hasLocation && (
        <p className="text-xs text-amber-600">
          هنوز موقعیت این شعبه انتخاب نشده است.
        </p>
      )}
    </div>
  );
}

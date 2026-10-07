import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getCitiesByProvince,
  getProvinces,
} from "@/services/locations.api";

interface LocationSelectorProps {
  provinceId: number | null;
  cityId: number | null;
  onProvinceChange: (provinceId: number | null) => void;
  onCityChange: (cityId: number | null) => void;
}

export default function LocationSelector({
  provinceId,
  cityId,
  onProvinceChange,
  onCityChange,
}: LocationSelectorProps) {
  const provincesQuery = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
  });

  const citiesQuery = useQuery({
    queryKey: ["cities", provinceId],
    queryFn: () => getCitiesByProvince(provinceId!),
    enabled: provinceId !== null,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Province */}
      <div className="space-y-2">
        <Label>استان</Label>

        <Select
          value={provinceId ? String(provinceId) : ""}
          onValueChange={(value) => {
            const id = Number(value);

            onProvinceChange(id);
            onCityChange(null);
          }}
          disabled={provincesQuery.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="استان را انتخاب کنید" />
          </SelectTrigger>

          <SelectContent>
            {provincesQuery.data?.map((province) => (
              <SelectItem
                key={province.id}
                value={String(province.id)}
              >
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {provincesQuery.isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            در حال دریافت استان‌ها...
          </div>
        )}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>شهر</Label>

        <Select
          value={cityId ? String(cityId) : ""}
          onValueChange={(value) => {
            onCityChange(Number(value));
          }}
          disabled={
            provinceId === null ||
            citiesQuery.isLoading
          }
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                provinceId
                  ? "شهر را انتخاب کنید"
                  : "ابتدا استان را انتخاب کنید"
              }
            />
          </SelectTrigger>

          <SelectContent>
            {citiesQuery.data?.map((city) => (
              <SelectItem
                key={city.id}
                value={String(city.id)}
              >
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {citiesQuery.isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            در حال دریافت شهرها...
          </div>
        )}
      </div>
    </div>
  );
}

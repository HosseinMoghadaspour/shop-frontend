import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getAdminBranchOptions,
  getAdminWarehouses,
  saveAdminBranch,
} from "@/services/branches.api";
import { getProvinces, getCitiesByProvince } from "@/services/locations.api";
import { BranchLocationPicker } from "../components/BranchLocationPicker";

export function AdminBranchesPage() {
  const options = useQuery({
    queryKey: ["admin-branch-options"],
    queryFn: getAdminBranchOptions,
  });
  const warehouses = useQuery({
    queryKey: ["admin-warehouses"],
    queryFn: getAdminWarehouses,
  });
  const provinces = useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
  });

  const [branchId, setBranchId] = useState(0);
  const [provinceId, setProvinceId] = useState(0);
  const [cityId, setCityId] = useState(0);
  const [priceTypeId, setPriceTypeId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [active, setActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const branches = Array.from(
    new Map((options.data ?? []).map((item) => [item.branchId, item])).values(),
  );
  const selectedBranch = branches.find((item) => item.branchId === branchId);

  const cities = useQuery({
    queryKey: ["admin-cities", provinceId],
    queryFn: () => getCitiesByProvince(provinceId),
    enabled: provinceId > 0,
  });

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0].branchId);
    }
  }, [branches, branchId]);

  useEffect(() => {
    if (!selectedBranch) {
      setCityId(0);
      setProvinceId(0);
      setPriceTypeId("");
      setWarehouseId("");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setActive(true);
      setIsDefault(false);
      return;
    }

    setCityId(selectedBranch.cityId ?? 0);
    setProvinceId(selectedBranch.provinceId ?? 0);
    setPriceTypeId(
      selectedBranch.salePriceTypeId == null
        ? ""
        : String(selectedBranch.salePriceTypeId),
    );
    setWarehouseId(
      selectedBranch.warehouseId == null
        ? ""
        : String(selectedBranch.warehouseId),
    );
    setAddress(selectedBranch.description ?? "");
    setLatitude(
      selectedBranch.latitude == null ? "" : String(selectedBranch.latitude),
    );
    setLongitude(
      selectedBranch.longitude == null ? "" : String(selectedBranch.longitude),
    );
    setActive(selectedBranch.isActive ?? true);
    setIsDefault(selectedBranch.isDefault ?? false);
  }, [selectedBranch]);

  async function save() {
    setError("");
    setMessage("");

    if (!branchId || !cityId) {
      setMessage("شعبه و شهر را انتخاب کنید.");
      return;
    }
    if (!warehouseId) {
      setMessage("برای هر شعبه باید یک انبار فعال انتخاب کنید.");
      return;
    }

    const lat = latitude.trim() ? Number(latitude) : null;
    const lng = longitude.trim() ? Number(longitude) : null;

    if ((lat === null) !== (lng === null)) {
      setMessage("موقعیت شعبه را به‌طور کامل انتخاب کنید.");
      return;
    }

    if (
      lat !== null &&
      lng !== null &&
      (!Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180)
    ) {
      setMessage("مختصات جغرافیایی معتبر نیست.");
      return;
    }

    try {
      await saveAdminBranch(branchId, {
        cityId,
        salePriceTypeId: priceTypeId ? Number(priceTypeId) : null,
        warehouseId: warehouseId ? Number(warehouseId) : null,
        address,
        latitude: lat,
        longitude: lng,
        isActive: active,
        isDefault,
      });
      setMessage("تنظیمات شعبه ذخیره شد.");
      await options.refetch();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ذخیره تنظیمات ناموفق بود.",
      );
    }
  }

  return (
    <section dir="rtl" className="space-y-5 p-5">
      <h1 className="text-2xl font-black">مدیریت شعب فروشگاه</h1>
      <p className="text-sm text-muted-foreground">
        اطلاعات شعبه، شهر، انبار اختصاصی، آدرس و موقعیت جغرافیایی را مدیریت کنید.
      </p>

      {options.isLoading ? (
        <p>در حال دریافت اطلاعات...</p>
      ) : options.isError ? (
        <p className="text-sm text-rose-700">
          دریافت اطلاعات شعب ناموفق بود.
        </p>
      ) : (
        <div className="space-y-4 rounded-2xl border bg-white p-5">
          <label className="block space-y-2 text-sm">
            شعبه
            <select
              className="w-full rounded-lg border p-2"
              value={branchId || ""}
              onChange={(event) => setBranchId(Number(event.target.value))}
            >
              <option value="">انتخاب شعبه</option>
              {branches.map((item) => (
                <option key={item.branchId} value={item.branchId}>
                  {item.branchName}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm">
            انبار فعال شعبه
            <select
              className="w-full rounded-lg border p-2"
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              disabled={warehouses.isLoading}
            >
              <option value="">انتخاب انبار</option>
              {warehouses.data?.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              انبار انتخاب‌شده مبنای اطلاعات موجودی این شعبه خواهد بود.
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              استان
              <select
                className="w-full rounded-lg border p-2"
                value={provinceId || ""}
                onChange={(event) => {
                  setProvinceId(Number(event.target.value));
                  setCityId(0);
                }}
              >
                <option value="">انتخاب استان</option>
                {provinces.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              شهر
              <select
                className="w-full rounded-lg border p-2"
                value={cityId || ""}
                onChange={(event) => setCityId(Number(event.target.value))}
                disabled={!provinceId}
              >
                <option value="">انتخاب شهر</option>
                {cities.data?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2 text-sm">
            آدرس شعبه
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="آدرس کامل شعبه را وارد کنید"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span className="text-xs text-muted-foreground">
              حداکثر ۵۰۰ کاراکتر؛ آدرس در ستون RowDesc جدول Branch ذخیره می‌شود.
            </span>
          </label>

          <BranchLocationPicker
            latitude={latitude.trim() ? Number(latitude) : null}
            longitude={longitude.trim() ? Number(longitude) : null}
            onChange={(location) => {
              setLatitude(String(location.latitude));
              setLongitude(String(location.longitude));
            }}
          />

          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
              فعال در فروشگاه
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(event) => setIsDefault(event.target.checked)}
              />
              شعبه پیش‌فرض شهر
            </label>
          </div>

          {error && <p className="text-sm text-rose-700">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}

          <Button
            onClick={() => void save()}
            disabled={!branchId || warehouses.isLoading || !warehouseId}
          >
            ذخیره تنظیمات
          </Button>
        </div>
      )}
    </section>
  );
}

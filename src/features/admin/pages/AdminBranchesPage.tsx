import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminBranchOptions, saveAdminBranch } from "@/services/branches.api";
import { getProvinces, getCitiesByProvince } from "@/services/locations.api";

export function AdminBranchesPage() {
  const options = useQuery({ queryKey: ["admin-branch-options"], queryFn: getAdminBranchOptions });
  const provinces = useQuery({ queryKey: ["provinces"], queryFn: getProvinces });
  const [branchId, setBranchId] = useState(0);
  const [warehouseId, setWarehouseId] = useState(0);
  const [provinceId, setProvinceId] = useState(0);
  const [cityId, setCityId] = useState(0);
  const [priceTypeId, setPriceTypeId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [active, setActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [message, setMessage] = useState("");

  const branches = Array.from(new Map((options.data ?? []).map((x) => [x.branchId, x])).values());
  const warehouses = (options.data ?? []).filter((x) => x.branchId === branchId);
  const cities = useQuery({
    queryKey: ["admin-cities", provinceId],
    queryFn: () => getCitiesByProvince(provinceId),
    enabled: provinceId > 0,
  });

  useEffect(() => {
    if (!branchId && branches.length) setBranchId(branches[0].branchId);
  }, [branches, branchId]);

  useEffect(() => {
    const saved = warehouses.find((x) => x.cityId !== null) ?? warehouses[0];
    if (!saved) return;
    setWarehouseId(saved.warehouseId);
    setCityId(saved.cityId ?? 0);
    setPriceTypeId(saved.salePriceTypeId == null ? "" : String(saved.salePriceTypeId));
    setLatitude(saved.latitude == null ? "" : String(saved.latitude));
    setLongitude(saved.longitude == null ? "" : String(saved.longitude));
    setActive(saved.isActive ?? true);
    setIsDefault(saved.isDefault ?? false);
  }, [branchId, options.data]);

  async function save() {
    if (!branchId || !warehouseId || !cityId) {
      setMessage("شعبه، انبار و شهر را انتخاب کنید.");
      return;
    }
    const lat = latitude.trim() ? Number(latitude) : null;
    const lng = longitude.trim() ? Number(longitude) : null;
    if ((lat === null) !== (lng === null)) {
      setMessage("هر دو مختصات را وارد کنید.");
      return;
    }
    await saveAdminBranch(branchId, {
      cityId, warehouseId,
      salePriceTypeId: priceTypeId ? Number(priceTypeId) : null,
      latitude: lat, longitude: lng,
      isActive: active, isDefault,
    });
    setMessage("تنظیمات ذخیره شد.");
    await options.refetch();
  }

  return (
    <section dir="rtl" className="space-y-5 p-5">
      <h1 className="text-2xl font-black">مدیریت شعب فروشگاه</h1>
      <p className="text-sm text-muted-foreground">برای هر شعبه، شهر، انبار، نوع قیمت و مختصات جغرافیایی را مشخص کنید.</p>
      {options.isLoading ? <p>در حال دریافت اطلاعات...</p> : (
        <div className="space-y-4 rounded-2xl border bg-white p-5">
          <label className="block space-y-2 text-sm">شعبه
            <select className="w-full rounded-lg border p-2" value={branchId || ""} onChange={(e) => setBranchId(Number(e.target.value))}>
              <option value="">انتخاب شعبه</option>
              {branches.map((x) => <option key={x.branchId} value={x.branchId}>{x.branchName}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-sm">انبار
            <select className="w-full rounded-lg border p-2" value={warehouseId || ""} onChange={(e) => setWarehouseId(Number(e.target.value))}>
              <option value="">انتخاب انبار</option>
              {warehouses.map((x) => <option key={x.warehouseId} value={x.warehouseId}>{x.warehouseName}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm">استان
              <select className="w-full rounded-lg border p-2" value={provinceId || ""} onChange={(e) => { setProvinceId(Number(e.target.value)); setCityId(0); }}>
                <option value="">انتخاب استان</option>
                {provinces.data?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm">شهر
              <select className="w-full rounded-lg border p-2" value={cityId || ""} onChange={(e) => setCityId(Number(e.target.value))}>
                <option value="">انتخاب شهر</option>
                {cities.data?.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input value={priceTypeId} onChange={(e) => setPriceTypeId(e.target.value)} placeholder="شناسه نوع قیمت" />
            <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" dir="ltr" />
            <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" dir="ltr" />
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> فعال در فروشگاه</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> شعبه پیش‌فرض شهر</label>
          </div>
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          <Button onClick={() => void save()}>ذخیره تنظیمات</Button>
        </div>
      )}
    </section>
  );
}

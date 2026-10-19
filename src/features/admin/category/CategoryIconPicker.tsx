
import { useMemo, useState } from "react";
import {
  Folder,
  ShoppingBag,
  Shirt,
  Smartphone,
  Laptop,
  Monitor,
  Headphones,
  Watch,
  Camera,
  Gamepad2,
  BookOpen,
  Coffee,
  Utensils,
  Armchair,
  Lamp,
  Car,
  Bike,
  Baby,
  Heart,
  PawPrint,
  Search,
  Check,
} from "lucide-react";

const iconMap = {
  folder: Folder,
  "shopping-bag": ShoppingBag,
  shirt: Shirt,
  smartphone: Smartphone,
  laptop: Laptop,
  monitor: Monitor,
  headphones: Headphones,
  watch: Watch,
  camera: Camera,
  "gamepad-2": Gamepad2,
  "book-open": BookOpen,
  coffee: Coffee,
  utensils: Utensils,
  armchair: Armchair,
  lamp: Lamp,
  car: Car,
  bike: Bike,
  baby: Baby,
  heart: Heart,
  "paw-print": PawPrint,
} as const;

type IconName = keyof typeof iconMap;

type Props = {
  value: string;
  onChange: (value: IconName) => void;
};

export function CategoryIconPicker({
  value,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");

  const icons = useMemo(
    () =>
      Object.entries(iconMap).filter(([name]) =>
        name.includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="space-y-3" dir="rtl">
      <label className="block text-sm font-medium">
        آیکون دسته‌بندی
      </label>

      <div className="relative">
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="جست‌وجوی آیکون..."
          className="w-full rounded-lg border py-2 pr-10 pl-3"
        />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {icons.map(([name, Icon]) => {
          const selected = value === name;

          return (
            <button
              key={name}
              type="button"
              title={name}
              aria-label={`انتخاب آیکون ${name}`}
              aria-pressed={selected}
              onClick={() => onChange(name as IconName)}
              className={`relative flex min-h-20 flex-col
                items-center justify-center gap-2 rounded-lg
                border p-2 transition
                ${
                  selected
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
            >
              <Icon size={24} />
              <span className="text-xs">{name}</span>

              {selected && (
                <Check
                  size={14}
                  className="absolute left-1 top-1"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

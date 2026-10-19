
import { useState } from "react";
import { CategoryIconPicker } from "../category/CategoryIconPicker";

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  parentId: string | null;
  isActive: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
};

type Props = {
  initialValues?: Partial<CategoryFormValues>;
  categories: CategoryOption[];
  editingId?: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export function CategoryForm({
  initialValues,
  categories,
  editingId,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<CategoryFormValues>({
    name: initialValues?.name ?? "",
    slug: initialValues?.slug ?? "",
    description: initialValues?.description ?? "",
    icon: initialValues?.icon ?? "folder",
    parentId: initialValues?.parentId ?? null,
    isActive: initialValues?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSubmit(values);
    } catch {
      setError("ذخیره دسته‌بندی انجام نشد. دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
      <div>
        <label className="mb-1 block text-sm">نام دسته‌بندی</label>
        <input
          required
          minLength={2}
          maxLength={100}
          value={values.name}
          onChange={(e) =>
            setValues((v) => ({ ...v, name: e.target.value }))
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">شناسه URL (slug)</label>
        <input
          required
          value={values.slug}
          onChange={(e) =>
            setValues((v) => ({ ...v, slug: e.target.value }))
          }
          placeholder="mobile-accessories"
          dir="ltr"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm">دسته‌بندی والد</label>
        <select
          value={values.parentId ?? ""}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              parentId: e.target.value || null,
            }))
          }
          className="w-full rounded-lg border p-3"
        >
          <option value="">بدون والد (دسته اصلی)</option>
          {categories
            .filter((category) => category.id !== editingId)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm">توضیحات</label>
        <textarea
          maxLength={500}
          value={values.description}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              description: e.target.value,
            }))
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      <CategoryIconPicker
        value={values.icon}
        onChange={(icon) =>
          setValues((v) => ({ ...v, icon }))
        }
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              isActive: e.target.checked,
            }))
          }
        />
        دسته‌بندی فعال باشد
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-purple-600 p-3
          text-white disabled:opacity-50"
      >
        {saving
          ? "در حال ذخیره..."
          : editingId
            ? "ذخیره تغییرات"
            : "ایجاد دسته‌بندی"}
      </button>
    </form>
  );
}

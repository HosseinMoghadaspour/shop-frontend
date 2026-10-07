import { Check, MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { DeliveryAddress } from "@/services/addresses.api";

interface AddressSelectorProps {
  addresses?: DeliveryAddress[];
  selectedAddressId: number | null;
  isLoading?: boolean;
  onSelect: (address: DeliveryAddress) => void;
  onNewAddress: () => void;
}

export default function AddressSelector({
  addresses,
  selectedAddressId,
  isLoading = false,
  onSelect,
  onNewAddress,
}: AddressSelectorProps) {
  const activeAddresses =
    addresses?.filter((address) => address.isActive) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            آدرس تحویل
          </CardTitle>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNewAddress}
          >
            <Plus className="ml-2 h-4 w-4" />
            آدرس جدید
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : !addresses || activeAddresses.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <p className="font-medium">هنوز آدرسی ثبت نکرده‌اید</p>

            <p className="mt-1 text-sm text-muted-foreground">
              برای ادامه سفارش یک آدرس جدید وارد کنید.
            </p>

            <Button type="button" className="mt-4" onClick={onNewAddress}>
              <Plus className="ml-2 h-4 w-4" />
              افزودن آدرس
            </Button>
          </div>
        ) : (
          activeAddresses.map((address) => {
            const selected = selectedAddressId === address.id;

            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address)}
                className={[
                  "w-full rounded-lg border p-4 text-right transition",
                  "hover:border-primary/60 hover:bg-muted/30",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground",
                    ].join(" ")}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold">
                        {address.recipient.name || "تحویل‌گیرنده"}
                      </span>

                      {address.recipient.mobile && (
                        <span
                          className="text-sm text-muted-foreground"
                          dir="ltr"
                        >
                          {address.recipient.mobile}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        {address.province?.name && (
                          <>
                            {address.province.name}
                            {"، "}
                          </>
                        )}

                        {address.county?.name && (
                          <>
                            {address.county.name}
                            {"، "}
                          </>
                        )}

                        {address.city?.name}
                      </p>

                      {address.address && (
                        <p className="mt-1 line-clamp-2">{address.address}</p>
                      )}

                      {address.postalCode && (
                        <p className="mt-1">
                          کد پستی: <span dir="ltr">{address.postalCode}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

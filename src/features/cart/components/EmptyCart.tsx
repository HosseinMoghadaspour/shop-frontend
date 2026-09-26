import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card , CardContent } from "@/components/ui/card";

export function EmptyCart() {
    const navigate = useNavigate();

    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingCart className="mb-4 size-16 text-muted-foreground" />

                <h2 className="text-xl font-semibold">
                    سبد خرید شما خالی است
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    هنوز محصولی به سبد خرید اضاف نکرده‌اید.
                </p>
                <Button
                    className="mt-6"
                    onClick={()=> navigate("/products")}
                >
                    مشاهده محصولات
                </Button>
            </CardContent>
        </Card>
    );
}

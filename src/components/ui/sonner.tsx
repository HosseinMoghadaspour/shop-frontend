import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      dir="rtl"
      position="top-center"
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "font-sans shadow-lg",
          title: "font-semibold",
          description: "text-sm leading-6",
        },
      }}
      {...props}
    />
  );
}

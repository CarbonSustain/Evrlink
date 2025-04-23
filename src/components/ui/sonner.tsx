import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-gray-800 group-[.toaster]:text-gray-900 group-[.toaster]:dark:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-600 group-[.toast]:dark:text-gray-300",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-200 group-[.toast]:text-gray-900 group-[.toast]:dark:bg-gray-700 group-[.toast]:dark:text-white",
          success: "group-[.toast]:!bg-green-500 group-[.toast]:text-white",
          error: "group-[.toast]:!bg-red-500 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

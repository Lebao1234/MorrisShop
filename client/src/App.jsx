import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import router from "@/routes";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/common";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

export const App = () => {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const [ready, setReady] = useState(false);

  // Khoi phuc phien dang nhap tu httpOnly refresh cookie truoc khi render router
  useEffect(() => {
    bootstrap().finally(() => setReady(true));
  }, [bootstrap]);

  if (!ready && !isBootstrapped) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bone">
        <PageLoader />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "!bg-white !border !border-ink/10 !shadow-ambient !rounded-md !font-sans !text-ink",
              title: "!text-sm !font-medium",
              description: "!text-xs !text-ink-muted",
              closeButton: "!bg-white !border-ink/12 !text-ink-faint",
            },
          }}
        />
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

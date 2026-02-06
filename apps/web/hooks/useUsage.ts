import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

export interface UserUsage {
  pdfUploadCount: number;
  pdfUploadLimit: number;
  totalPageCount: number;
  totalPageLimit: number;
  queryCount: number;
  queryLimit: number;
}

export function useUsage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/usage");
        if (res.ok) {
          setUsage(await res.json());
        }
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsage();
  }, [session]);

  return { usage, isLoading };
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CommunityHubPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard/community");
  }, [router]);

  return (
    <div className="p-6">
      <p>Redirecting to Community...</p>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import { getMockUser, isAuthedMock, logoutMock } from "@/lib/mock-auth";

// export default function DashboardPage() {
//   const router = useRouter();
//   const [username, setUsername] = useState<string>("");

//   const user = getMockUser();
//   <p className="text-sm text-muted-foreground">
//     Signed in as {user?.username} • {user?.role === "producer" ? "Producer" : "Consumer"} • {user?.orgName}
//   </p>

//   useEffect(() => {
//     if (!isAuthedMock()) {
//       router.push("/login");
//       return;
//     }

//     const user = getMockUser();
//     setUsername(user?.username ?? "");
//   }, [router]);

//   return (
//     <div className="min-h-screen p-8">
//       <div className="mx-auto max-w-4xl">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-semibold">HydroSync Dashboard</h1>
//             <p className="text-sm text-muted-foreground">
//               Signed in as {username || "—"}
//             </p>
//           </div>

//           <Button
//             variant="outline"
//             onClick={() => {
//               logoutMock();
//               router.push("/login");
//             }}
//           >
//             Log out
//           </Button>
//         </div>

//         <div className="mt-8 rounded-xl border bg-card p-6">
//           <h2 className="text-lg font-semibold">Next step: CRUD</h2>
//           <p className="mt-2 text-sm text-muted-foreground">
//             We’ll add your main entity (create / edit / delete) here next.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRouterPage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("hydrosync_role");
    const userId = localStorage.getItem("hydrosync_userId");

    // Not logged in → go login
    if (!role || !userId) {
      router.replace("/login");
      return;
    }

    // Role-based routing
    if (role === "producer") {
      router.replace("/producer/upload");
      return;
    }

    if (role === "consumer") {
      router.replace("/consumer/dashboard");
      return;
    }

    // Unknown role fallback
    router.replace("/login");
  }, [router]);

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Routing to your dashboard...
    </div>
  );
}
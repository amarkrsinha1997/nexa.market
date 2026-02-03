"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/admin/ledger");
    }, [router]);

    return null;
}

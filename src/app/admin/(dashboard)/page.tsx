import {notFound, redirect} from "next/navigation";
import {getServerSession} from "@/lib/auth";

export default async function AdminIndexPage() {
    const session = await getServerSession();
    if (session?.user.role !== "admin") {
        notFound();
    }

    redirect("/admin/modules");
}

import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export default async function LoginPage() {

    const cookieStore = await cookies();
    const hasSession = cookieStore.has('session');

    if (!hasSession) {
        redirect('/login')
    }

    return (
        <div className="flex items-center justify-center p-4 pt-50">

        </div>
    );
}
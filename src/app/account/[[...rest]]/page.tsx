import {UserProfile} from "@clerk/nextjs";

export default function AccountPage() {
    return (
        <div className="flex justify-center p-6">
            <UserProfile />
        </div>
    );
}
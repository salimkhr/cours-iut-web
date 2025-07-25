import ChatBoxPage from "@/components/ia/ChatBoxPage";
import './chat.css';

export async function generateMetadata() {
    return {
        title: "Assistant IA",
    };
}

export default async function Chat() {
    return (
        <div className="flex flex-col w-full justify-start">
            <section
                className="w-full flex flex-col justify-center p-4 lg:px-6  gap-4"
            >
                <ChatBoxPage></ChatBoxPage>
            </section>
        </div>
    );
}

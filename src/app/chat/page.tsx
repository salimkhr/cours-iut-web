import './chat.css';
import ChatBox from "@/components/ia/ChatBox";

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
                <ChatBox showOpenButton={false} variant="fullpage"></ChatBox>
            </section>
        </div>
    );
}

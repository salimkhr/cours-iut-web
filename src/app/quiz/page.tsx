import {redirect} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import JoinCodeForm from "@/components/quiz/play/JoinCodeForm";
import QuizStage, {QuizTitle} from "@/components/quiz/QuizStage";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Rejoindre un quiz", noIndex: true});

/** Mode ordinateur : saisie du code affiché au tableau, à la place du scan du QR code. */
export default async function QuizJoinPage() {
    const session = await getServerSession();
    if (!session) redirect(`/login?redirect_to=${encodeURIComponent("/quiz")}`);
    return (
        <QuizStage mode="title" className="min-h-[calc(100dvh-var(--navbar-h))]">
            <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-5 py-10">
                <QuizTitle className="text-5xl sm:text-6xl">Rejoindre le quiz</QuizTitle>
                <p className="text-lg text-bridge-600 dark:text-bridge-300">
                    Tapez le code affiché au tableau. Sur téléphone, vous pouvez aussi scanner le QR code.
                </p>
                <JoinCodeForm/>
            </div>
        </QuizStage>
    );
}

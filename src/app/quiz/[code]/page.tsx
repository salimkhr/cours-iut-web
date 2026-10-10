import {redirect} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import PlayScreen from "@/components/quiz/play/PlayScreen";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Quiz en direct", noIndex: true});

export default async function QuizPlayPage({params}: {params: Promise<{code: string}>}) {
    const {code} = await params;
    const session = await getServerSession();
    // Compte personnel obligatoire ; retour automatique dans la session après connexion.
    if (!session) redirect(`/login?redirect_to=${encodeURIComponent(`/quiz/${code}`)}`);
    return <PlayScreen code={code}/>;
}

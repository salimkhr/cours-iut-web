import {notFound} from "next/navigation";
import {getServerSession} from "@/lib/auth";
import {canManageQuiz} from "@/lib/quiz/permissions";
import ProjectionScreen from "@/components/quiz/projection/ProjectionScreen";
import {generatePageMetadata} from "@/lib/generatePageMetadata";

export const metadata = generatePageMetadata({defaultTitle: "Quiz en direct", noIndex: true});

export default async function QuizProjectionPage({params}: {params: Promise<{sessionId: string}>}) {
    const session = await getServerSession();
    if (!canManageQuiz(session)) notFound();
    const {sessionId} = await params;
    return <ProjectionScreen sessionId={sessionId}/>;
}

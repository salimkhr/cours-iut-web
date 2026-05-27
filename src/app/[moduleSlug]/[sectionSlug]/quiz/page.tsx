import {redirect} from "next/navigation";
import {Metadata} from "next";
import {getServerSession} from "@/lib/auth";
import {getModuleData} from "@/hook/getModuleData";
import QuizPageLayout from "@/components/quiz/QuizPageLayout";
import QuizGame from "@/components/quiz/QuizGame";

interface QuizPageProps {
    params: Promise<{
        moduleSlug: string;
        sectionSlug: string;
    }>;
}

export async function generateMetadata({params}: QuizPageProps): Promise<Metadata> {
    const {moduleSlug, sectionSlug} = await params;
    const {currentModule, currentSection} = await getModuleData({moduleSlug, sectionSlug});
    return {
        title: `Quiz — ${currentSection?.title} | ${currentModule.title}`,
    };
}

export default async function QuizPage({params}: QuizPageProps) {
    const {moduleSlug, sectionSlug} = await params;

    const session = await getServerSession();
    if (!session) redirect("/login");

    const {currentModule, currentSection} = await getModuleData({moduleSlug, sectionSlug});

    if (!currentSection?.quiz?.questions?.length) {
        redirect(`/${moduleSlug}/${sectionSlug}/TP`);
    }

    return (
        <QuizPageLayout
            moduleSlug={moduleSlug}
            sectionSlug={sectionSlug}
            modulePath={currentModule.path}
            sectionTitle={currentSection.title}
        >
            <QuizGame
                moduleSlug={moduleSlug}
                sectionSlug={sectionSlug}
                modulePath={currentModule.path}
            />
        </QuizPageLayout>
    );
}

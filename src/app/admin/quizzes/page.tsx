import AdminQuizzes from '@/components/admin/AdminQuizzes';

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-center my-4">Gestion des quizz et des questions </h1>
            <AdminQuizzes/>
        </div>
    );
}

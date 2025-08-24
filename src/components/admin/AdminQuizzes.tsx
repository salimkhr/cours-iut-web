"use client";

import {useEffect, useState} from "react";
import useAdminQuizzesApi from "@/hook/admin/useAdminQuizzesApi";
import Quiz from "@/types/Quiz";
import Question from "@/types/Question";
import Module from "@/types/module";
import useAdminApi from "@/hook/admin/useAdminApi";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Pencil, Plus, Trash2} from "lucide-react";
import QuizForm, {QuizFormData} from "@/components/admin/QuizForm";
import QuestionForm, {QuestionFormData} from "@/components/admin/QuestionForm";
import {QuestionPayload} from "@/hook/admin/useAdminQuestionsApi";

export default function AdminQuizzes() {
    const {listQuizzes, addQuiz, editQuiz, deleteQuiz, addQuestionToQuiz, editQuestionInQuiz} = useAdminQuizzesApi();
    const {listModules} = useAdminApi();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState<"add" | "edit">("add");
    const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>(undefined);

    const [openQuestionForm, setOpenQuestionForm] = useState(false);
    const [quizForQuestion, setQuizForQuestion] = useState<Quiz | undefined>(undefined);
    const [questionFormMode, setQuestionFormMode] = useState<"add" | "edit">("add");
    const [managingQuiz, setManagingQuiz] = useState<Quiz | undefined>(undefined);
    const [manageOpen, setManageOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState<Question | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const list = await listQuizzes(q.trim() ? {q: q.trim()} : {});
                setQuizzes(list);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        //listQuizzes est volontairement pas ajouté au dependence
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);


    useEffect(() => {
        (async () => {
            try {
                const mods = await listModules();
                setModules(mods);
            } catch (e) {
                console.error(e);
            }
        })();
        //listModules est volontairement pas ajouté au dependence  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onAdd = async (data: QuizFormData) => {
        const created = await addQuiz({name: data.name, moduleId: data.moduleId, questions: []});
        setQuizzes((prev) => [created, ...prev]);
        setOpenForm(false);
    };

    const onEdit = async (data: QuizFormData) => {
        if (!editingQuiz?._id) return;
        const updated = await editQuiz(String(editingQuiz._id), {name: data.name, moduleId: data.moduleId});
        setQuizzes((prev) => prev.map((z) => String(z._id) === String(editingQuiz._id) ? updated : z));
        setOpenForm(false);
    };

    const onDelete = async (quiz: Quiz) => {
        if (!confirm(`Supprimer le quiz "${quiz.name}" ?`)) return;
        await deleteQuiz(String(quiz._id!));
        setQuizzes((prev) => prev.filter((z) => String(z._id) !== String(quiz._id)));
    };

    const openAdd = () => {
        setMode("add");
        setEditingQuiz(undefined);
        setOpenForm(true);
    };
    const openEdit = (z: Quiz) => {
        setMode("edit");
        setEditingQuiz(z);
        setOpenForm(true);
    };

    const openAddQuestion = (z: Quiz) => {
        setQuizForQuestion(z);
        setQuestionFormMode("add");
        setOpenQuestionForm(true);
    };

    const openManageQuestions = (z: Quiz) => {
        setManagingQuiz(z);
        setManageOpen(true);
    };

    const shortText = (md: string) => {
        const plain = md.replace(/[#*_`>\-\[\]\(\)!]/g, "");
        return plain.length > 80 ? plain.slice(0, 80) + "…" : plain;
    };

    const onEditQuestion = (z: Quiz, question: Question) => {
        setManagingQuiz(z);
        setQuizForQuestion(z);
        setQuestionToEdit(question);
        setQuestionFormMode("edit");
        setOpenQuestionForm(true);
    };

    const onAddQuestion = async (data: QuestionFormData) => {
        if (!quizForQuestion?._id) return;
        const updated = await addQuestionToQuiz(String(quizForQuestion._id), data as unknown as QuestionPayload);
        setQuizzes(prev => prev.map(qz => String(qz._id) === String(quizForQuestion._id) ? updated : qz));
        setOpenQuestionForm(false);
        setQuizForQuestion(undefined);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)}
                           className="w-[220px]"/>
                </div>
                <Button onClick={openAdd} variant="outline"><Plus className="mr-2"/>Créer un quiz</Button>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Nb questions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quizzes.map((z) => (
                            <TableRow key={String(z._id)}>
                                <TableCell>{z.name}</TableCell>
                                <TableCell>{modules.find(m => String(m._id) === String(z.moduleId))?.title || '-'}</TableCell>
                                <TableCell> <Button size="sm" variant="ghost"
                                                    className={`text-${modules.find(m => String(m._id) === String(z.moduleId))?.path} border-1`}
                                                    onClick={() => openManageQuestions(z)}>{z.questions?.length
                                    ?? 0}</Button></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openAddQuestion(z)}><Plus
                                        className="size-4"/></Button>
                                    <Button size="sm" variant="outline" onClick={() => openEdit(z)}><Pencil
                                        className="size-4"/></Button>
                                    <Button size="sm" variant="outline" className="text-red-600"
                                            onClick={() => onDelete(z)}><Trash2 className="size-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {quizzes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4}
                                           className="text-center text-muted-foreground">{loading ? "Chargement..." : "Aucun quiz"}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <QuizForm
                open={openForm}
                onOpenChange={setOpenForm}
                mode={mode}
                quiz={editingQuiz}
                modules={modules}
                onSubmit={mode === "add" ? onAdd : onEdit}
            />

            <QuestionForm
                open={openQuestionForm}
                onOpenChange={(o) => {
                    setOpenQuestionForm(o);
                    if (!o) setQuestionToEdit(undefined);
                }}
                mode={questionFormMode}
                question={questionFormMode === "edit" ? questionToEdit : undefined}
                onSubmit={async (data) => {
                    if (!quizForQuestion?._id) return;
                    if (questionFormMode === "add") {
                        await onAddQuestion(data);
                    } else if (questionFormMode === "edit" && questionToEdit?._id) {
                        const updated = await editQuestionInQuiz(String(quizForQuestion._id), String(questionToEdit._id!), data as unknown as QuestionPayload);
                        setQuizzes(prev => prev.map(qz => String(qz._id) === String(quizForQuestion._id) ? updated : qz));
                        setManagingQuiz(updated);
                        setOpenQuestionForm(false);
                        setQuestionToEdit(undefined);
                    }
                }}
            />

            <Dialog open={manageOpen} onOpenChange={(o) => setManageOpen(o)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Questions du quiz {managingQuiz?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[60vh] overflow-auto">
                        {(managingQuiz?.questions || []).length === 0 && (
                            <div className="text-sm text-muted-foreground">Aucune question</div>
                        )}
                        {(managingQuiz?.questions || []).map((qq) => (
                            <div key={String(qq._id)}
                                 className="flex items-center justify-between gap-2 border rounded p-2">
                                <div className="text-sm truncate max-w-[70%]">{shortText(qq.text)}</div>
                                <div className="shrink-0 space-x-2">
                                    <Button size="sm" variant="outline"
                                            onClick={() => onEditQuestion(managingQuiz!, qq)}>
                                        <Pencil className="size-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

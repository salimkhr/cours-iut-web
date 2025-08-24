'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import useAdminQuestionsApi, {QuestionPayload} from '@/hook/admin/useAdminQuestionsApi';
import Question, {Difficulty, QuestionType} from '@/types/Question';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Pencil, Plus, Trash2} from 'lucide-react';
import QuestionForm, {QuestionFormData} from '@/components/admin/QuestionForm';

export default function AdminQuestions() {
    const {listQuestions, addQuestion, editQuestion, deleteQuestion} = useAdminQuestionsApi();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState('');
    const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');

    const [openForm, setOpenForm] = useState(false);
    const [mode, setMode] = useState<'add' | 'edit'>('add');
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

    const params = useMemo(() => {
        const p: Record<string, string> = {};
        if (q.trim()) p.q = q.trim();
        if (typeFilter !== 'all') p.type = typeFilter;
        if (difficultyFilter !== 'all') p.difficulty = difficultyFilter;
        return p;
    }, [q, typeFilter, difficultyFilter]);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const list = await listQuestions(params);
            setQuestions(list);
        } finally {
            setLoading(false);
        }
    }, [listQuestions, params]);

    useEffect(() => {
        fetchQuestions();
    }, [params.q, params.type, params.difficulty, fetchQuestions]);

    const onAdd = async (data: QuestionFormData) => {
        const created = await addQuestion(data as unknown as QuestionPayload);
        setQuestions(prev => [created as Question, ...prev]);
        setOpenForm(false);
    };

    const onEdit = async (data: QuestionFormData) => {
        if (!editingQuestion?._id) return;
        const updated = await editQuestion(String(editingQuestion._id), data as unknown as QuestionPayload);
        setQuestions(prev => prev.map(q => String(q._id) === String(editingQuestion._id) ? (updated as Question) : q));
        setOpenForm(false);
    };

    const onDelete = async (question: Question) => {
        if (!confirm(`Supprimer cette question ?`)) return;
        await deleteQuestion(String(question._id!));
        setQuestions(prev => prev.filter(q => String(q._id) !== String(question._id)));
    };

    const openAdd = () => {
        setMode('add');
        setEditingQuestion(undefined);
        setOpenForm(true);
    };
    const openEdit = (q: Question) => {
        setMode('edit');
        setEditingQuestion(q);
        setOpenForm(true);
    };

    const shortText = (md: string) => {
        const plain = md.replace(/[#*_`>\-\[\]\(\)!]/g, '');
        return plain.length > 80 ? plain.slice(0, 80) + '…' : plain;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <Input placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)}
                           className="w-[220px]"/>
                    <Select value={typeFilter} onValueChange={(v: QuestionType | 'all') => setTypeFilter(v)}>
                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            <SelectItem value="multiple-choice">multiple-choice</SelectItem>
                            <SelectItem value="true-false">true-false</SelectItem>
                            <SelectItem value="short-answer">short-answer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={difficultyFilter} onValueChange={(v: Difficulty | 'all') => setDifficultyFilter(v)}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Difficulté"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="easy">easy</SelectItem>
                            <SelectItem value="medium">medium</SelectItem>
                            <SelectItem value="hard">hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={openAdd} variant="outline"><Plus className="mr-2"/>Ajouter</Button>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Texte</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Temps</TableHead>
                            <TableHead>Difficulté</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.map(qq => (
                            <TableRow key={String(qq._id)}>
                                <TableCell className="max-w-[360px] truncate">{shortText(qq.text)}</TableCell>
                                <TableCell>{qq.type}</TableCell>
                                <TableCell>{qq.points}</TableCell>
                                <TableCell>{qq.timeLimit ?? '-'}</TableCell>
                                <TableCell>{qq.difficulty ?? '-'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openEdit(qq)}><Pencil
                                        className="size-4"/></Button>
                                    <Button size="sm" variant="outline" className="text-red-600"
                                            onClick={() => onDelete(qq)}><Trash2 className="size-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {questions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}
                                           className="text-center text-muted-foreground">{loading ? 'Chargement...' : 'Aucune question'}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <QuestionForm
                open={openForm}
                onOpenChange={setOpenForm}
                mode={mode}
                question={editingQuestion}
                onSubmit={mode === 'add' ? onAdd : onEdit}
            />
        </div>
    );
}

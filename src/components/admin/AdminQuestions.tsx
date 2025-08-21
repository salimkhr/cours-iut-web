'use client';

import {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import Question, {Difficulty, QuestionType} from '@/types/Question';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Pencil, Plus, Trash2} from 'lucide-react';
import QuestionForm, {QuestionFormData} from '@/components/admin/QuestionForm';

export default function AdminQuestions() {
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

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/questions', {params});
            setQuestions(res.data.questions || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [params.q, params.type, params.difficulty]);

    const onAdd = async (data: QuestionFormData) => {
        const res = await axios.post('/api/admin/questions', data, {headers: {'Content-Type': 'application/json'}});
        if (res.status >= 200 && res.status < 300) {
            setQuestions(prev => [res.data.question as Question, ...prev]);
            setOpenForm(false);
        }
    };

    const onEdit = async (data: QuestionFormData) => {
        if (!editingQuestion?._id) return;
        const res = await axios.put(`/api/admin/questions/${editingQuestion._id}`, data, {headers: {'Content-Type': 'application/json'}});
        if (res.status >= 200 && res.status < 300) {
            setQuestions(prev => prev.map(q => String(q._id) === String(editingQuestion._id) ? (res.data.question as Question) : q));
            setOpenForm(false);
        }
    };

    const onDelete = async (question: Question) => {
        if (!confirm(`Supprimer cette question ?`)) return;
        await axios.delete(`/api/admin/questions/${question._id}`);
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

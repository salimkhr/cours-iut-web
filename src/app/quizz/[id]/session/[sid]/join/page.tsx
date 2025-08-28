"use client"
import React, {useCallback, useEffect, useState} from "react";
import Heading from "@/components/ui/Heading";
import Quiz from "@/types/Quiz";
import useAdminQuizzesApi from "@/hook/admin/useAdminQuizzesApi";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import User from "@/types/User";
import useAdminUsersApi from "@/hook/admin/useAdminUsersApi";
import {Button} from "@/components/ui/button";
import {Send} from "lucide-react";
import {useRouter} from "next/navigation";


export default function Page({params}: { params: Promise<{ id: string, sid: string }> }) {
    const {id, sid} = React.use(params);
    const [quizz, setQuizz] = useState<Quiz>();
    const {
        listQuizzes,
        addParticipantToSession,
    } = useAdminQuizzesApi();

    const router = useRouter();

    const {listUsers} = useAdminUsersApi();

    const [value, setValue] = useState<string>();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            params.role = 'student';
            const list = await listUsers(params);
            setUsers(list);
        } finally {
            setLoading(false);
        }
        //listUsers est volontairement pas ajouté au dependence
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    useEffect(() => {
        const fetchData = async () => {
            const list = await listQuizzes();
            setQuizz(list.find((q) => q._id === id));
        };

        fetchData();
        //listQuizzes est volontairement pas ajouté au dependence
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!value) {
            // No user selected; do nothing or you could add a toast later
            return;
        }
        try {
            await addParticipantToSession(String(id), String(sid), String(value));
            router.push(`/quizz/${id}/session/${sid}/participate`);
        } catch (err) {
            console.error('Erreur lors de l\'ajout du participant à la session', err);
            // Optionally show UI feedback
        }
    };

    return (
        <div className={"flex flex-col items-center justify-center gap-4"}>
            <Heading level={1}>{quizz?.name}</Heading>

            <form onSubmit={onSubmit} className="space-y-4">
                {/*<Label>Login</Label>*/}
                <Select
                    onValueChange={(v: string) => setValue(v)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner votre login"/>
                    </SelectTrigger>
                    <SelectContent>
                        {!loading && users.map(u => <SelectItem key={String(u._id)}
                                                                value={String(u._id)}>{`${u.login} (${u.firstName} ${u.lastName})`}</SelectItem>
                        )}
                    </SelectContent>
                </Select>

                <Button type="submit" variant="outline" className="mt-5 w-full"
                        disabled={!value}>Participer <Send/></Button>
            </form>
        </div>

    );
}

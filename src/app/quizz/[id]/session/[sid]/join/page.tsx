"use client"
import React, {useEffect, useState} from "react";
import Heading from "@/components/ui/Heading";
import Quiz from "@/types/Quiz";
import useAdminQuizzesApi from "@/hook/admin/useAdminQuizzesApi";


export default function Page({params}: { params: Promise<{ id: string, sid: string }> }) {
    const {id, sid} = React.use(params);
    const [quizz, setQuizz] = useState<Quiz>();
    const {
        listQuizzes,
    } = useAdminQuizzesApi();


    useEffect(() => {
        const fetchData = async () => {
            const list = await listQuizzes();
            setQuizz(list.find((q) => q._id === id));
        };

        fetchData();
        //listQuizzes est volontairement pas ajouté au dependence
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={"flex flex-col items-center justify-center gap-4"}>
            <Heading level={1}>{quizz?.name}</Heading>

            
        </div>

    );
}

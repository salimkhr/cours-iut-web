"use client"

import React, {useEffect, useState} from "react";
import Heading from "@/components/ui/Heading";
import Quiz from "@/types/Quiz";
import useAdminQuizzesApi from "@/hook/admin/useAdminQuizzesApi";
import ShowQuestion from "@/components/ShowQuestion";
import {Button} from "@/components/ui/button";
import Text from "@/components/ui/Text";

export default function Page({params}: { params: Promise<{ id: string, sid: string }> }) {
    const {id} = React.use(params); //sid
    const [quizz, setQuizz] = useState<Quiz>();
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const {listQuizzes} = useAdminQuizzesApi();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const list = await listQuizzes();
                const foundQuiz = list.find((q) => q._id === id);
                setQuizz(foundQuiz);
            } catch (error) {
                console.error("Erreur lors du chargement du quiz:", error);
            }

            setCurrentQuestion(0); //A SUPPRIMER !!!!!!!
        };

        fetchData();
        // listQuizzes est volontairement pas ajouté aux dépendances
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleAnswerSelect = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
    };

    if (!quizz) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <Text className="text-sm sm:text-base">Chargement du quiz...</Text>
                </div>
            </div>
        );
    }

    const currentQuestionData = quizz.questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-start max-w-4xl mx-auto space-y-6">

                {/* En-tête avec titre */}
                <div className="text-center w-full">
                    <Heading level={1} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl break-words">
                        {quizz.name}
                    </Heading>
                </div>

                {/* Indicateur de progression - Responsive */}
                <div
                    className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-600 w-full max-w-lg">
                    <span className="whitespace-nowrap text-xs sm:text-sm">
                        Question {currentQuestion + 1} sur {quizz.questions.length}
                    </span>
                    <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{width: `${((currentQuestion + 1) / quizz.questions.length) * 100}%`}}
                        />
                    </div>
                </div>

                {/* Contenu de la question */}
                <div className="hidden sm:inline">
                    <ShowQuestion
                        key={`${quizz._id}-${currentQuestion}`}
                        question={currentQuestionData}
                        currentModule={String(quizz.moduleId)}
                    />
                </div>

                {/* Choix de réponses - Responsive */}
                {currentQuestionData.choices && currentQuestionData.choices.length > 0 && (
                    <div className="flex flex-col gap-3 w-full max-w-3xl sm:hidden">
                        {currentQuestionData.choices.map((choice, index) => (
                            <Button
                                key={`${currentQuestion}-${index}`}
                                variant={selectedAnswer === index ? "default" : "outline"}
                                className="p-3 sm:p-4 text-left justify-start min-h-12 sm:min-h-16 w-full hover:scale-[1.02] transition-transform"
                                onClick={() => handleAnswerSelect(index)}
                            >
                                <Text className="text-sm sm:text-base lg:text-lg break-words text-left w-full">
                                    <span className="font-semibold mr-2 sm:mr-3">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                    {choice}
                                </Text>
                            </Button>
                        ))}
                    </div>
                )}

                {/* Espacement en bas pour mobile */}
                <div className="h-20"></div>
            </div>
        </div>
    );
}
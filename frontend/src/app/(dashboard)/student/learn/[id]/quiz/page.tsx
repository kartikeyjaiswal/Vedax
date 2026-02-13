'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Question {
    id: number;
    text: string;
    options: string[];
    correct_option_index: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    points_reward: number;
    questions: Question[];
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // lesson id
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                // Endpoint defined as action on LessonViewSet: /api/lessons/{id}/quiz/
                const response = await axios.get(`http://localhost:8000/api/lessons/${id}/quiz/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                setQuiz(response.data);
                // Initialize answers array
                if (response.data.questions) {
                    setAnswers(new Array(response.data.questions.length).fill(-1));
                }
            } catch (error) {
                console.error('Failed to fetch quiz', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id]);

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (quiz && currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            // Post answers to backend
            // answers is array of indices
            const response = await axios.post(`http://localhost:8000/api/lessons/${id}/attempt_quiz/`, {
                answers: answers
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            const { passed, score, total, points_awarded } = response.data;

            // Simulate delay for UX
            await new Promise(r => setTimeout(r, 800));

            if (passed) {
                alert(`🎉 You passed! Score: ${score}/${total}. You earned ${points_awarded} XP!`);
                router.push('/student/learn');
            } else {
                alert(`❌ You failed. Score: ${score}/${total}. Try again!`);
                // Reset
                setAnswers(new Array(quiz.questions.length).fill(-1));
                setCurrentQuestion(0);
            }

        } catch (error) {
            console.error('Quiz submission failed', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500">Loading quiz...</div>;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return <div className="p-8 text-center">No quiz available for this lesson. <Link href="/student/learn" className="text-primary underline">Go back</Link></div>;

    const question = quiz.questions[currentQuestion];
    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const hasAnsweredCurrent = answers[currentQuestion] !== -1;

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                {/* Header */}
                <div className="bg-primary/5 p-8 border-b border-primary/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                            Question {currentQuestion + 1} of {quiz.questions.length}
                        </span>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            Win {quiz.points_reward} XP
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {question.text}
                    </h2>
                </div>

                {/* Options */}
                <div className="p-8 space-y-4">
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion] === idx
                                ? 'border-primary bg-primary/5 text-primary font-medium'
                                : 'border-neutral-100 dark:border-neutral-800 hover:border-primary/50 text-neutral-600 dark:text-neutral-400'
                                }`}
                        >
                            <span className="inline-block w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-center leading-8 mr-4 text-sm font-bold opacity-70">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {option}
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-8 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="text-neutral-400 hover:text-neutral-600 font-medium disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!hasAnsweredCurrent || submitting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
}

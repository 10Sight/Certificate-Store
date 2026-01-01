import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconPrinter, IconClock, IconCheck, IconX, IconFolderOff } from '@tabler/icons-react';
import { useGetUserByIdQuery } from '@/Redux/AllApi/UserApi';
import { useGetTemplateByIdQuery } from '@/Redux/AllApi/TemplateApi';
import { useCreateAssessmentResultMutation, useGetAssessmentByTemplateQuery, useUpdateAssessmentResultMutation } from '@/Redux/AllApi/AssessmentResultApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UserQuestions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('templateId');

    // API Calls
    const { data: userData, isLoading: isUserLoading } = useGetUserByIdQuery(id, {
        skip: !id || id === 'undefined'
    });

    const { data: templateData, isLoading: isTemplateLoading } = useGetTemplateByIdQuery(templateId, {
        skip: !templateId
    });

    const { data: existingResultData, isLoading: isExistingLoading } = useGetAssessmentByTemplateQuery({
        templateId,
        userId: id
    }, {
        skip: !templateId || !id
    });
    const existingResult = existingResultData?.data;

    const user = userData?.data;
    const template = templateData?.data;
    const questions = template?.questions || [];

    const isLoading = isUserLoading || isTemplateLoading || isExistingLoading;

    // Local State
    const [deductions, setDeductions] = useState({});
    const [timeLeft, setTimeLeft] = useState(null); // seconds

    // Pre-populate deductions if editing
    useEffect(() => {
        if (existingResult?.answers) {
            const mappedDeductions = {};
            existingResult.answers.forEach(ans => {
                // If isCorrect is false, it's a full deduction (weightage)
                // If isCorrect is true, it's 0 deduction
                mappedDeductions[ans.questionId] = ans.isCorrect ? 0 : ans.weightage;
            });
            setDeductions(mappedDeductions);
            // Also stop timer if already completed?
            // Actually, for "Edit", the timer might not be needed, but we'll leave it for now.
        }
    }, [existingResult]);

    // Timer Logic
    useEffect(() => {
        if (!template?.timeLimit || !template?._id) return;

        const storageKey = `assessment_timer_${id}_${template._id}`;
        const savedEndTime = localStorage.getItem(storageKey);

        if (savedEndTime) {
            const remaining = Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
            const endTime = Date.now() + (template.timeLimit * 60 * 1000); // template.timeLimit is in minutes in new schema usually, but controller said seconds? 
            // Let's assume minutes for timeLimit in Template model as per common practice, but previous code used it as seconds.
            // Looking at AssessmentList.jsx: Math.floor(assessment.timeLimit / 60) mins. So it's seconds.
            const endTimeCalculated = Date.now() + (template.timeLimit * 1000);
            localStorage.setItem(storageKey, endTimeCalculated.toString());
            setTimeLeft(template.timeLimit);
        }
    }, [template, id]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || !template?._id) return;

        const timer = setInterval(() => {
            const storageKey = `assessment_timer_${id}_${template._id}`;
            const savedEndTime = localStorage.getItem(storageKey);

            if (savedEndTime) {
                const remaining = Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000);
                setTimeLeft(remaining > 0 ? remaining : 0);
            } else {
                setTimeLeft(prev => prev - 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, id, template]);

    // Format Time
    const formatTime = (seconds) => {
        if (seconds === null) return "--:--";
        if (seconds <= 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate Totals
    const totals = useMemo(() => {
        let totalPoints = 0;
        let totalDeducted = 0;

        questions.forEach(q => {
            totalPoints += (q.weightage || 1);
            totalDeducted += (deductions[q._id] || 0);
        });

        return {
            totalPoints,
            totalDeducted,
            achieved: totalPoints - totalDeducted
        };
    }, [questions, deductions]);

    const handleDeductionChange = (qId, type, weightage) => {
        setDeductions(prev => ({
            ...prev,
            [qId]: type === 0 ? 0 : weightage
        }));
    };

    const [createResult, { isLoading: isCreating }] = useCreateAssessmentResultMutation();
    const [updateResult, { isLoading: isUpdating }] = useUpdateAssessmentResultMutation();

    const isSubmitting = isCreating || isUpdating;

    const handleSubmit = async () => {
        if (!template) return;
        try {
            const payload = {
                id: existingResult?._id, // Only for update
                userId: id,
                templateId: template._id,
                deductions,
                questions,
                totalMaxScore: totals.totalPoints
            };

            if (existingResult) {
                await updateResult(payload).unwrap();
            } else {
                await createResult(payload).unwrap();
            }

            const storageKey = `assessment_timer_${id}_${template._id}`;
            localStorage.removeItem(storageKey);

            toast.success(existingResult ? "Assessment Updated Successfully!" : "Assessment Submitted Successfully!");
            navigate(`/employee/${id}`);
        } catch (error) {
            console.error("Submission Failed", error);
            toast.error(error?.data?.message || "Failed to submit assessment");
        }
    };

    if (isLoading) {
        return (
            <div className="flex bg-gray-50 h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <span className="ml-3 text-lg font-medium text-gray-600">Loading Assessment...</span>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <IconFolderOff size={40} />
                    </div>
                    <h3 className="font-bold text-2xl mb-2 text-gray-800">Assessment Not Found</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        The requested assessment template could not be loaded. It may have been deleted or the link is invalid.
                    </p>
                    <Button onClick={() => navigate(-1)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Return to List
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white font-sans text-slate-900">
            {/* Control Bar */}
            <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-600 hover:text-slate-900">
                    <IconArrowLeft className="mr-2 h-5 w-5" /> Back to Assessments
                </Button>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold shadow-sm border-2 ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-700 border-white'}`}>
                        <IconClock size={20} className={timeLeft < 300 ? 'animate-pulse' : ''} />
                        <span className="w-[60px] text-center">{formatTime(timeLeft)}</span>
                    </div>
                    <Button onClick={() => window.print()} variant="outline" className="bg-white hover:bg-slate-50 border-white shadow-sm">
                        <IconPrinter className="mr-2 h-4 w-4" /> Print Form
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                        {isSubmitting ? "Saving..." : existingResult ? "Update Evaluation" : "Submit Evaluation"}
                    </Button>
                </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] p-[15mm] relative">
                {/* Header */}
                <header className="border-b-4 border-slate-900 pb-6 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-indigo-900">10SIGHT</h2>
                            <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase mt-0.5 ml-0.5">Assessment Protocol</p>
                        </div>
                        <div className="text-right">
                            <h1 className="font-bold text-xl uppercase text-slate-800 tracking-tight">{template.categoryType} Evaluation</h1>
                            <div className="inline-block bg-slate-900 text-white text-[10px] font-black px-3 py-1 mt-1 rounded uppercase tracking-widest">
                                {user?.department?.name || "General"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Employee Name</label>
                                <div className="font-bold text-lg text-indigo-900 uppercase leading-none">{user?.fullName}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Subject Area</label>
                                <div className="font-bold text-slate-800">{template.categoryReference?.name || "General Knowledge"}</div>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Assessment Template</label>
                                <div className="font-bold text-slate-800 line-clamp-1">{template.name}</div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time Allocated</label>
                                <div className="font-bold text-slate-800">{Math.floor(template.timeLimit / 60)} Minutes</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Table */}
                <div className="mb-12">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="py-4 px-2 text-left font-black text-[10px] uppercase tracking-widest text-slate-400 w-[10%]">No.</th>
                                <th className="py-4 px-2 text-left font-black text-[10px] uppercase tracking-widest text-slate-400 w-[60%]">Criteria / Question</th>
                                <th className="py-4 px-2 text-center font-black text-[10px] uppercase tracking-widest text-slate-400 w-[10%]">Max</th>
                                <th className="py-4 px-2 text-center font-black text-[10px] uppercase tracking-widest text-slate-400 w-[20%]">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {questions.map((q, idx) => (
                                <tr key={q._id} className="group transition-colors hover:bg-slate-50/50">
                                    <td className="py-4 px-2 align-top font-mono text-slate-300 text-sm">{String(idx + 1).padStart(2, '0')}</td>
                                    <td className="py-4 px-2 align-top text-sm font-medium leading-relaxed pr-8">{q.questionText}</td>
                                    <td className="py-4 px-2 align-top text-center font-bold text-slate-400 text-sm">{q.weightage || 1}</td>
                                    <td className="py-4 px-2 align-top">
                                        <div className="flex justify-center gap-2 print:hidden opacity-30 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={`h-8 w-8 rounded-lg border-2 ${deductions[q._id] === 0 ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-200 hover:border-emerald-400 hover:text-emerald-500"}`}
                                                onClick={() => handleDeductionChange(q._id, 0, q.weightage || 1)}
                                            >
                                                <IconCheck size={16} strokeWidth={3} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className={`h-8 w-8 rounded-lg border-2 ${deductions[q._id] > 0 ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-slate-200 text-slate-200 hover:border-rose-400 hover:text-rose-500"}`}
                                                onClick={() => handleDeductionChange(q._id, 1, q.weightage || 1)}
                                            >
                                                <IconX size={16} strokeWidth={3} />
                                            </Button>
                                        </div>
                                        <div className="hidden print:block border-b-2 border-slate-200 border-dotted h-6 w-12 mx-auto"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Score Summary */}
                <div className="mt-auto pt-8">
                    <div className="flex gap-4 border-2 border-slate-900 rounded-2xl overflow-hidden p-6">
                        <div className="flex-1">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Outcome Calculation</div>
                            <div className="grid grid-cols-3 divide-x divide-slate-100">
                                <div className="text-center">
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Max Potential</span>
                                    <span className="text-2xl font-black text-slate-900">{totals.totalPoints}</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Deducted</span>
                                    <span className="text-2xl font-black text-rose-500">-{totals.totalDeducted}</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-[8px] font-bold text-indigo-600 uppercase mb-1 text-center">Final Score</span>
                                    <span className="text-4xl font-black text-indigo-700 leading-none">{totals.achieved}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-between px-10">
                        <div className="text-center space-y-2">
                            <div className="w-40 border-b-2 border-slate-200 h-10"></div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Trainee Signature</p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-40 border-b-2 border-slate-200 h-10"></div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Authorized Evaluator</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserQuestions;

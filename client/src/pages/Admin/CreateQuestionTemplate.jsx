import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowLeft, IconPlus, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { useGetAllQuestionsQuery, useCreateQuestionMutation } from '@/Redux/AllApi/QuestionApi';
import { useGetAllDepartmentsQuery } from '@/Redux/AllApi/DepartmentApi';
import { useCreateTemplateMutation, useGetTemplatesByCategoryQuery, useUpdateTemplateMutation } from '@/Redux/AllApi/TemplateApi';
import { useGetSkillByIdQuery } from '@/Redux/AllApi/SkillApi';
import { useGetAllKnowledgeQuery } from '@/Redux/AllApi/KnowledgeApi';
import { toast } from 'sonner';

const CreateQuestionTemplate = () => {
    const { categoryType, categoryReference } = useParams();
    const navigate = useNavigate();

    // State
    const [templateId, setTemplateId] = useState(null); // If editing
    const [templateName, setTemplateName] = useState('');
    const [timeLimit, setTimeLimit] = useState(90);
    const [addedQuestions, setAddedQuestions] = useState([]); // Array of question objects

    // New Question Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState('MCQ');
    const [qOptions, setQOptions] = useState(['', '']);
    const [qCorrectAnswer, setQCorrectAnswer] = useState('');
    const [qSection, setQSection] = useState('General');
    const [qWeightage, setQWeightage] = useState(1);

    // API
    const { data: qData, isLoading: isQLoading } = useGetAllQuestionsQuery({ categoryType, categoryReference });

    // Fetch Category Name for display
    const { data: skillData } = useGetSkillByIdQuery(categoryReference, { skip: categoryType !== 'Skill' });
    const { data: knowledgeData } = useGetAllKnowledgeQuery(null, { skip: categoryType !== 'Knowledge' });

    // Find the specific knowledge if type is Knowledge
    const categoryInfo = useMemo(() => {
        if (categoryType === 'Skill') return skillData?.data;
        if (categoryType === 'Knowledge') return knowledgeData?.data?.find(k => k._id === categoryReference);
        return null;
    }, [categoryType, skillData, knowledgeData, categoryReference]);

    // Check for existing templates for this category
    const { data: existingTemplates } = useGetTemplatesByCategoryQuery({ categoryType, categoryReference });

    const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
    const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
    const [createQuestion, { isLoading: isCreatingQ }] = useCreateQuestionMutation();

    const questions = qData?.data || [];

    // Effect: Load Existing Template if available
    useEffect(() => {
        if (existingTemplates?.data && existingTemplates.data.length > 0) {
            // Pick the latest one
            const latest = existingTemplates.data[0];

            setTemplateId(latest._id);
            setTemplateName(latest.name);
            setTimeLimit(latest.timeLimit);
            setAddedQuestions(latest.questions || []);
        } else if (categoryInfo) {
            // New Template
            setTemplateName(categoryInfo.name);
        }
    }, [existingTemplates, categoryInfo]);

    // Filter Source Questions (Exclude already added)
    const sourceQuestions = useMemo(() => {
        return questions.filter(q => {
            if (!q.isActive) return false;
            // Exclude already added
            if (addedQuestions.find(added => added._id === q._id)) return false;
            return true;
        });
    }, [questions, addedQuestions]);

    const handleAddQuestion = (q) => {
        setAddedQuestions([...addedQuestions, q]);
    };

    const handleRemoveQuestion = (qId) => {
        setAddedQuestions(addedQuestions.filter(q => q._id !== qId));
    };

    const totalPoints = useMemo(() => {
        return addedQuestions.reduce((sum, q) => sum + (q.weightage || 1), 0);
    }, [addedQuestions]);

    // New Question Creation Handlers
    const handleOpenDialog = () => {
        setQText('');
        setQType('MCQ');
        setQOptions(['', '']);
        setQCorrectAnswer('');
        setQSection('General');
        setQWeightage(1);
        setIsDialogOpen(true);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...qOptions];
        newOptions[index] = value;
        setQOptions(newOptions);
    };

    const addOption = () => setQOptions([...qOptions, '']);
    const removeOption = (index) => setQOptions(qOptions.filter((_, i) => i !== index));

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                text: qText,
                type: qType,
                options: qType === 'MCQ' ? qOptions : undefined,
                correctOption: qCorrectAnswer,
                categoryType,
                categoryReference,
                category: qType,
                section: qSection,
                weightage: Number(qWeightage)
            };

            const result = await createQuestion(payload).unwrap();

            // Add the newly created question to the template immediately
            const newQ = result.data;
            if (newQ) {
                setAddedQuestions(prev => [...prev, newQ]);
                toast.success("Question created and added!");
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.message || "Failed to create question");
        }
    };

    const handleSave = async () => {
        if (!templateName.trim()) {
            toast.error("Template name is required");
            return;
        }
        if (addedQuestions.length === 0) {
            toast.error("Please add at least one question");
            return;
        }
        const isSaving = isCreating || isUpdating;
        if (isSaving) return;

        try {
            const payload = {
                name: templateName,
                categoryType,
                categoryReference,
                questions: addedQuestions.map(q => q._id),
                timeLimit
            };

            if (templateId) {
                // Update
                await updateTemplate({ id: templateId, ...payload }).unwrap();
                toast.success("Template updated successfully!");
            } else {
                // Create
                await createTemplate(payload).unwrap();
                toast.success("Template created successfully!");
            }
            navigate(-1);
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.message || "Failed to save template");
        }
    };

    const isSaving = isCreating || isUpdating;

    return (
        <div className="p-6 min-h-screen bg-gray-50/50 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <IconArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{templateId ? 'Edit' : 'Create'} Question Paper</h1>
                    <p className="text-muted-foreground text-sm">Target {categoryType}: {categoryInfo?.name || "Loading..."}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

                {/* Left Panel: Source Questions */}
                <Card className="lg:col-span-2 flex flex-col h-full shadow-md border-0">
                    <CardHeader className="border-b bg-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Question Bank</CardTitle>
                                <CardDescription>Select questions to add to the paper.</CardDescription>
                            </div>
                            <Button onClick={handleOpenDialog} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <IconPlus className="mr-2 h-4 w-4" /> Create New Question
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                        <div className="space-y-3">
                            {sourceQuestions.map(q => (
                                <div key={q._id} className="p-3 bg-white rounded-lg border shadow-sm flex justify-between items-start gap-3 hover:border-blue-300 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                {q.department?.name || 'Unknown'}
                                            </span>
                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                                                {q.section || 'General'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {q.weightage || 1} Pt
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{q.questionText}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => handleAddQuestion(q)}>
                                        <IconPlus size={18} />
                                    </Button>
                                </div>
                            ))}
                            {sourceQuestions.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No active questions found for selection.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel: Template Settings & Preview */}
                <Card className="flex flex-col h-full shadow-md border-0 bg-blue-50/30">
                    <CardHeader className="border-b bg-white">
                        <CardTitle>Paper Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Template Name ({categoryType})</Label>
                                <Input
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder={categoryInfo ? `Assessment for ${categoryInfo.name}` : "Enter Template Name"}
                                    className="font-semibold text-gray-700"
                                />
                                <p className="text-xs text-muted-foreground">Default is {categoryType} name, but you can edit it.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Time Limit (Seconds)</Label>
                                <Input
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value)}
                                />
                            </div>


                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-bold text-sm text-gray-700 mb-3 flex justify-between">
                                <span>Selected Questions ({addedQuestions.length})</span>
                                <span>Total Points: {totalPoints}</span>
                            </h3>
                            <div className="space-y-2">
                                {addedQuestions.map((q, idx) => (
                                    <div key={q._id} className="p-2 bg-white rounded border text-sm flex justify-between items-center gap-2 group">
                                        <span className="font-mono text-gray-400 text-xs w-5">{idx + 1}.</span>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
                                                    {q.department?.name || 'Unknown'}
                                                </span>
                                                <span className="truncate text-xs font-medium">{q.questionText}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveQuestion(q._id)}
                                        >
                                            <IconX size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {addedQuestions.length === 0 && (
                                    <div className="text-xs text-center text-muted-foreground py-4 border-2 border-dashed rounded bg-white/50">
                                        Drag or add questions here
                                    </div>
                                )}
                            </div>
                        </div>

                    </CardContent>
                    <div className="p-4 border-t bg-white">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isSaving}>
                            <IconDeviceFloppy className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : templateId ? "Update Template" : "Save Template"}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Create Question Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Question</DialogTitle>
                        <DialogDescription>Create a question and add it to the bank and this template.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateQuestion} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={qType} onValueChange={setQType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                        <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Section/Topic</Label>
                                <Input value={qSection} onChange={(e) => setQSection(e.target.value)} placeholder="e.g. Safety" />
                            </div>
                            <div className="space-y-2">
                                <Label>Weightage</Label>
                                <Input type="number" min="0.5" step="0.5" value={qWeightage} onChange={(e) => setQWeightage(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Textarea value={qText} onChange={(e) => setQText(e.target.value)} required />
                        </div>

                        {qType === 'MCQ' && (
                            <div className="space-y-3">
                                <Label>Options</Label>
                                {qOptions.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} required />
                                        {qOptions.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}><IconX className="h-4 w-4 text-red-500" /></Button>}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full"><IconPlus className="h-4 w-4 mr-2" /> Add Option</Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Select value={qCorrectAnswer} onValueChange={setQCorrectAnswer}>
                                <SelectTrigger><SelectValue placeholder="Select Correct Answer" /></SelectTrigger>
                                <SelectContent>
                                    {qType === 'MCQ' ? (
                                        qOptions.map((opt, idx) => opt ? <SelectItem key={idx} value={opt}>{opt}</SelectItem> : null)
                                    ) : (
                                        <>
                                            <SelectItem value="True">True</SelectItem>
                                            <SelectItem value="False">False</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreatingQ}>{isCreatingQ ? 'Creating...' : 'Create Question'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CreateQuestionTemplate;

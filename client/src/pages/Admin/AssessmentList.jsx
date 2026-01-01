import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery } from '@/Redux/AllApi/UserApi';
import { useGetAllKnowledgeQuery } from '@/Redux/AllApi/KnowledgeApi';
import { useGetAllSkillsQuery } from '@/Redux/AllApi/SkillApi';
import { useGetAllTemplatesQuery } from '@/Redux/AllApi/TemplateApi';
import { useGetAllAssessmentResultsByUserQuery } from '@/Redux/AllApi/AssessmentResultApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Clock, HelpCircle, BookOpen, GraduationCap } from 'lucide-react';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

const AssessmentList = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: userData, isLoading: isUserLoading } = useGetUserByIdQuery(id);
    const user = userData?.data;
    const deptId = user?.department?._id || user?.department;

    // Fetch all context for the department
    const { data: knowledgeData, isLoading: isKLoading } = useGetAllKnowledgeQuery(deptId, { skip: !deptId });
    const { data: skillData, isLoading: isSLoading } = useGetAllSkillsQuery(deptId, { skip: !deptId });

    // We fetch all templates and filter on frontend for now, 
    // or we could add a specific department template query later.
    const { data: templatesData, isLoading: isTLoading } = useGetAllTemplatesQuery();

    const { data: resultsData, isLoading: isRLoading } = useGetAllAssessmentResultsByUserQuery(id, { skip: !id });
    const completedTemplateIds = useMemo(() => {
        return (resultsData?.data || []).map(r => r.template?._id || r.template);
    }, [resultsData]);

    const isLoading = isUserLoading || isKLoading || isSLoading || isTLoading || isRLoading;

    const availableAssessments = useMemo(() => {
        if (!templatesData?.data || !deptId) return [];

        const allKnowledgeIds = (knowledgeData?.data || []).map(k => k._id);
        const allSkillIds = (skillData?.data || []).map(s => s._id);

        return templatesData.data.filter(t => {
            if (t.categoryType === 'Knowledge') {
                return allKnowledgeIds.includes(t.categoryReference?._id || t.categoryReference);
            }
            if (t.categoryType === 'Skill') {
                return allSkillIds.includes(t.categoryReference?._id || t.categoryReference);
            }
            return false;
        });
    }, [templatesData, knowledgeData, skillData, deptId]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const handleStartAssessment = (templateId) => {
        navigate(`/employee/${id}/questions?templateId=${templateId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 gap-2 text-gray-600 hover:text-gray-900"
                    onClick={() => navigate(`/employee/${id}`)}
                >
                    <IconArrowLeft size={20} />
                    Back to Employee Profile
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Assessments</h1>
                    <p className="text-gray-500 mt-2">
                        Evaluations for <span className="font-semibold text-gray-900">{user?.fullName || 'the employee'}</span> in {user?.department?.name || 'their department'}.
                    </p>
                </div>

                {availableAssessments.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {availableAssessments.map((tpl) => (
                            <Card key={tpl._id} className="hover:shadow-lg transition-all duration-300 border-none group overflow-hidden">
                                <CardHeader className={`pb-4 ${tpl.categoryType === 'Knowledge' ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tpl.categoryType === 'Knowledge' ? 'bg-amber-200 text-amber-800' : 'bg-indigo-200 text-indigo-800'
                                            }`}>
                                            {tpl.categoryType}
                                        </div>
                                        {tpl.categoryType === 'Knowledge' ? <BookOpen size={18} className="text-amber-600" /> : <GraduationCap size={18} className="text-indigo-600" />}
                                    </div>
                                    <CardTitle className="text-xl line-clamp-1">{tpl.name}</CardTitle>
                                    <CardDescription className="text-xs">
                                        Subject: {tpl.categoryReference?.name || 'Unknown'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Clock size={16} />
                                                <span>Duration</span>
                                            </div>
                                            <span className="font-semibold">{tpl.timeLimit} mins</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <HelpCircle size={16} />
                                                <span>Questions</span>
                                            </div>
                                            <span className="font-semibold">{tpl.questions?.length || 0} items</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button
                                        className={`w-full gap-2 shadow-sm transition-all group-hover:gap-3 ${tpl.categoryType === 'Knowledge'
                                            ? 'bg-amber-600 hover:bg-amber-700'
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                        onClick={() => handleStartAssessment(tpl._id)}
                                    >
                                        {completedTemplateIds.includes(tpl._id) ? "Edit Evaluation" : "Start Assessment"}
                                        <IconArrowRight size={16} />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No Assessments Assigned</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            There are currently no knowledge or skill assessments available for the {user?.department?.name || 'employee\'s'} department.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentList;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDepartmentByIdQuery } from '@/Redux/AllApi/DepartmentApi';
import { useGetAllKnowledgeQuery, useCreateKnowledgeMutation } from '@/Redux/AllApi/KnowledgeApi';
import { useGetAllSkillsQuery, useCreateSkillMutation } from '@/Redux/AllApi/SkillApi';
import { useGetTemplatesByCategoryQuery } from '@/Redux/AllApi/TemplateApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, BookOpen, GraduationCap, Plus, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const DepartmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: deptData, isLoading: isDeptLoading } = useGetDepartmentByIdQuery(id);

    const [activeTab, setActiveTab] = useState('knowledge');

    if (isDeptLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const department = deptData?.data;

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
            <Button
                variant="ghost"
                onClick={() => navigate('/admin/departments')}
                className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft size={16} className="mr-2" /> Back to Departments
            </Button>

            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900">{department?.name}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
                    {department?.description || 'Manage educational content and skill assessments for this department.'}
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 p-1 bg-gray-100 rounded-lg">
                    <TabsTrigger value="knowledge" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen size={16} /> Knowledge
                    </TabsTrigger>
                    <TabsTrigger value="skill" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <GraduationCap size={16} /> Skill
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="knowledge" className="space-y-6">
                    <CategorySection type="Knowledge" departmentId={id} />
                </TabsContent>

                <TabsContent value="skill" className="space-y-6">
                    <CategorySection type="Skill" departmentId={id} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const CategorySection = ({ type, departmentId }) => {
    const navigate = useNavigate();
    const { data: categories, isLoading } = type === 'Knowledge'
        ? useGetAllKnowledgeQuery(departmentId)
        : useGetAllSkillsQuery(departmentId);

    const [createKnowledge] = useCreateKnowledgeMutation();
    const [createSkill] = useCreateSkillMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) return toast.error("Name is required");
        try {
            const body = { name, description: desc, department: departmentId };
            if (type === 'Knowledge') await createKnowledge(body).unwrap();
            else await createSkill(body).unwrap();

            toast.success(`${type} subject created successfully`);
            setIsDialogOpen(false);
            setName('');
            setDesc('');
        } catch (error) {
            toast.error(error?.data?.message || `Failed to create ${type.toLowerCase()}`);
        }
    };

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">{type} Subjects</h2>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm" className="gap-2">
                    <Plus size={16} /> Add {type}
                </Button>
            </div>

            <div className="grid gap-4">
                {categories?.data?.map((cat) => (
                    <CategoryCard key={cat._id} category={cat} type={type} departmentId={departmentId} />
                ))}

                {(!categories?.data || categories.data.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-muted-foreground">No {type.toLowerCase()} subjects found in this department.</p>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add {type} Subject</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. ${type === 'Knowledge' ? 'Safety Protocols' : 'Forklift Operation'}`} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief overview of the subject" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Add Subject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const CategoryCard = ({ category, type, departmentId }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: templates, isLoading } = useGetTemplatesByCategoryQuery({
        categoryType: type,
        categoryReference: category._id
    }, { skip: !isExpanded });

    return (
        <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <div
                className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type === 'Knowledge' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {type === 'Knowledge' ? <BookOpen size={20} /> : <GraduationCap size={20} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description || 'No description provided.'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/template/${type}/${category._id}/create`);
                        }}
                    >
                        <Plus size={14} /> New Paper
                    </Button>
                    <ChevronRight
                        size={20}
                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                </div>
            </div>

            {isExpanded && (
                <CardContent className="pt-4 pb-6 bg-white border-t">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Question Papers</h4>
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {templates?.data?.map((tpl) => (
                                <div
                                    key={tpl._id}
                                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group flex flex-col justify-between"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-1.5 rounded-md bg-white border shadow-xs">
                                            <FileText size={16} className="text-blue-500" />
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {tpl.questions?.length || 0} Qs
                                        </span>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-sm text-gray-900 line-clamp-1">{tpl.name}</h5>
                                        <p className="text-[11px] text-muted-foreground mt-1">{tpl.timeLimit} mins limit</p>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 mt-3 text-xs justify-start opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => navigate(`/admin/template/view/${tpl._id}`)}
                                    >
                                        View Details →
                                    </Button>
                                </div>
                            ))}

                            {(!templates?.data || templates.data.length === 0) && (
                                <div className="col-span-full py-6 text-center text-sm text-gray-400 bg-gray-50/50 rounded-xl border border-dashed">
                                    No question papers created for this subject yet.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

export default DepartmentDetail;

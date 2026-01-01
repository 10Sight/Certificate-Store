import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllDepartmentsQuery, useCreateDepartmentMutation, useDeleteDepartmentMutation } from '@/Redux/AllApi/DepartmentApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, Building2, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const DepartmentManager = () => {
    const navigate = useNavigate();
    const { data: departments, isLoading } = useGetAllDepartmentsQuery();
    const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
    const [deleteDepartment] = useDeleteDepartmentMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deptName, setDeptName] = useState('');
    const [deptDesc, setDeptDesc] = useState('');

    const handleCreate = async () => {
        if (!deptName.trim()) return toast.error("Department name is required");
        try {
            await createDepartment({ name: deptName, description: deptDesc }).unwrap();
            toast.success("Department created successfully");
            setIsDialogOpen(false);
            setDeptName('');
            setDeptDesc('');
        } catch (error) {
            toast.error(error?.data?.message || "Failed to create department");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        try {
            await deleteDepartment(id).unwrap();
            toast.success("Department deleted successfully");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete department");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Departments</h1>
                    <p className="text-muted-foreground mt-1">Manage organization units and their knowledge/skill assessments.</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-sm">
                    <Plus size={18} /> Add Department
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments?.data?.map((dept) => (
                    <Card
                        key={dept._id}
                        className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500"
                        onClick={() => navigate(`/admin/department/${dept._id}`)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">{dept.name}</CardTitle>
                            <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {dept.description || 'No description provided.'}
                            </p>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                                    Manage Content <ArrowRight size={12} />
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => handleDelete(dept._id, e)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {(!departments?.data || departments.data.length === 0) && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl mt-8">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No Departments Found</h3>
                    <p className="text-muted-foreground">Start by creating your first department.</p>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Department</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="e.g. Assembly, Quality Control"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description (Optional)</Label>
                            <Input
                                id="desc"
                                value={deptDesc}
                                onChange={(e) => setDeptDesc(e.target.value)}
                                placeholder="Describe the department's role"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DepartmentManager;

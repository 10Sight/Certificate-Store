import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import SkillCard from '@/components/common/SkillCard';
import FeedbackCard from '@/components/common/FeedbackCard';
import { useGetUserByIdQuery } from '../../Redux/AllApi/UserApi';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: userData, isLoading, isError } = useGetUserByIdQuery(id);
    const user = userData?.data; // According to ApiResponse structure, data is in userData.data

    if (isLoading) return <div className="p-6">Loading...</div>;
    if (isError || !user) return <div className="p-6 text-red-500">Error loading employee details.</div>;

    const employeeData = {
        personalInfo: {
            name: user.fullName,
            iCardNo: user.iCardNumber || "N/A",
            doj: new Date(user.dateOfJoining).toLocaleDateString('en-GB'), // DD/MM/YYYY format
            type: user.employmentType || user.role, // Fallback to role if employment type missing
            image: user.profilePhotoUrl?.url || null,
            email: user.email,
            mobile: user.phoneNumber,
        },
        _id: user._id, // Add ID for sub-navigation
        skillMatrix: user.skillMatrix && user.skillMatrix.length > 0 ? user.skillMatrix : [
            // Fallback default list if empty, or just show empty. 
            // Better to show empty so we know it works.
            // Or if user wants a template, we can provide one. 
            // Let's use blank if empty for now, as dynamic processes are being added.
        ],
        trainingHistory: user.trainingHistory || []
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <IconArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Employee Details</h1>
            </div>

            <div className="flex bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-6xl mx-auto gap-6 items-center">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                    {user.profilePhotoUrl?.url ? (
                        <img src={user.profilePhotoUrl.url} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-2xl">
                            {user.fullName?.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4 w-full">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="font-semibold text-lg">{user.fullName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Employee ID</p>
                        <p className="font-semibold">{user.iCardNumber || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Designation</p>
                        <p className="font-semibold">{user.role}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="font-semibold">{user.email || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                        <p className="font-semibold">{user.mobile || user.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Employment Type</p>
                        <p className="font-semibold">{user.employmentType || "Permanent"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 place-items-start max-w-[1600px] mx-auto pb-10">
                <div className="w-full h-full">
                    <SkillCard employeeData={employeeData} />
                </div>
                <div className="w-full h-full">
                    <FeedbackCard employeeData={employeeData} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetail;

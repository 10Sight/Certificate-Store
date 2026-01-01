import React from 'react';
import { useSelector } from 'react-redux';
import { useGetUserByIdQuery } from '@/Redux/AllApi/UserApi';
import SkillCard from '@/components/common/SkillCard';
import FeedbackCard from '@/components/common/FeedbackCard';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';

const EmployeeDashboard = () => {
    const { user: authUser } = useSelector((state) => state.auth);

    const { data: userData, isLoading, isError } = useGetUserByIdQuery(authUser?._id, {
        skip: !authUser?._id
    });

    const user = userData?.data;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <IconLoader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-gray-500 font-medium">Loading your profile...</p>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-red-500">
                <IconAlertCircle className="h-12 w-12" />
                <p className="text-lg font-semibold">Error loading your details</p>
                <p className="text-sm text-gray-400">Please try again later or contact support.</p>
            </div>
        );
    }

    const employeeData = {
        personalInfo: {
            name: user.fullName,
            iCardNo: user.iCardNumber || "N/A",
            doj: new Date(user.dateOfJoining).toLocaleDateString('en-GB'),
            type: user.employmentType || user.role,
            image: user.profilePhotoUrl?.url || null,
            email: user.email,
            mobile: user.mobile || user.phoneNumber,
        },
        _id: user._id,
        skillMatrix: user.skillMatrix || [],
        trainingHistory: user.trainingHistory || []
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.fullName}!</h2>
                <p className="text-gray-500">View your training progress and feedback below.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 place-items-start pb-10">
                <div className="w-full">
                    <SkillCard employeeData={employeeData} />
                </div>
                <div className="w-full">
                    <FeedbackCard employeeData={employeeData} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;

import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IconSettings, IconUsers, IconUpload } from '@tabler/icons-react'
import SkillCard from '@/components/common/SkillCard'
import FileUploadAction from '@/components/common/FileUploadAction'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useUploadSkillFileMutation } from '../Redux/AllApi/UploadApi'
import { toast } from 'sonner'

const Home = () => {
  const [uploadSkillFile, { isLoading: isUploading }] = useUploadSkillFileMutation();

  const handleFileSelect = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadSkillFile(formData).unwrap();
      toast.success(`Skill uploaded for ${response.data.user} (Line ${response.data.line})`);
      console.log('Upload success:', response);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error?.data?.message || 'File upload failed');
    }
  };

  const { user } = useSelector(state => state.auth);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const currentEmployeeData = {
    personalInfo: {
      name: user?.fullName || "Guest User",
      iCardNo: user?.iCardNumber || user?._id || "N/A",
      doj: formatDate(user?.dateOfJoining),
      type: user?.employmentType || "CASUAL",
      image: user?.profilePhotoUrl?.url || null,
    },
    skillMatrix: user?.skillMatrix?.length > 0 ? user.skillMatrix : [
      { name: "MANUAL ASSY/GREASING", skills: [0, 0, 0] },
      { name: "SCREW TIGHTENING", skills: [0, 0, 0] },
      { name: "CONTACT HEIGHT CHECKING", skills: [0, 0, 0] },
      { name: "CONTACT GAP TESTING", skills: [0, 0, 0] },
      { name: "PRE TESTING", skills: [0, 0, 0] },
    ],
    trainingHistory: user?.trainingHistory || []
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="flex flex-col h-full shadow-md border-gray-200/60 overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <IconUpload className="h-5 w-5" />
                  </div>
                  Upload Operations
                </CardTitle>
                <CardDescription className="mt-1">
                  Upload skill matrices and certificates securely
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-6 space-y-6">
            {/* Upload Area */}
            <div className="p-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 hover:bg-blue-50/50 transition-colors group">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <IconUpload className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Click to Upload File</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Supports PDF, PNG, JPG (Max 5MB)
                  </p>
                </div>
                <FileUploadAction
                  title={isUploading ? "Uploading..." : "Select File"}
                  description={""}
                  icon={IconUpload}
                  onFileSelect={handleFileSelect}
                  color='blue'
                  className="w-full max-w-xs mt-2"
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semi-bold text-amber-800">
                <IconSettings className="h-4 w-4" />
                Naming Convention Required
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                To ensure automatic processing, filenames must strictly follow this format:
              </p>
              <div className="bg-white/60 p-2 rounded border border-amber-200 text-xs font-mono text-amber-900 text-center">
                LINE-MOBILE-PROCESS.extension
              </div>
              <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside bg-white/40 p-2 rounded">
                <li>Example: <code className="bg-white px-1 rounded">L1-9876543210-WELDING.pdf</code></li>
                <li>Line Number: L1, L2, etc.</li>
                <li>Mobile: 10-digit registered number</li>
                <li>Process: Valid process name (e.g., WELDING)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Skill Card Preview
            </CardTitle>
            <CardDescription>Visual representation of employee skills</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center bg-gray-50 p-6">
            <SkillCard employeeData={currentEmployeeData} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default Home
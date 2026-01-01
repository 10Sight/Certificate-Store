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

  const handleFileSelect = async (files) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('files', files);
    }

    try {
      const response = await uploadSkillFile(formData).unwrap();
      const successCount = response.data.results.length;
      const errorCount = response.data.errors.length;

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} skill files`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} files failed to upload. Check console for details.`);
        console.error('Upload errors:', response.data.errors);
      }
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Upload Section */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="shadow-sm border-gray-200 overflow-hidden rounded-xl h-full flex flex-col bg-white">
            <CardHeader className="bg-gray-50/50 border-b pb-6 px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm border border-gray-200 rounded-xl text-gray-600">
                  <IconUpload size={28} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                    Quick Upload
                  </CardTitle>
                  <CardDescription className="text-gray-500 font-medium">
                    Update skill matrix in bulk
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-8 space-y-8">
              <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 hover:bg-gray-50 transition-all duration-300 hover:border-gray-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:scale-105 transition-all">
                    <IconUpload size={48} className="text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-800">Choose Operations</h3>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      Select multiple files at once
                    </p>
                  </div>
                  <FileUploadAction
                    title={isUploading ? "Processing..." : "Pick Files"}
                    description={""}
                    icon={IconUpload}
                    onFileSelect={handleFileSelect}
                    color='gray'
                    className="mt-4 w-full"
                    disabled={isUploading}
                    multiple={true}
                  />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-tight">
                  <IconSettings size={18} className="text-gray-500" />
                  Format Protocol
                </h4>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm font-bold text-gray-800 text-center shadow-sm">
                  LINE-MOBILE-PROCESS.ext
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Example:</p>
                  <div className="bg-gray-100 p-2 rounded-lg text-[10px] font-mono font-bold text-gray-600 border border-gray-200 line-clamp-1">
                    L1-9876543210-WELDING.pdf
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview Section */}
        <div className="xl:col-span-8">
          <Card className="shadow-lg border-gray-200/60 rounded-2xl overflow-hidden h-full flex flex-col">
            <CardHeader className="bg-white border-b px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100/50 rounded-xl text-emerald-600">
                    <IconUsers size={24} />
                  </div>
                  <CardTitle className="text-xl font-black text-gray-900 tracking-tight">
                    Skill Card Preview
                  </CardTitle>
                </div>
                <div className="hidden md:block">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Document Preview</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 bg-gray-50/50 p-4 md:p-8 flex items-start justify-center overflow-auto custom-scrollbar">
              <div className="w-full max-w-4xl transform scale-90 md:scale-100 transition-transform duration-500 origin-top">
                <SkillCard employeeData={currentEmployeeData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
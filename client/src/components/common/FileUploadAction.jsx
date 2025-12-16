import React, { useRef } from 'react';

const FileUploadAction = ({ title, description, icon: Icon, onFileSelect, accept = "*", color = "blue" }) => {
    const fileInputRef = useRef(null);

    const colorClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
    };

    const current = colorClasses[color] || colorClasses.blue;

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
        // Reset input so the same file can be selected again if needed
        e.target.value = '';
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />
            <div
                onClick={handleClick}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${current.bg} ${current.border}`}
            >
                <div className={`p-2 rounded-md bg-white mr-3 ${current.text}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className={`font-medium text-sm ${current.text}`}>{title}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
        </>
    );
};

export default FileUploadAction;

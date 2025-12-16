import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserUpdateMutation } from '@/Redux/AllApi/UserApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { IconPrinter } from '@tabler/icons-react';

const SkillLevelIndicator = ({ level }) => {
    // level: 0 = blank, 1 = 1 quarter, 2 = 2 quarters, 3 = 3 quarters, 4 = full
    const getPath = () => {
        return (
            <svg width="20" height="20" viewBox="0 0 100 100" className="border rounded-full border-black">
                <circle cx="50" cy="50" r="48" fill="none" stroke="black" strokeWidth="2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="black" strokeWidth="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="black" strokeWidth="2" />

                {/* Top Left */}
                {level >= 1 && <path d="M50,50 L50,0 A50,50 0 0,0 0,50 Z" fill="black" />}
                {/* Bottom Left */}
                {level >= 2 && <path d="M50,50 L0,50 A50,50 0 0,0 50,100 Z" fill="black" />}
                {/* Top Right */}
                {level >= 3 && <path d="M50,50 L50,0 A50,50 0 0,1 100,50 Z" fill="black" />}
                {/* Bottom Right */}
                {level >= 4 && <path d="M50,50 L100,50 A50,50 0 0,1 50,100 Z" fill="black" />}
            </svg>
        );
    };

    return getPath();
};

const SkillCard = ({ employeeData }) => {
    if (!employeeData) return null;

    const {
        _id,
        personalInfo,
        skillMatrix = [],
        trainingHistory: initialHistory = []
    } = employeeData;

    const {
        name,
        iCardNo,
        doj,
        type, // Per/Casual
        image
    } = personalInfo || {};

    const [history, setHistory] = useState(initialHistory);
    const [updateUser, { isLoading }] = useUserUpdateMutation();


    useEffect(() => {
        setHistory(initialHistory);
    }, [initialHistory]);

    const handleHistoryChange = (index, field, value) => {
        const newHistory = [...history];
        newHistory[index] = { ...newHistory[index], [field]: value };
        setHistory(newHistory);
    };



    const handleAddRow = () => {
        setHistory([...history, { name: "", id: "", amendment: "", date: "", prodIncharge: "", trgIncharge: "" }]);
    };

    const handleSaveHistory = async () => {
        try {
            await updateUser({ id: _id, body: { trainingHistory: history } }).unwrap();
            toast.success("Training history saved successfully");
        } catch (error) {
            console.error("Failed to save history:", error);
            toast.error("Failed to save history");
        }
    };

    const { user: currentUser } = useSelector((state) => state.auth);
    const isAdmin = currentUser?.role === 'ADMIN';

    // Calculate empty rows needed for visual consistency (min 12 rows total displayed)
    const emptyRowsCount = Math.max(0, 12 - history.length);

    return (
        <div id="printable-area" className="space-y-8 print:space-y-4">

            {/* CARD 1: SKILL MATRIX */}
            <Card className="w-full max-w-4xl mx-auto p-4 bg-white shadow-lg print:shadow-none print:break-after-page">
                <CardContent className="p-0">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row border-2 border-black">
                        {/* Info Table */}
                        <div className="flex-grow">
                            <div className="border-b border-black bg-gray-200 p-1 text-center font-bold text-sm">ASSOCIATE SKILL CARD UMRPL (MANESAR)</div>
                            <div className="grid grid-cols-[120px_1fr] border-b border-black">
                                <div className="p-1 font-bold border-r border-black bg-gray-100 text-sm">NAME :-</div>
                                <div className="p-1 font-medium uppercase text-sm">{name}</div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] border-b border-black">
                                <div className="p-1 font-bold border-r border-black bg-gray-100 text-sm">I CARD NO :-</div>
                                <div className="p-1 font-medium uppercase text-sm">{iCardNo}</div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] border-b border-black">
                                <div className="p-1 font-bold border-r border-black bg-gray-100 text-sm">D.O.J :-</div>
                                <div className="p-1 font-medium text-sm">{doj}</div>
                            </div>
                            <div className="grid grid-cols-[120px_1fr]">
                                <div className="p-1 font-bold border-r border-black bg-gray-100 text-sm">PER./CASUAL :-</div>
                                <div className="p-1 font-medium uppercase text-sm">{type}</div>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="w-full md:w-32 border-t md:border-t-0 md:border-l border-black flex items-center justify-center p-1">
                            {image ? (
                                <img src={image} alt={name} className="h-24 w-24 object-cover border border-gray-300" />
                            ) : (
                                <div className="h-24 w-24 bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] text-center">
                                    PHOTO
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skill Matrix Table */}
                    <div className="mt-4 border-2 border-black overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th rowSpan="2" className="border border-black p-1 w-10 text-center">SR. NO</th>
                                    <th rowSpan="2" className="border border-black p-1 text-left">PROCESS NAME</th>
                                    <th colSpan="3" className="border border-black p-1 text-center">Line No's</th>
                                </tr>
                                <tr className="bg-gray-50">
                                    <th className="border border-black p-1 w-12 text-center">1</th>
                                    <th className="border border-black p-1 w-12 text-center">2</th>
                                    <th className="border border-black p-1 w-12 text-center">3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {skillMatrix.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-1 text-center">{index + 1}</td>
                                        <td className="border border-black p-1 font-medium">{item.name}</td>
                                        {/* Render 3 columns for skill levels. Assuming item.skills is an array of levels like [3, 2, 0] */}
                                        {[0, 1, 2].map((colIdx) => (
                                            <td key={colIdx} className="border border-black p-1 text-center">
                                                <div className="flex justify-center">
                                                    <SkillLevelIndicator level={item.skills?.[colIdx] || 0} />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {/* Fill empty rows */}
                                {Array.from({ length: Math.max(0, 10 - skillMatrix.length) }).map((_, idx) => (
                                    <tr key={`empty-${idx}`}>
                                        <td className="border border-black p-1 text-center">{skillMatrix.length + idx + 1}</td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"><div className="flex justify-center"><SkillLevelIndicator level={0} /></div></td>
                                        <td className="border border-black p-1"><div className="flex justify-center"><SkillLevelIndicator level={0} /></div></td>
                                        <td className="border border-black p-1"><div className="flex justify-center"><SkillLevelIndicator level={0} /></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* CARD 2: TRAINING HISTORY */}
            <Card className="w-full max-w-4xl mx-auto p-4 bg-white shadow-lg print:shadow-none">
                <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-lg underline">TRAINING HISTORY</div>
                        <div className="print:hidden flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => window.print()}>
                                <IconPrinter className="h-4 w-4 mr-1" />
                                Print
                            </Button>
                            {isAdmin && (
                                <>
                                    <Button size="sm" variant="outline" onClick={handleAddRow}>Add Row</Button>
                                    <Button size="sm" onClick={handleSaveHistory} disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Save History"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="border-2 border-black overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1 w-10 text-center">SR. NO</th>
                                    <th className="border border-black p-1 text-left">PROCESS NAME</th>
                                    <th className="border border-black p-1 w-20 text-center">ID</th>
                                    <th className="border border-black p-1 w-20 text-center">AMENDMENT</th>
                                    <th className="border border-black p-1 w-24 text-center">DATE</th>
                                    <th className="border border-black p-1 w-24 text-center">PROD. INCHARGE</th>
                                    <th className="border border-black p-1 w-24 text-center">TRG. INCHARGE</th>
                                    <th className="border border-black p-1 w-24 text-center">FILES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-1 text-center">{index + 1}</td>
                                        <td className="border border-black p-0">
                                            <input
                                                className="w-full h-full p-1 border-none focus:outline-none focus:bg-blue-50 disabled:bg-transparent"
                                                value={item.name}
                                                onChange={(e) => handleHistoryChange(index, 'name', e.target.value)}
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="border border-black p-0">
                                            <input
                                                className="w-full h-full p-1 text-center border-none focus:outline-none focus:bg-blue-50 disabled:bg-transparent"
                                                value={item.id}
                                                onChange={(e) => handleHistoryChange(index, 'id', e.target.value)}
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="border border-black p-0">
                                            <input
                                                className="w-full h-full p-1 text-center border-none focus:outline-none focus:bg-blue-50 disabled:bg-transparent"
                                                value={item.amendment}
                                                onChange={(e) => handleHistoryChange(index, 'amendment', e.target.value)}
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="border border-black p-0">
                                            <input
                                                className="w-full h-full p-1 text-center border-none focus:outline-none focus:bg-blue-50 disabled:bg-transparent"
                                                value={item.date}
                                                onChange={(e) => handleHistoryChange(index, 'date', e.target.value)}
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="border border-black p-0">
                                            <input
                                                className="w-full h-full p-1 text-center border-none focus:outline-none focus:bg-blue-50 disabled:bg-transparent"
                                                value={item.prodIncharge}
                                                onChange={(e) => handleHistoryChange(index, 'prodIncharge', e.target.value)}
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="border border-black p-0">
                                            <input
                                                className="w-full h-full p-1 text-center border-none focus:outline-none focus:bg-blue-50 disabled:bg-transparent"
                                                value={item.trgIncharge}
                                                onChange={(e) => handleHistoryChange(index, 'trgIncharge', e.target.value)}
                                                disabled={!isAdmin}
                                            />
                                        </td>
                                        <td className="border border-black p-1 text-center flex items-center justify-center gap-2">
                                            {item.fileUrl && (
                                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                                    View
                                                </a>
                                            )}

                                        </td>
                                    </tr>
                                ))}
                                {/* Fill empty rows */}
                                {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                                    <tr key={`empty-hist-${idx}`}>
                                        <td className="border border-black p-1 text-center">{history.length + idx + 1}</td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"></td>
                                        <td className="border border-black p-1"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend Section */}
                    <div className="mt-2 border-2 border-black p-2 text-xs">
                        <div className="font-bold mb-1">Legends:</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <div className="flex items-center gap-2"><SkillLevelIndicator level={0} /> <span>BLANK</span></div>
                            <div className="flex items-center gap-2"><SkillLevelIndicator level={1} /> <span>Under OJT</span></div>
                            <div className="flex items-center gap-2"><SkillLevelIndicator level={2} /> <span>Able to work with guidance</span></div>
                            <div className="flex items-center gap-2"><SkillLevelIndicator level={3} /> <span>Able to work Independently</span></div>
                            <div className="flex items-center gap-2"><SkillLevelIndicator level={4} /> <span>Train to other Associates</span></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default SkillCard;

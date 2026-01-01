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
            <Card className="w-full max-w-5xl mx-auto bg-white shadow-md border border-gray-100 rounded-xl overflow-hidden print:shadow-none print:rounded-none print:break-after-page print:border-0">
                <CardContent className="p-0">
                    {/* Header Section */}
                    <div className="bg-gray-50 border-b border-gray-200 p-6 print:bg-white print:border-b-2 print:border-black">
                        <div className="flex justify-between items-center text-gray-800 print:text-black">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight uppercase leading-none">Associate Skill Card</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Certification Performance Matrix</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-gray-600 font-mono uppercase tracking-widest print:text-black">UMRPL (MANESAR)</span>
                                <div className="h-1 w-12 bg-gray-400 ml-auto mt-2 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 print:p-0">
                        <div className="flex flex-col md:flex-row gap-10 print:block">
                            {/* Info Grid */}
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 print:grid-cols-2 print:gap-2 print:mb-4">
                                <div className="space-y-1.5 border-b border-gray-100 pb-3 md:border-0 print:border-b print:border-black">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Associate Name</label>
                                    <div className="font-bold text-gray-900 text-xl uppercase tracking-tight print:text-sm">{name || '-'}</div>
                                </div>
                                <div className="space-y-1.5 border-b border-gray-100 pb-3 md:border-0 print:border-b print:border-black">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Identity Card No</label>
                                    <div className="font-bold text-gray-900 text-xl uppercase tracking-tight print:text-sm">{iCardNo || '-'}</div>
                                </div>
                                <div className="space-y-1.5 border-b border-gray-100 pb-3 md:border-0 print:border-b print:border-black">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Date of Joining</label>
                                    <div className="font-bold text-gray-700 text-lg print:text-sm">{doj || '-'}</div>
                                </div>
                                <div className="space-y-1.5 border-b border-gray-100 pb-3 md:border-0 print:border-b print:border-black">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Employment Tenure</label>
                                    <div className="font-bold text-gray-700 text-lg uppercase print:text-sm">{type || '-'}</div>
                                </div>
                            </div>

                            {/* Image Section */}
                            <div className="w-full md:w-48 flex-shrink-0 flex justify-center md:justify-end print:w-32 print:float-right print:ml-4">
                                {image ? (
                                    <div className="p-1 bg-gray-100 rounded-xl shadow-sm">
                                        <img
                                            src={image}
                                            alt={name}
                                            className="h-36 w-36 object-cover rounded-lg border-2 border-white print:border-2 print:border-black print:rounded-none transition-transform duration-500 hover:scale-[1.02]"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-36 w-36 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 print:border-2 print:border-black print:rounded-none">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">NO PHOTO</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skill Matrix Table */}
                        <div className="mt-12 print:mt-4 overflow-hidden rounded-xl border border-gray-200 shadow-sm print:border-black print:rounded-none">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-50 text-gray-700 print:bg-gray-100 print:text-black">
                                    <tr>
                                        <th rowSpan="2" className="border-r border-gray-200 py-4 px-4 w-12 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">SR.</th>
                                        <th rowSpan="2" className="border-r border-gray-200 py-4 px-6 text-left font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Process Methodology</th>
                                        <th colSpan="3" className="border-b border-gray-200 py-3 px-6 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Certification Levels</th>
                                    </tr>
                                    <tr className="bg-gray-50/50">
                                        <th className="border-r border-gray-200 py-2 w-24 text-center text-[10px] font-bold uppercase tracking-widest print:border-black print:p-1">Level 01</th>
                                        <th className="border-r border-gray-200 py-2 w-24 text-center text-[10px] font-bold uppercase tracking-widest print:border-black print:p-1">Level 02</th>
                                        <th className="py-2 w-24 text-center text-[10px] font-bold uppercase tracking-widest print:border-black print:p-1">Level 03</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white print:bg-transparent">
                                    {skillMatrix.length > 0 ? skillMatrix.map((item, index) => (
                                        <tr key={index} className="hover:bg-indigo-50/30 transition-colors border-b border-gray-50 print:hover:bg-transparent print:border-black">
                                            <td className="border-r border-gray-50 py-4 px-6 text-center text-gray-400 font-black text-xs print:border-black print:text-black print:p-1">{String(index + 1).padStart(2, '0')}</td>
                                            <td className="border-r border-gray-50 py-4 px-6 font-bold text-gray-800 uppercase tracking-tight print:border-black print:p-1">{item.name}</td>
                                            {[0, 1, 2].map((colIdx) => (
                                                <td key={colIdx} className="border-r border-gray-50 py-3 px-4 text-center last:border-r-0 print:border-black print:p-1">
                                                    <div className="flex justify-center scale-110 print:scale-100 transition-transform duration-300 hover:scale-125">
                                                        <SkillLevelIndicator level={item.skills?.[colIdx] || 0} />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    )) : (
                                        // Empty Placeholder if no skill matrix
                                        Array.from({ length: 5 }).map((_, idx) => (
                                            <tr key={`empty-p-${idx}`} className="border-b border-gray-50 print:border-black">
                                                <td className="border-r border-gray-50 py-5 px-6 text-center text-gray-200 font-black text-xs print:border-black print:p-1">{String(idx + 1).padStart(2, '0')}</td>
                                                <td className="border-r border-gray-50 py-5 px-6 print:border-black print:p-1">
                                                    <div className="h-2 w-32 bg-gray-50 rounded-full animate-pulse"></div>
                                                </td>
                                                {[0, 1, 2].map(i => (
                                                    <td key={i} className="border-r border-gray-50 py-4 px-4 text-center last:border-r-0 print:border-black print:p-1">
                                                        <div className="flex justify-center opacity-5 print:opacity-100">
                                                            <SkillLevelIndicator level={0} />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CARD 2: TRAINING HISTORY */}
            <Card className="w-full max-w-5xl mx-auto bg-white shadow-md border border-gray-100 rounded-xl overflow-hidden print:shadow-none print:rounded-none print:border-0">
                <CardContent className="p-0">
                    <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center print:bg-white print:border-b-2 print:border-black">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight uppercase leading-none text-gray-800">Training History</h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Chronological Competency Log</p>
                            </div>
                            <div className="print:hidden flex items-center gap-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold uppercase text-[10px] tracking-widest px-4 h-9"
                                    onClick={() => window.print()}
                                >
                                    <IconPrinter className="h-4 w-4 mr-2" />
                                    Print PDF
                                </Button>
                                {isAdmin && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-bold uppercase text-[10px] tracking-widest px-4 h-9"
                                            onClick={handleAddRow}
                                        >
                                            Add Row
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="bg-gray-900 hover:bg-black text-white font-bold uppercase text-[10px] tracking-widest px-6 h-9 shadow-sm"
                                            onClick={handleSaveHistory}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 print:p-0">
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm print:border-black print:rounded-none">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-50 text-gray-700 print:bg-gray-100 print:text-black">
                                    <tr>
                                        <th className="border-r border-gray-200 py-4 px-4 w-12 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">#</th>
                                        <th className="border-r border-gray-200 py-4 px-6 text-left font-bold uppercase text-[10px] tracking-widest min-w-[200px] print:border-black print:p-1">Process Identification</th>
                                        <th className="border-r border-gray-200 py-4 px-2 w-24 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Doc ID</th>
                                        <th className="border-r border-gray-200 py-4 px-2 w-24 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Amend.</th>
                                        <th className="border-r border-gray-200 py-4 px-4 w-32 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Certification Date</th>
                                        <th className="border-r border-gray-200 py-4 px-2 w-32 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Prod. Incharge</th>
                                        <th className="border-r border-gray-200 py-4 px-2 w-32 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Trg. Incharge</th>
                                        <th className="py-4 px-2 w-24 text-center font-bold uppercase text-[10px] tracking-widest print:border-black print:p-1">Artifact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, index) => (
                                        <tr key={index} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 print:hover:bg-transparent print:border-black">
                                            <td className="border-r border-gray-100 py-3 px-4 text-center text-gray-400 font-bold text-xs print:border-black print:p-1">{String(index + 1).padStart(2, '0')}</td>
                                            <td className="border-r border-gray-100 p-0 print:border-black">
                                                <input
                                                    className="w-full h-full py-4 px-6 border-none bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-gray-200 transition-all font-bold text-gray-800 uppercase tracking-tight placeholder-gray-200"
                                                    value={item.name}
                                                    onChange={(e) => handleHistoryChange(index, 'name', e.target.value)}
                                                    disabled={!isAdmin}
                                                    placeholder={isAdmin ? "ENTER PROCESS NAME..." : ""}
                                                />
                                            </td>
                                            <td className="border-r border-gray-100 p-0 print:border-black">
                                                <input
                                                    className="w-full h-full py-4 px-2 text-center border-none bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-gray-200 font-bold text-gray-600"
                                                    value={item.id}
                                                    onChange={(e) => handleHistoryChange(index, 'id', e.target.value)}
                                                    disabled={!isAdmin}
                                                />
                                            </td>
                                            <td className="border-r border-gray-100 p-0 print:border-black">
                                                <input
                                                    className="w-full h-full py-4 px-2 text-center border-none bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-gray-200 font-bold text-gray-600"
                                                    value={item.amendment}
                                                    onChange={(e) => handleHistoryChange(index, 'amendment', e.target.value)}
                                                    disabled={!isAdmin}
                                                />
                                            </td>
                                            <td className="border-r border-gray-100 p-0 print:border-black">
                                                <input
                                                    type="date"
                                                    className="w-full h-full py-4 px-4 text-center border-none bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-gray-200 font-bold text-xs text-gray-600 tracking-tighter"
                                                    value={item.date}
                                                    onChange={(e) => handleHistoryChange(index, 'date', e.target.value)}
                                                    disabled={!isAdmin}
                                                />
                                            </td>
                                            <td className="border-r border-gray-100 p-0 print:border-black">
                                                <input
                                                    className="w-full h-full py-4 px-2 text-center border-none bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-gray-200 font-bold text-gray-700"
                                                    value={item.prodIncharge}
                                                    onChange={(e) => handleHistoryChange(index, 'prodIncharge', e.target.value)}
                                                    disabled={!isAdmin}
                                                />
                                            </td>
                                            <td className="border-r border-gray-100 p-0 print:border-black">
                                                <input
                                                    className="w-full h-full py-4 px-2 text-center border-none bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-gray-200 font-bold text-gray-700"
                                                    value={item.trgIncharge}
                                                    onChange={(e) => handleHistoryChange(index, 'trgIncharge', e.target.value)}
                                                    disabled={!isAdmin}
                                                />
                                            </td>
                                            <td className="border-b border-gray-100 p-2 text-center print:border-black print:p-1">
                                                {item.fileUrl ? (
                                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-all">
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-200 font-bold text-xs">NA</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Fill empty rows */}
                                    {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                                        <tr key={`empty-hist-${idx}`} className="border-b border-r border-gray-100 print:table-row">
                                            <td className="border-r border-gray-100 py-5 px-4 print:border-black print:p-1">&nbsp;</td>
                                            <td className="border-r border-gray-100 print:border-black">&nbsp;</td>
                                            <td className="border-r border-gray-100 print:border-black">&nbsp;</td>
                                            <td className="border-r border-gray-100 print:border-black">&nbsp;</td>
                                            <td className="border-r border-gray-100 print:border-black">&nbsp;</td>
                                            <td className="border-r border-gray-100 print:border-black">&nbsp;</td>
                                            <td className="border-r border-gray-100 print:border-black">&nbsp;</td>
                                            <td className="border-gray-100 print:border-black">&nbsp;</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Legend Section */}
                        <div className="mt-10 bg-gray-50 rounded-2xl p-8 border border-gray-200 print:border-black print:bg-white print:p-4 print:mt-4 shadow-sm">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-gray-500 text-[10px] uppercase tracking-widest mb-8 print:text-black">Proficiency Taxonomy</span>
                                <div className="flex flex-wrap gap-8 justify-center">
                                    <div className="flex flex-col items-center gap-3 group">
                                        <SkillLevelIndicator level={0} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black">Unrated</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 group">
                                        <SkillLevelIndicator level={1} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest print:text-black">Trainee (OJT)</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 group">
                                        <SkillLevelIndicator level={2} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest print:text-black">Practitioner</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 group">
                                        <SkillLevelIndicator level={3} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest print:text-black">Independent</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3 group">
                                        <SkillLevelIndicator level={4} />
                                        <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest print:text-black">Certified Trainer</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default SkillCard;

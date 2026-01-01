import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IconListCheck } from '@tabler/icons-react';

import { useGetLastAssessmentResultQuery } from '@/Redux/AllApi/AssessmentResultApi';

// Custom SVG Radar Chart Component
const RadarChart = ({ data, labels = [], size = 300, max = 4 }) => {
    const count = Math.max(data.length, labels.length, 3); // Minimum 3 for a shape
    const center = size / 2;
    const radius = size * 0.35; // Leave more room for labels
    const angleSlice = (Math.PI * 2) / count;

    // Helper to get coordinates
    const getCoordinates = (value, index, currentRadius = radius) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        const r = (value / max) * currentRadius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    // Generate grid levels (1, 2, 3, 4)
    const levels = [1, 2, 3, 4];

    // Calculate points for the data polygon
    const points = data.length > 0 ? data.map((val, i) => {
        const { x, y } = getCoordinates(val || 0, i);
        return `${x},${y}`;
    }).join(' ') : "";

    return (
        <div className="relative flex justify-center items-center w-full overflow-visible py-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Background Grid (Polygons) */}
                {levels.map((level) => {
                    const levelPoints = Array.from({ length: count }).map((_, i) => {
                        const { x, y } = getCoordinates(level, i);
                        return `${x},${y}`;
                    }).join(' ');
                    return (
                        <polygon
                            key={level}
                            points={levelPoints}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Axes Lines */}
                {Array.from({ length: count }).map((_, i) => {
                    const { x, y } = getCoordinates(max, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                {data.length > 0 && (
                    <polygon
                        points={points}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                    />
                )}

                {/* Data Points */}
                {data.map((val, i) => {
                    const { x, y } = getCoordinates(val || 0, i);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#1d4ed8"
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    );
                })}

                {/* Axis Labels (Subject Names) */}
                {labels.map((label, i) => {
                    if (!label) return null;
                    const { x, y } = getCoordinates(max, i, radius + 20);
                    // Adjust text anchor based on position
                    const textAnchor = x > center + 10 ? "start" : x < center - 10 ? "end" : "middle";
                    const dy = y > center ? "1em" : y < center ? "-0.5em" : "0.3em";

                    return (
                        <text
                            key={`axis-label-${i}`}
                            x={x}
                            y={y}
                            dy={dy}
                            textAnchor={textAnchor}
                            fontSize="9"
                            className="font-bold fill-gray-600 uppercase tracking-tighter"
                        >
                            {label.length > 15 ? label.substring(0, 12) + '...' : label}
                        </text>
                    )
                })}

                {/* Scale Labels (0.0 to 4.0) */}
                {levels.map((level) => {
                    const { x, y } = getCoordinates(level, 0); // Top axis
                    return (
                        <text key={`scale-${level}`} x={x - 14} y={y + 4} fontSize="8" className="fill-gray-400 font-bold">
                            {level}.0
                        </text>
                    )
                })}
                <text x={center - 14} y={center + 4} fontSize="8" className="fill-gray-400 font-bold">0.0</text>
            </svg>
        </div>
    );
};

const FeedbackCard = ({ employeeData }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);
    const today = new Date().toLocaleDateString('en-GB');
    const personalInfo = employeeData?.personalInfo || {};

    const { data: resultData } = useGetLastAssessmentResultQuery(employeeData?._id, {
        skip: !employeeData?._id
    });
    const result = resultData?.data; // Expecting { knowledge: ..., skill: ... }

    // Segregate Results
    const kResult = result?.knowledge;
    const sResult = result?.skill;

    let knowledgeItems = [];
    let skillItems = [];

    // Process Knowledge
    if (kResult && kResult.evaluationData) {
        knowledgeItems = kResult.evaluationData.map((item, idx) => ({
            id: idx + 1,
            subject: item.subject,
            max: item.maxWorks,
            scored: item.scored,
            rating: parseFloat(item.rating).toFixed(2)
        }));
    }

    // Process Skill
    if (sResult && sResult.evaluationData) {
        skillItems = sResult.evaluationData.map((item, idx) => ({
            id: idx + 1,
            subject: item.subject,
            max: item.maxWorks,
            scored: item.scored,
            rating: parseFloat(item.rating).toFixed(2)
        }));
    }

    // Determine Overall Status
    const getOverallStatus = () => {
        if (!kResult && !sResult) return "Pending";
        const kStatus = kResult?.resultStatus || "PASS";
        const sStatus = sResult?.resultStatus || "PASS";
        if (kStatus === "FAIL" || sStatus === "FAIL") return "FAIL";
        return "PASS";
    };
    const overallStatus = getOverallStatus();

    // Fill blanks for UI consistency
    const fillBlanks = (items, count) => {
        const filled = [...items];
        while (filled.length < count) {
            filled.push({ id: filled.length + 1, subject: "", max: "", scored: "", rating: "" });
        }
        return filled;
    };

    const finalKnowledgeItems = fillBlanks(knowledgeItems, 5);
    const finalSkillItems = fillBlanks(skillItems, 5);

    // Chart Data
    const knowledgeChartData = knowledgeItems.map(i => parseFloat(i.rating) || 0);
    const knowledgeLabels = knowledgeItems.map(i => i.subject);

    const skillChartData = skillItems.map(i => parseFloat(i.rating) || 0);
    const skillLabels = skillItems.map(i => i.subject);

    // Totals
    const calculateTotal = (items) => {
        return items.reduce((acc, curr) => ({
            max: acc.max + (parseFloat(curr.max) || 0),
            scored: acc.scored + (parseFloat(curr.scored) || 0),
            rating: acc.rating + (parseFloat(curr.rating) || 0)
        }), { max: 0, scored: 0, rating: 0 });
    };

    const knowledgeTotal = calculateTotal(knowledgeItems);
    const skillTotal = calculateTotal(skillItems);

    return (
        <Card className="w-full max-w-4xl bg-white shadow-xl hover:shadow-2xl transition-shadow print:shadow-none font-sans text-xs sm:text-sm relative group overflow-hidden border border-gray-200 print:border-none">

            {/* Action Button */}
            {currentUser?.role === 'ADMIN' && (
                <div className="absolute top-4 right-4 print:hidden opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/employee/${employeeData?._id}/assessments`)}
                        className="flex items-center gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
                    >
                        <IconListCheck size={16} />
                        View Detailed Assessment
                    </Button>
                </div>
            )}

            <CardContent className="p-0 border-2 border-gray-800 m-4 print:m-0 print:border-black bg-white">

                {/* Header */}
                <div className="border-b-2 border-gray-800 print:border-black text-center font-bold p-3 text-sm sm:text-lg bg-gray-50 print:bg-transparent uppercase tracking-wide">
                    Fundamental Skill Training Result Feedback Sheet - Pathshala
                </div>

                {/* Profile Section Table */}
                <div className="flex flex-col md:flex-row border-b-2 border-gray-800 print:border-black">
                    <div className="w-32 md:w-40 border-r-2 border-gray-800 print:border-black flex items-center justify-center p-3 bg-gray-50/50 print:bg-transparent">
                        {personalInfo.image ? (
                            <img src={personalInfo.image} alt="Profile" className="h-28 w-24 object-cover border-2 border-white shadow-sm print:border-gray-500" />
                        ) : (
                            <div className="h-28 w-20 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 border border-gray-300">PHOTO</div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-[100px_1fr_80px_120px] border-b border-gray-800 print:border-black h-1/2">
                            <div className="p-2 border-r border-gray-800 print:border-black font-bold flex items-center justify-center bg-gray-50 print:bg-transparent">Name</div>
                            <div className="p-2 border-r border-gray-800 print:border-black font-bold flex items-center justify-center uppercase text-blue-900 print:text-black">{personalInfo.name || "N/A"}</div>
                            <div className="p-2 border-r border-gray-800 print:border-black font-bold flex items-center justify-center bg-gray-50 print:bg-transparent">TM No</div>
                            <div className="p-2 flex items-center justify-center font-bold">{personalInfo.iCardNo || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-[100px_1fr_80px_120px] h-1/2">
                            <div className="p-2 border-r border-gray-800 print:border-black font-bold flex items-center justify-center bg-gray-50 print:bg-transparent">Date</div>
                            <div className="p-2 border-r border-gray-800 print:border-black flex items-center justify-center">{today}</div>
                            <div className="p-2 border-r border-gray-800 print:border-black font-bold flex items-center justify-center bg-gray-50 print:bg-transparent">Batch</div>
                            <div className="p-2 flex items-center justify-center"></div>
                        </div>
                    </div>
                </div>

                {/* Levels Reference Table */}
                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] border-b-2 border-gray-800 print:border-black text-center text-[10px] sm:text-xs">
                    <div className="border-r border-gray-800 print:border-black p-2 font-bold flex items-center justify-center bg-gray-100 print:bg-transparent">Category</div>
                    <div className="border-r border-gray-800 print:border-black p-1 font-semibold">LEVEL - 1</div>
                    <div className="border-r border-gray-800 print:border-black p-1 font-semibold">LEVEL - 2</div>
                    <div className="border-r border-gray-800 print:border-black p-1 font-semibold">LEVEL - 3</div>
                    <div className="p-1 font-semibold">LEVEL - 4</div>

                    <div className="border-t border-r border-gray-800 print:border-black p-2 font-bold bg-gray-50 print:bg-transparent flex items-center justify-center">Knowledge</div>
                    <div className="border-t border-r border-gray-800 print:border-black p-1 flex items-center justify-center">Less Knowledge</div>
                    <div className="border-t border-r border-gray-800 print:border-black p-1 flex items-center justify-center">Basic Knowledge</div>
                    <div className="border-t border-r border-gray-800 print:border-black p-1 flex items-center justify-center">Specific Knowledge</div>
                    <div className="border-t p-1 flex items-center justify-center">Enough Knowledge</div>

                    <div className="border-t border-r border-gray-800 print:border-black p-2 font-bold bg-gray-50 print:bg-transparent flex items-center justify-center">Skill</div>
                    <div className="border-t border-r border-gray-800 print:border-black p-1 flex items-center justify-center">Re Training Required</div>
                    <div className="border-t border-r border-gray-800 print:border-black p-1 flex items-center justify-center">Can do with Support</div>
                    <div className="border-t border-r border-gray-800 print:border-black p-1 flex items-center justify-center">Can do without Support</div>
                    <div className="border-t p-1 flex items-center justify-center">Can Train Others</div>
                </div>

                {/* KNOWLEDGE EVALUATION */}
                <div className="bg-gray-100 print:bg-transparent border-b-2 border-gray-800 print:border-black p-2 font-bold text-center tracking-wider text-sm">KNOWLEDGE EVALUATION</div>
                <div className="flex flex-col md:flex-row border-b-2 border-gray-800 print:border-black">
                    {/* Chart (Left) */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 print:border-black flex items-center justify-center p-4 bg-white overflow-visible">
                        {knowledgeChartData.length > 0 ? (
                            <RadarChart data={knowledgeChartData} labels={knowledgeLabels} size={220} />
                        ) : (
                            <div className="text-gray-400 text-xs py-10">No Assessment Data Available</div>
                        )}
                    </div>
                    {/* Table (Right) */}
                    <div className="w-full md:w-2/3">
                        <table className="w-full text-[10px] sm:text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 print:bg-transparent">
                                    <th className="border-b border-r border-gray-800 print:border-black p-2 w-8">No</th>
                                    <th className="border-b border-r border-gray-800 print:border-black p-2">Knowledge Subject</th>
                                    <th className="border-b border-r border-gray-800 print:border-black p-2 w-16">Max</th>
                                    <th className="border-b border-gray-800 print:border-black p-2 text-center" colSpan="2">Result</th>
                                </tr>
                                <tr>
                                    <th className="border-b border-r border-gray-800 print:border-black"></th>
                                    <th className="border-b border-r border-gray-800 print:border-black"></th>
                                    <th className="border-b border-r border-gray-800 print:border-black"></th>
                                    <th className="border-b border-r border-gray-800 print:border-black p-1 w-16 text-center">Scored</th>
                                    <th className="border-b border-gray-800 print:border-black p-1 w-16 text-center">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalKnowledgeItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 text-center h-7">{item.id}</td>
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 font-medium">{item.subject}</td>
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 text-center text-gray-500">{item.max}</td>
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 text-center font-semibold">{item.scored}</td>
                                        <td className="border-b border-gray-800 print:border-black p-1 text-center font-bold bg-gray-50 print:bg-transparent">{item.rating}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 print:bg-transparent">
                                    <td colSpan="2" className="border-r border-gray-800 print:border-black p-2 text-right font-bold h-8">TOTAL:</td>
                                    <td className="border-r border-gray-800 print:border-black p-2 text-center font-bold">{knowledgeTotal.max}</td>
                                    <td className="border-r border-gray-800 print:border-black p-2 text-center font-bold">{knowledgeTotal.scored}</td>
                                    <td className="p-2 text-center font-bold text-blue-800 print:text-black">{knowledgeTotal.rating.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SKILL EVALUATION */}
                <div className="bg-gray-100 print:bg-transparent border-b-2 border-gray-800 print:border-black p-2 font-bold text-center tracking-wider text-sm">SKILL EVALUATION</div>
                <div className="flex flex-col md:flex-row border-b-2 border-gray-800 print:border-black">
                    {/* Chart (Left) */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-800 print:border-black flex items-center justify-center p-4 bg-white overflow-visible">
                        {skillChartData.length > 0 ? (
                            <RadarChart data={skillChartData} labels={skillLabels} size={220} />
                        ) : (
                            <div className="text-gray-400 text-xs py-10">No Assessment Data Available</div>
                        )}
                    </div>
                    {/* Table (Right) */}
                    <div className="w-full md:w-2/3">
                        <table className="w-full text-[10px] sm:text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 print:bg-transparent">
                                    <th className="border-b border-r border-gray-800 print:border-black p-2 w-8">No</th>
                                    <th className="border-b border-r border-gray-800 print:border-black p-2">Skill Subject</th>
                                    <th className="border-b border-r border-gray-800 print:border-black p-2 w-16">Max</th>
                                    <th className="border-b border-gray-800 print:border-black p-2 text-center" colSpan="2">Result</th>
                                </tr>
                                <tr>
                                    <th className="border-b border-r border-gray-800 print:border-black"></th>
                                    <th className="border-b border-r border-gray-800 print:border-black"></th>
                                    <th className="border-b border-r border-gray-800 print:border-black"></th>
                                    <th className="border-b border-r border-gray-800 print:border-black p-1 w-16 text-center">Scored</th>
                                    <th className="border-b border-gray-800 print:border-black p-1 w-16 text-center">Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalSkillItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 text-center h-7">{item.id}</td>
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 font-medium">{item.subject}</td>
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 text-center text-gray-500">{item.max}</td>
                                        <td className="border-b border-r border-gray-800 print:border-black p-1 text-center font-semibold">{item.scored}</td>
                                        <td className="border-b border-gray-800 print:border-black p-1 text-center font-bold bg-gray-50 print:bg-transparent">{item.rating}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 print:bg-transparent">
                                    <td colSpan="2" className="border-r border-gray-800 print:border-black p-2 text-right font-bold h-8">TOTAL:</td>
                                    <td className="border-r border-gray-800 print:border-black p-2 text-center font-bold">{skillTotal.max}</td>
                                    <td className="border-r border-gray-800 print:border-black p-2 text-center font-bold">{skillTotal.scored}</td>
                                    <td className="p-2 text-center font-bold text-blue-800 print:text-black">{skillTotal.rating.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comment Section */}
                <div className="border-b-2 border-gray-800 print:border-black p-3 flex h-24 bg-white">
                    <span className="font-bold underline mr-2 text-gray-700">Comment:</span>
                    <div className="flex-1 border-b border-dotted border-gray-400 mt-5"></div>
                </div>

                {/* Results Summary Table */}
                <div className="border-b-2 border-gray-800 print:border-black">
                    <div className="text-center font-bold border-b border-gray-800 print:border-black py-2 bg-gray-100 print:bg-transparent text-xs">
                        &lt; Level 3 = FAIL &nbsp;&nbsp;|&nbsp;&nbsp; ≥ Level 3 = PASS
                    </div>
                    <div className="grid grid-cols-[150px_1fr_1fr_1fr] md:grid-cols-[200px_1fr_1fr_1fr]">
                        {/* Header Row */}
                        <div className="border-b border-r border-gray-800 print:border-black font-bold text-center p-2 bg-gray-50">TRAINING</div>
                        <div className="border-b border-r border-gray-800 print:border-black font-bold text-center p-2 bg-gray-50">Rating (Avg)</div>
                        <div className="border-b border-r border-gray-800 print:border-black font-bold text-center p-2 bg-gray-50">Result</div>
                        <div className="border-b border-gray-800 print:border-black font-bold text-center p-2 bg-gray-50">Overall</div>

                        {/* Knowledge Row */}
                        <div className="border-b border-r border-gray-800 print:border-black font-bold text-center p-2">KNOWLEDGE</div>
                        <div className="border-b border-r border-gray-800 print:border-black text-center p-2 font-bold">
                            {(knowledgeItems.length > 0 ? (knowledgeTotal.rating / knowledgeItems.length) : 0).toFixed(2)}
                        </div>
                        <div className={`border-b border-r border-gray-800 print:border-black text-center p-2 font-bold ${(knowledgeItems.length > 0 && (knowledgeTotal.rating / knowledgeItems.length) >= 3) ? "text-green-600" : "text-red-600"}`}>
                            {(knowledgeItems.length > 0 && (knowledgeTotal.rating / knowledgeItems.length) >= 3) ? "PASS" : "FAIL"}
                        </div>
                        <div className={`border-gray-800 print:border-black font-bold text-center flex items-center justify-center row-span-2 text-xl bg-${overallStatus === 'PASS' ? 'green' : 'red'}-50 print:bg-transparent text-${overallStatus === 'PASS' ? 'green' : 'red'}-700 print:text-black border-l border-gray-800`}>
                            {overallStatus}
                        </div>

                        {/* Skill Row */}
                        <div className="border-r border-gray-800 print:border-black font-bold text-center p-2">SKILL</div>
                        <div className="border-r border-gray-800 print:border-black text-center p-2 font-bold">
                            {(skillItems.length > 0 ? (skillTotal.rating / skillItems.length) : 0).toFixed(2)}
                        </div>
                        <div className={`border-r border-gray-800 print:border-black text-center p-2 font-bold ${(skillItems.length > 0 && (skillTotal.rating / skillItems.length) >= 3) ? "text-green-600" : "text-red-600"}`}>
                            {(skillItems.length > 0 && (skillTotal.rating / skillItems.length) >= 3) ? "PASS" : "FAIL"}
                        </div>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="flex h-28">
                    {/* SHOP Mgmt */}
                    <div className="w-[100px] border-r-2 border-gray-800 print:border-black flex flex-col items-center justify-center font-bold p-2 text-center bg-gray-50 print:bg-transparent text-xs">
                        SHOP <span className="text-[10px] font-normal">Management</span>
                    </div>
                    <div className="flex-1 flex border-r-2 border-gray-800 print:border-black">
                        <div className="flex-1 border-r border-gray-800 print:border-black flex flex-col">
                            <div className="border-b border-gray-800 print:border-black text-center font-bold p-1 bg-gray-50 print:bg-transparent text-[10px]">MANAGER</div>
                            <div className="flex-1 relative">
                                <div className="absolute bottom-2 left-0 right-0 border-b border-gray-300 w-3/4 mx-auto"></div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="border-b border-gray-800 print:border-black text-center font-bold p-1 bg-gray-50 print:bg-transparent text-[10px]">GROUP LEADER</div>
                            <div className="flex-1 relative">
                                <div className="absolute bottom-2 left-0 right-0 border-b border-gray-300 w-3/4 mx-auto"></div>
                            </div>
                        </div>
                    </div>

                    {/* PATHSALA Mgmt */}
                    <div className="w-[100px] border-r-2 border-gray-800 print:border-black flex flex-col items-center justify-center font-bold p-2 text-center bg-gray-50 print:bg-transparent text-xs">
                        PATHSALA <span className="text-[10px] font-normal">Management</span>
                    </div>
                    <div className="flex-[1.5] flex">
                        <div className="flex-1 border-r border-gray-800 print:border-black flex flex-col">
                            <div className="border-b border-gray-800 print:border-black text-center font-bold p-1 bg-gray-50 print:bg-transparent text-[10px]">MANAGER</div>
                            <div className="flex-1 relative">
                                <div className="absolute bottom-2 left-0 right-0 border-b border-gray-300 w-3/4 mx-auto"></div>
                            </div>
                        </div>
                        <div className="flex-1 border-r border-gray-800 print:border-black flex flex-col">
                            <div className="border-b border-gray-800 print:border-black text-center font-bold p-1 bg-gray-50 print:bg-transparent text-[10px] leading-tight flex items-center justify-center h-[26px]">CO-ORDINATOR</div>
                            <div className="flex-1 relative">
                                <div className="absolute bottom-2 left-0 right-0 border-b border-gray-300 w-3/4 mx-auto"></div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="border-b border-gray-800 print:border-black text-center font-bold p-1 bg-gray-50 print:bg-transparent h-[26px] flex items-center justify-center text-[10px]">TRAINER</div>
                            <div className="flex-1 relative">
                                <div className="absolute bottom-2 left-0 right-0 border-b border-gray-300 w-3/4 mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default FeedbackCard;

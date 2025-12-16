
import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProcessPage = () => {
    const [selectedLine, setSelectedLine] = useState("all");
    const [processName, setProcessName] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        // Placeholder for search logic
        console.log("Searching for:", searchQuery, "Line:", selectedLine, "Process:", processName);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-800">Process Flow</h2>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Filter & Search</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

                        {/* Line Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Line</label>
                            <Select value={selectedLine} onValueChange={setSelectedLine}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Line" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Lines</SelectItem>
                                    <SelectItem value="line1">Line 1</SelectItem>
                                    <SelectItem value="line2">Line 2</SelectItem>
                                    <SelectItem value="line3">Line 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Process Name Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Process Name</label>
                            <Select value={processName} onValueChange={setProcessName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Process" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Processes</SelectItem>
                                    <SelectItem value="process1">Process 1</SelectItem>
                                    <SelectItem value="process2">Process 2</SelectItem>
                                    <SelectItem value="process3">Process 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Search</label>
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Search Button (Optional but good UX) */}
                        <div className="space-y-2">
                            <Button onClick={handleSearch} className="w-full">
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder for content */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm text-center text-gray-500 py-12 col-span-full">
                    Select filters to view process data.
                    <div className="mt-2 text-sm">
                        Current Filters: Line: <strong>{selectedLine}</strong>, Process: <strong>{processName}</strong>, Search: <strong>{searchQuery}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessPage;

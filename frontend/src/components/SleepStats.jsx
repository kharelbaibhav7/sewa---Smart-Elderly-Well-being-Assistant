import { Moon, Star, Sun } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const SleepStats = () => {
    // Dummy Data matching the graph style
    // Stacked bars or just a series of values representing different stages
    // The image shows a timeline graph. We can simulate this with a BarChart where bars are segments of time.

    const sleepData = [
        { time: "23:31", type: "Light", value: 3 },
        { time: "00:00", type: "Deep", value: 4 },
        { time: "01:00", type: "Light", value: 2 },
        { time: "01:30", type: "Deep", value: 5 },
        { time: "03:00", type: "Light", value: 3 },
        { time: "03:30", type: "Deep", value: 4 },
        { time: "04:30", type: "Deep", value: 3 },
        { time: "05:00", type: "Light", value: 3 },
        { time: "06:00", type: "Deep", value: 2 },
        { time: "06:30", type: "Light", value: 2 },
        { time: "06:43", type: "Awake", value: 1 },
    ];

    const sleepDistribution = [
        { name: "Deep sleep", value: 228, color: "#8b5cf6" }, // 3hr 48m
        { name: "Light sleep", value: 202, color: "#c4b5fd" }, // 3hr 22m
        { name: "Awake sleep", value: 2, color: "#facc15" },   // 2min
    ];

    const getColor = (type) => {
        switch (type) {
            case "Deep": return "#8b5cf6"; // Violet 500
            case "Light": return "#c4b5fd"; // Violet 300
            case "Awake": return "#facc15"; // Yellow 400
            default: return "#cbd5e1";
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-white mb-2">
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-4xl font-bold">7</span>
                    <span className="text-xl text-gray-400">hr</span>
                    <span className="text-4xl font-bold">12</span>
                    <span className="text-xl text-gray-400">min</span>
                </div>

                <div className="flex justify-center space-x-4 text-xs font-medium mt-4">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-violet-300"></div>
                        <span className="text-gray-400">Light sleep</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-violet-600"></div>
                        <span className="text-gray-400">Deep sleep</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <span className="text-gray-400">Awake sleep</span>
                    </div>
                </div>
            </div>

            {/* Main Sleep Graph */}
            <div className="h-40 w-full bg-gray-900/50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData} barCategoryGap={2}>
                        <XAxis
                            dataKey="time"
                            stroke="#6b7280"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <Tooltip
                            cursor={{ fill: '#374151', opacity: 0.2 }}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                            {sleepData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>08/02 23:31</span>
                    <span>09/02 06:43</span>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl p-6 text-gray-900">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-lg font-bold">Sleep score</h4>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-5xl font-bold">88</span>
                            <span className="text-gray-500">points</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-semibold">Good</span>
                        <div className="text-orange-500">😊</div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sleepDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={55}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sleepDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-semibold text-gray-500">Sleep</span>
                            <span className="text-sm font-bold">ratio</span>
                        </div>
                    </div>

                    {/* Legend stats */}
                    <div className="flex-1 ml-8 space-y-4">
                        <div className="flex justify-between w-full">
                            <div className="flex items-center space-x-2">
                                <div className="w-1 h-4 rounded-full bg-violet-600"></div>
                                <span className="font-medium text-sm">Deep sleep</span>
                            </div>
                            <span className="font-bold">3<span className="text-xs font-normal text-gray-500">hr</span>48<span className="text-xs font-normal text-gray-500">min</span></span>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className="flex items-center space-x-2">
                                <div className="w-1 h-4 rounded-full bg-violet-300"></div>
                                <span className="font-medium text-sm">Light sleep</span>
                            </div>
                            <span className="font-bold">3<span className="text-xs font-normal text-gray-500">hr</span>22<span className="text-xs font-normal text-gray-500">min</span></span>
                        </div>
                        <div className="flex justify-between w-full">
                            <div className="flex items-center space-x-2">
                                <div className="w-1 h-4 rounded-full bg-yellow-400"></div>
                                <span className="font-medium text-sm">Awake sleep</span>
                            </div>
                            <span className="font-bold">2<span className="text-xs font-normal text-gray-500">min</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SleepStats;

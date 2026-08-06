import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Heart } from "lucide-react";

const HeartRateStats = () => {
    // Dummy data for heart rate
    const data = [
        { time: "00:00", bpm: 65 },
        { time: "04:00", bpm: 58 },
        { time: "08:00", bpm: 72 },
        { time: "12:00", bpm: 85 },
        { time: "16:00", bpm: 78 },
        { time: "20:00", bpm: 70 },
        { time: "23:59", bpm: 62 },
    ];

    const currentHeartRate = 72;

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Recent Heart Rate</h3>
                    <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-4xl font-extrabold text-white">{currentHeartRate}</span>
                        <span className="text-gray-400">bpm</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                </div>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="time"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={['dataMin - 10', 'dataMax + 10']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            itemStyle={{ color: '#f43f5e' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="bpm"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBpm)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HeartRateStats;

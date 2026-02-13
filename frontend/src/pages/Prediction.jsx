import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, Activity, Clock, AlertTriangle } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Prediction = () => {
    // Mock Data for Forecast
    const forecastData = {
        labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
            {
                label: 'Predicted Crowd Density',
                data: [150, 100, 50, 200, 800, 1200, 1400, 1350, 1100, 900, 600, 300],
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.5)'); // Purple
                    gradient.addColorStop(1, 'rgba(147, 51, 234, 0.0)');
                    return gradient;
                },
                borderColor: 'rgb(147, 51, 234)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(147, 51, 234)',
            },
            {
                label: 'Projected Capacity Limit',
                data: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
                borderColor: 'rgba(239, 68, 68, 0.8)', // Red
                borderDash: [5, 5],
                tension: 0,
                pointRadius: 0,
                fill: false
            }
        ]
    };

    const forecastOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#9ca3af' }
            },
            title: {
                display: false,
                text: '24-Hour Crowd Forecast'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(200, 200, 200, 0.1)' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
            }
        }
    };

    const regionsData = [
        { id: 'canteen', name: 'Student Canteen', x: '44.1%', y: '50.9%', capacity: 200, current: 180, status: 'High Congestion', color: 'bg-red-500' },
        { id: 'lib', name: 'Main Library', x: '46.6%', y: '58.0%', capacity: 500, current: 425, status: 'Moderate', color: 'bg-amber-500' },
        { id: 'pg', name: 'PG Block', x: '40.8%', y: '70.8%', capacity: 150, current: 45, status: 'Low Activity', color: 'bg-green-500' },
        { id: 'newblock', name: 'New Block', x: '49.1%', y: '57.6%', capacity: 300, current: 80, status: 'Low Activity', color: 'bg-green-500' },
        { id: 'dblock', name: 'Academic Block D', x: '45.8%', y: '73.6%', capacity: 400, current: 50, status: 'Low Activity', color: 'bg-green-500' }
    ];

    // Mock Flow Data
    const flowData = [
        { from: 'pg', to: 'lib', intensity: 'medium' },
        { from: 'lib', to: 'canteen', intensity: 'high' },
        { from: 'newblock', to: 'dblock', intensity: 'low' }
    ];

    const getRegionCoords = (id) => {
        const region = regionsData.find(r => r.id === id);
        return region ? { x: region.x, y: region.y } : { x: '0%', y: '0%' };
    };

    // Mock Data for Comparison
    const comparisonData = {
        labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
        datasets: [
            {
                label: 'Today',
                data: [800, 1200, 1400, 1350, 1100, 900, 600],
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            },
            {
                label: 'Yesterday',
                data: [750, 1150, 1300, 1250, 1050, 850, 550],
                backgroundColor: 'rgba(156, 163, 175, 0.5)', // Gray
                borderColor: 'rgb(156, 163, 175)',
                borderWidth: 1
            }
        ]
    };

    const comparisonOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#9ca3af' }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(200, 200, 200, 0.1)' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Predicted (30m)</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,245</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Confidence Score</p>
                            <h3 className="text-2xl font-bold text-green-500">94%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Peak Time Today</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">14:00</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Anomaly Status</p>
                            <h3 className="text-2xl font-bold text-green-500">Normal</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Forecast Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">24-Hour Crowd Forecast</h3>
                    <div className="h-80">
                        <Line data={forecastData} options={forecastOptions} />
                    </div>
                </div>

                {/* Comparison Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historical Comparison (Today vs Yesterday)</h3>
                    <div className="h-80">
                        <Bar data={comparisonData} options={comparisonOptions} />
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Campus Density Heatmap</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Visualizing high-traffic zones across the campus.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                        <span className="text-xs font-semibold px-2 text-gray-500 dark:text-gray-300">Time:</span>
                        <input
                            type="range" min="8" max="20" step="1" defaultValue="14"
                            className="w-32 h-1.5 bg-gray-300 dark:bg-slate-500 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            onChange={(e) => {
                                // Just a visual mock interaction for now, triggers re-render if I added state
                            }}
                        />
                        <span className="text-xs font-mono font-bold w-12 text-center text-gray-700 dark:text-white">14:00</span>
                    </div>
                </div>

                <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 group">
                    {/* Map Background */}
                    <iframe
                        className="absolute inset-0 w-full h-full border-none opacity-60 saturate-[.85] contrast-[1.1] pointer-events-none"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=78.383911,17.535606,78.388299,17.541877&amp;layer=mapnik"
                    ></iframe>

                    {/* Data-Driven Heatmap Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-80 mix-blend-multiply dark:mix-blend-screen">
                        {regionsData.map(region => (
                            <div
                                key={region.id}
                                className={`absolute rounded-full blur-[20px] opacity-80 ${region.color} transition-all duration-1000`}
                                style={{
                                    left: region.x,
                                    top: region.y,
                                    width: region.status === 'High Congestion' ? '80px' : region.status === 'Moderate' ? '60px' : '40px',
                                    height: region.status === 'High Congestion' ? '80px' : region.status === 'Moderate' ? '60px' : '40px',
                                    transform: 'translate(-50%, -50%)' // Center the heat spot on the coordinates
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Flow Arrows Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 filter drop-shadow-sm">
                        <defs>
                            <marker id="arrowhead-high" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
                            </marker>
                            <marker id="arrowhead-medium" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#f59e0b" />
                            </marker>
                            <marker id="arrowhead-low" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="#22c55e" />
                            </marker>
                        </defs>
                        {flowData.map((flow, i) => {
                            const start = getRegionCoords(flow.from);
                            const end = getRegionCoords(flow.to);
                            let color = '#22c55e';
                            let marker = 'url(#arrowhead-low)';
                            if (flow.intensity === 'high') { color = '#ef4444'; marker = 'url(#arrowhead-high)'; }
                            else if (flow.intensity === 'medium') { color = '#f59e0b'; marker = 'url(#arrowhead-medium)'; }

                            return (
                                <line
                                    key={i}
                                    x1={start.x} y1={start.y}
                                    x2={end.x} y2={end.y}
                                    stroke={color}
                                    strokeWidth={flow.intensity === 'high' ? 2 : 1.5}
                                    strokeDasharray="4,3"
                                    markerEnd={marker}
                                    className="opacity-80"
                                />
                            );
                        })}
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-3 rounded-lg shadow-lg border border-gray-100 dark:border-slate-600">
                        <div className="text-xs font-bold text-gray-900 dark:text-white mb-2">Congestion Level</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                            <span>Low</span>
                            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-red-600"></div>
                            <span>High</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Prediction;

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { feedbackEmojis, feedbackLabels, feedbackColors, calculateSatisfactionScore } from '../../utils/helpers';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';

const FeedbackStats = ({ stats, timeline }) => {
  // Pregătește datele pentru grafice
  const pieData = useMemo(() => {
    if (!stats || stats.total === 0) return [];
    return Object.entries(feedbackEmojis).map(([type, emoji]) => ({
      name: feedbackLabels[type],
      value: stats[type] || 0,
      emoji,
      color: feedbackColors[type]
    })).filter(item => item.value > 0);
  }, [stats]);

  const barData = useMemo(() => {
    return Object.entries(feedbackEmojis).map(([type, emoji]) => ({
      name: emoji,
      label: feedbackLabels[type],
      value: stats?.[type] || 0,
      fill: feedbackColors[type]
    }));
  }, [stats]);

  const satisfactionScore = useMemo(() => {
    return calculateSatisfactionScore(stats);
  }, [stats]);

  // Formatează timeline pentru grafic
  const timelineData = useMemo(() => {
    if (!timeline || timeline.length === 0) return [];
    return timeline.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('ro-RO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      happy: item.happy || 0,
      sad: item.sad || 0,
      surprised: item.surprised || 0,
      confused: item.confused || 0
    }));
  }, [timeline]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {feedbackEmojis[entry.dataKey]} {feedbackLabels[entry.dataKey]}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">
          Încă nu există feedback
        </h3>
        <p className="text-gray-600">
          Statisticile vor apărea când studenții vor începe să trimită feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Feedback</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{satisfactionScore}%</p>
              <p className="text-sm text-gray-600">Scor Satisfacție</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-feedback-happy/20 rounded-lg text-2xl">
              {feedbackEmojis.happy}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.happyPercent}%</p>
              <p className="text-sm text-gray-600">Înțeleg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-feedback-confused/20 rounded-lg text-2xl">
              {feedbackEmojis.confused}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.confusedPercent}%</p>
              <p className="text-sm text-gray-600">Confuz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Distribuție Feedback
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 24 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                axisLine={{ stroke: '#E5E7EB' }}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-medium text-gray-800">
                          {data.name} {data.label}
                        </p>
                        <p className="text-lg font-bold" style={{ color: data.fill }}>
                          {data.value} feedback-uri
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon size={20} />
            Proporție Feedback
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-medium text-gray-800">
                          {data.emoji} {data.name}
                        </p>
                        <p className="text-lg font-bold" style={{ color: data.color }}>
                          {data.value} ({Math.round((data.value / stats.total) * 100)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-lg">{pieData[index]?.emoji}</span>
                        <span className="text-sm text-gray-600">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={20} />
            Evoluție în Timp
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-600">
                          {feedbackEmojis[entry.dataKey]} {feedbackLabels[entry.dataKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Area
                type="monotone"
                dataKey="happy"
                stackId="1"
                stroke={feedbackColors.happy}
                fill={feedbackColors.happy}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="surprised"
                stackId="1"
                stroke={feedbackColors.surprised}
                fill={feedbackColors.surprised}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="confused"
                stackId="1"
                stroke={feedbackColors.confused}
                fill={feedbackColors.confused}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="sad"
                stackId="1"
                stroke={feedbackColors.sad}
                fill={feedbackColors.sad}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default FeedbackStats;

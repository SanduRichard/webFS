import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { activitiesAPI, feedbackAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import FeedbackStats from './FeedbackStats';
import { formatTimeRemaining, feedbackEmojis, feedbackLabels, feedbackColors } from '../../utils/helpers';
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Users,
  StopCircle,
  AlertCircle,
  Share2,
  Wifi,
  WifiOff
} from 'lucide-react';

const ActivityView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinActivity, leaveActivity, stats: socketStats, participantCount, isConnected } = useSocket();

  const [activity, setActivity] = useState(null);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [stopping, setStopping] = useState(false);

  // Încarcă datele activității
  useEffect(() => {
    loadActivity();
    loadTimeline();
  }, [id]);

  // Conectare WebSocket
  useEffect(() => {
    if (activity && !activity.isExpired) {
      joinActivity(parseInt(id), 'teacher');
    }
    return () => {
      leaveActivity(parseInt(id));
    };
  }, [id, activity?.isExpired]);

  // Actualizează stats din socket
  useEffect(() => {
    if (socketStats) {
      setStats(socketStats);
    }
  }, [socketStats]);

  // Timer pentru timpul rămas
  useEffect(() => {
    if (activity?.expiresAt) {
      const updateTime = () => {
        const expires = new Date(activity.expiresAt);
        const now = new Date();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));
        setRemainingTime(diff);

        if (diff === 0 && activity.isActive) {
          // Reîncarcă activitatea când expiră
          loadActivity();
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [activity?.expiresAt, activity?.isActive]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getById(id);
      setActivity(response.data.activity);
      setStats(response.data.feedbackStats);
      setError(null);
    } catch (err) {
      setError('Eroare la încărcarea activității');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const response = await feedbackAPI.getTimeline(id);
      setTimeline(response.data.timeline);
    } catch (err) {
      console.error('Eroare la încărcarea timeline-ului:', err);
    }
  };

  // Refresh timeline periodic
  useEffect(() => {
    if (!activity?.isExpired) {
      const interval = setInterval(loadTimeline, 10000);
      return () => clearInterval(interval);
    }
  }, [activity?.isExpired, id]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activity.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Eroare la copiere:', err);
    }
  };

  const handleStopActivity = async () => {
    if (!window.confirm('Sigur vrei să oprești această activitate?')) return;

    try {
      setStopping(true);
      await activitiesAPI.stop(id);
      loadActivity();
    } catch (err) {
      setError('Eroare la oprirea activității');
    } finally {
      setStopping(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/feedback/${id}`;
    const shareText = `Intră la activitatea "${activity.title}" cu codul: ${activity.accessCode}\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'Activitate negăsită'}
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary mt-4"
          >
            Înapoi la Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isExpired = !activity.isActive || activity.isExpired || remainingTime === 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} />
        Înapoi la Dashboard
      </button>

      {/* Activity Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{activity.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isExpired
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-green-100 text-green-700'
              }`}>
                {isExpired ? 'Expirată' : 'Activă'}
              </span>
            </div>
            
            {activity.description && (
              <p className="text-gray-600 mb-4">{activity.description}</p>
            )}

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi size={18} className="text-green-500" />
                ) : (
                  <WifiOff size={18} className="text-red-500" />
                )}
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Conectat' : 'Deconectat'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                <span>{participantCount} participanți</span>
              </div>
            </div>
          </div>

          {/* Access Code & Timer */}
          <div className="flex flex-col gap-4">
            {/* Access Code */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Cod de acces</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-mono font-bold text-primary-600 tracking-wider">
                  {activity.accessCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copiază codul"
                >
                  {copied ? (
                    <Check size={20} className="text-green-500" />
                  ) : (
                    <Copy size={20} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Timer */}
            {!isExpired && (
              <div className={`rounded-xl p-4 text-center ${
                remainingTime < 300 ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock size={18} className={remainingTime < 300 ? 'text-red-500' : 'text-blue-500'} />
                  <span className={`text-sm ${remainingTime < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                    Timp rămas
                  </span>
                </div>
                <p className={`text-2xl font-mono font-bold ${
                  remainingTime < 300 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {formatTimeRemaining(remainingTime)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Distribuie
              </button>
              {!isExpired && (
                <button
                  onClick={handleStopActivity}
                  disabled={stopping}
                  className="btn btn-danger flex items-center justify-center gap-2"
                >
                  {stopping ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <StopCircle size={18} />
                  )}
                  Oprește
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Stats */}
      <FeedbackStats stats={stats} timeline={timeline} />

      {/* Live Feedback Feed */}
      {!isExpired && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Feedback în Timp Real
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(feedbackEmojis).map(([type, emoji]) => (
              <div
                key={type}
                className="bg-gray-50 rounded-xl p-4 text-center transition-all"
                style={{ 
                  boxShadow: stats?.[type] > 0 ? `0 0 20px ${feedbackColors[type]}40` : 'none'
                }}
              >
                <span className="text-4xl block mb-2">{emoji}</span>
                <p className="text-2xl font-bold" style={{ color: feedbackColors[type] }}>
                  {stats?.[type] || 0}
                </p>
                <p className="text-sm text-gray-600">{feedbackLabels[type]}</p>
                {stats?.total > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((stats[type] / stats.total) * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityView;

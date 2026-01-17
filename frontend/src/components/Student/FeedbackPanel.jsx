import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { activitiesAPI, feedbackAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { formatTimeRemaining, feedbackEmojis, feedbackLabels, feedbackColors } from '../../utils/helpers';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Wifi,
  WifiOff,
  Users
} from 'lucide-react';

const FeedbackPanel = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { joinActivity, leaveActivity, sendFeedback, isConnected, stats, participantCount } = useSocket();

  const [activity, setActivity] = useState(location.state?.activity || null);
  const [loading, setLoading] = useState(!location.state?.activity);
  const [error, setError] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Încarcă activitatea dacă nu e în state
  useEffect(() => {
    if (!activity) {
      loadActivity();
    }
  }, [activityId]);

  // Conectare WebSocket
  useEffect(() => {
    if (activity) {
      joinActivity(parseInt(activityId), 'student');
    }
    return () => {
      leaveActivity(parseInt(activityId));
    };
  }, [activityId, activity]);

  // Timer pentru timpul rămas
  useEffect(() => {
    if (activity?.expiresAt) {
      const updateTime = () => {
        const expires = new Date(activity.expiresAt);
        const now = new Date();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));
        setRemainingTime(diff);

        if (diff === 0) {
          setError('Activitatea a expirat');
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [activity?.expiresAt]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      // Folosim join pentru a verifica dacă activitatea e validă
      const response = await activitiesAPI.join(activityId);
      setActivity(response.data.activity);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Activitate negăsită sau expirată');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (feedbackType) => {
    if (remainingTime === 0) return;

    try {
      setSendingFeedback(true);
      setLastFeedback(feedbackType);

      // Trimite prin WebSocket pentru real-time
      sendFeedback(feedbackType);

      // Și prin API pentru persistență
      await feedbackAPI.send({
        activityId: parseInt(activityId),
        feedbackType
      });

      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 1500);
    } catch (err) {
      console.error('Eroare la trimiterea feedback-ului:', err);
    } finally {
      setSendingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Se încarcă activitatea...</p>
        </div>
      </div>
    );
  }

  if (error && remainingTime === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'Activitate expirată'}
          </h2>
          <p className="text-gray-600 mb-6">
            Această activitate nu mai este disponibilă pentru feedback.
          </p>
          <Link to="/join" className="btn btn-primary">
            Încearcă alt cod
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = remainingTime === 0;

  return (
    <div className={`min-h-screen flex flex-col ${
      isExpired 
        ? 'bg-gradient-to-br from-gray-700 to-gray-900' 
        : 'bg-gradient-to-br from-primary-500 to-primary-700'
    }`}>
      {/* Header */}
      <header className="p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/join"
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
            <span>Ieși</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Users size={18} />
              <span className="text-sm">{participantCount}</span>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi size={18} className="text-green-400" />
              ) : (
                <WifiOff size={18} className="text-red-400" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Activity Info Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <h1 className="text-xl font-bold text-white mb-2 text-center">
              {activity?.title}
            </h1>
            {activity?.teacher && (
              <p className="text-white/70 text-center text-sm">
                Profesor: {activity.teacher}
              </p>
            )}
            
            {/* Timer */}
            <div className={`mt-4 text-center p-3 rounded-xl ${
              isExpired 
                ? 'bg-red-500/30' 
                : remainingTime < 300 
                  ? 'bg-yellow-500/30' 
                  : 'bg-white/10'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={18} className="text-white/80" />
                <span className="text-white/80 text-sm">
                  {isExpired ? 'Activitate încheiată' : 'Timp rămas'}
                </span>
              </div>
              <p className="text-3xl font-mono font-bold text-white">
                {formatTimeRemaining(remainingTime)}
              </p>
            </div>
          </div>

          {/* Feedback Buttons */}
          {!isExpired && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-medium text-white mb-1">
                  Cum te simți acum?
                </h2>
                <p className="text-white/70 text-sm">
                  Apasă pe emoticon pentru a trimite feedback
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(feedbackEmojis).map(([type, emoji]) => (
                  <button
                    key={type}
                    onClick={() => handleSendFeedback(type)}
                    disabled={sendingFeedback}
                    className={`feedback-btn relative bg-white rounded-2xl p-6 shadow-lg 
                      transition-all duration-200 hover:scale-105 active:scale-95
                      ${lastFeedback === type && feedbackSent ? 'ring-4 ring-green-400' : ''}
                      disabled:opacity-70 disabled:cursor-not-allowed`}
                    style={{
                      boxShadow: lastFeedback === type 
                        ? `0 0 30px ${feedbackColors[type]}60` 
                        : undefined
                    }}
                  >
                    <span className="text-5xl block mb-2">{emoji}</span>
                    <span className="text-gray-700 font-medium">{feedbackLabels[type]}</span>
                    
                    {/* Success indicator */}
                    {lastFeedback === type && feedbackSent && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={24} className="text-green-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Feedback Sent Message */}
              {feedbackSent && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-100 px-4 py-2 rounded-full">
                    <CheckCircle size={18} />
                    <span>Feedback trimis!</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Expired Message */}
          {isExpired && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Activitatea s-a încheiat
              </h3>
              <p className="text-gray-600 mb-6">
                Mulțumim pentru participare! Feedback-ul tău a fost înregistrat.
              </p>
              <Link to="/join" className="btn btn-primary">
                Intră în altă activitate
              </Link>
            </div>
          )}

          {/* Anonymous Info */}
          {!isExpired && (
            <p className="mt-6 text-center text-white/60 text-sm">
              🔒 Feedback-ul tău este anonim
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default FeedbackPanel;

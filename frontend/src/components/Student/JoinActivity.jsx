import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { activitiesAPI } from '../../services/api';
import { isValidAccessCode } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  MessageSquare,
  GraduationCap
} from 'lucide-react';

const JoinActivity = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isTeacher, logout } = useAuth();
  
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirectează teacherii la dashboard
  useEffect(() => {
    if (isAuthenticated && isTeacher) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isTeacher, navigate]);

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setAccessCode(value);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidAccessCode(accessCode)) {
      setError('Codul trebuie să aibă exact 6 caractere');
      return;
    }

    try {
      setLoading(true);
      const response = await activitiesAPI.join(accessCode);
      
      if (response.data.success) {
        navigate(`/feedback/${response.data.activity.id}`, {
          state: { activity: response.data.activity }
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Cod de acces invalid sau activitate expirată';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <MessageSquare size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Feedback App</h1>
          <p className="text-primary-100">
            Acordă feedback în timp real profesorului tău
          </p>
        </div>

        {/* Join Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
              <KeyRound size={24} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Intră în activitate
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Introdu codul primit de la profesor
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessCode" className="sr-only">
                Cod de acces
              </label>
              <input
                type="text"
                id="accessCode"
                value={accessCode}
                onChange={handleChange}
                className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] 
                  px-4 py-4 border-2 border-gray-300 rounded-xl
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
                placeholder="ABCD12"
                maxLength={6}
                autoComplete="off"
                autoFocus
              />
              <p className="mt-2 text-center text-sm text-gray-500">
                6 caractere (litere și cifre)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || accessCode.length !== 6}
              className="w-full btn btn-primary flex items-center justify-center gap-2 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Intră în activitate</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <GraduationCap size={18} />
              Pentru studenți
            </h4>
            <p className="text-sm text-blue-700">
              Feedback-ul tău este <strong>anonim</strong>. Poți trimite oricâte feedback-uri 
              dorești pe durata activității.
            </p>
          </div>
        </div>

        {/* Teacher Link */}
        <div className="mt-6 text-center">
          <p className="text-primary-100 text-sm">
            Ești profesor?{' '}
            <Link to="/register" className="text-white font-medium hover:underline">
              Creează un cont
            </Link>
            {' sau '}
            <Link to="/login" className="text-white font-medium hover:underline">
              autentifică-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinActivity;

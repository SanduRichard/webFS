import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activitiesAPI } from '../../services/api';
import { formatDate, formatRelativeTime, feedbackEmojis } from '../../utils/helpers';
import { 
  PlusCircle, 
  Clock, 
  Users, 
  BarChart3, 
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Încarcă activitățile
  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll(filter);
      setActivities(response.data.activities);
      setError(null);
    } catch (err) {
      setError('Eroare la încărcarea activităților');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await activitiesAPI.delete(id);
      setActivities(activities.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Eroare la ștergerea activității');
    }
  };

  const getStatusBadge = (activity) => {
    if (!activity.isActive || activity.isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <XCircle size={14} />
          Expirată
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
        <CheckCircle size={14} />
        Activă
      </span>
    );
  };

  // Statistici totale
  const totalStats = activities.reduce((acc, activity) => {
    acc.total += activity.stats?.total || 0;
    acc.happy += activity.stats?.happy || 0;
    acc.sad += activity.stats?.sad || 0;
    acc.surprised += activity.stats?.surprised || 0;
    acc.confused += activity.stats?.confused || 0;
    return acc;
  }, { total: 0, happy: 0, sad: 0, surprised: 0, confused: 0 });

  const activeCount = activities.filter(a => a.isActive && !a.isExpired).length;
  const expiredCount = activities.filter(a => !a.isActive || a.isExpired).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Gestionează activitățile și vizualizează feedback-ul</p>
        </div>
        <Link
          to="/create-activity"
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Activitate Nouă
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
              <p className="text-sm text-gray-600">Total Activități</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalStats.total}</p>
              <p className="text-sm text-gray-600">Total Feedback</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg text-2xl">
              {feedbackEmojis.happy}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {totalStats.total > 0 
                  ? Math.round((totalStats.happy / totalStats.total) * 100) 
                  : 0}%
              </p>
              <p className="text-sm text-gray-600">Satisfacție</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm w-fit">
        {[
          { value: 'all', label: 'Toate' },
          { value: 'active', label: 'Active' },
          { value: 'expired', label: 'Expirate' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === tab.value
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Nicio activitate găsită
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Creează prima ta activitate pentru a începe să colectezi feedback.'
              : `Nu ai activități ${filter === 'active' ? 'active' : 'expirate'}.`
            }
          </p>
          <Link to="/create-activity" className="btn btn-primary inline-flex items-center gap-2">
            <PlusCircle size={20} />
            Creează Activitate
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="bg-white rounded-xl p-6 shadow-sm card-hover"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {activity.title}
                    </h3>
                    {getStatusBadge(activity)}
                  </div>
                  
                  {activity.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded font-mono">
                      Cod: {activity.accessCode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {activity.stats?.total || 0} feedback-uri
                    </span>
                  </div>
                </div>

                {/* Stats Preview */}
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {Object.entries(feedbackEmojis).map(([type, emoji]) => (
                      <div key={type} className="text-center">
                        <span className="text-2xl">{emoji}</span>
                        <p className="text-sm font-medium text-gray-600">
                          {activity.stats?.[type] || 0}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/activity/${activity.id}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Vizualizează"
                    >
                      <Eye size={20} />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(activity.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Șterge"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === activity.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-red-600">Sigur vrei să ștergi această activitate?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="btn btn-secondary"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="btn btn-danger"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

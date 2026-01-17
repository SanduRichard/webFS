import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activitiesAPI } from '../../services/api';
import { 
  Save, 
  Clock, 
  FileText, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const CreateActivity = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'duration' ? parseInt(value) : value 
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await activitiesAPI.create(formData);
      navigate(`/activity/${response.data.activity.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la crearea activității');
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [
    { value: 15, label: '15 minute' },
    { value: 30, label: '30 minute' },
    { value: 45, label: '45 minute' },
    { value: 60, label: '1 oră' },
    { value: 90, label: '1.5 ore' },
    { value: 120, label: '2 ore' },
    { value: 180, label: '3 ore' },
    { value: 240, label: '4 ore' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} />
        Înapoi la Dashboard
      </button>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Creează Activitate Nouă
          </h1>
          <p className="text-gray-600">
            Completează detaliile activității pentru a genera un cod unic de acces.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titlu activitate *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="Ex: Curs Programare Web - Săptămâna 5"
                required
                minLength={3}
                maxLength={255}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descriere (opțional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[100px] resize-y"
              placeholder="O scurtă descriere a activității..."
              rows={3}
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Durata activității *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock size={20} className="text-gray-400" />
              </div>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-with-icon appearance-none cursor-pointer"
                required
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Activitatea va expira automat după perioada selectată.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Ce se va întâmpla?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Se va genera un cod unic de 6 caractere pentru studenți</li>
              <li>• Studenții pot trimite feedback anonim în timp real</li>
              <li>• Vei vedea statisticile actualizate live</li>
              <li>• Activitatea se va închide automat după timpul setat</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary flex-1"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Creează Activitate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivity;

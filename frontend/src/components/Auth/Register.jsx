import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, UserCircle, AlertCircle, UserCog, GraduationCap, UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated, isTeacher } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'teacher'
  });
  
  const [validationError, setValidationError] = useState('');

  // Redirectează utilizatorii deja autentificați
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isTeacher ? '/dashboard' : '/join', { replace: true });
    }
  }, [isAuthenticated, isTeacher, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validare parolă
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Parolele nu coincid');
      return;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role
    });
    
    if (result.success) {
      // Nu mai e nevoie de navigate aici, useEffect se ocupă de redirectare
      // navigate(formData.role === 'teacher' ? '/dashboard' : '/join');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <GraduationCap size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Creează un cont de profesor</h1>
          <p className="text-gray-600">Gestionează activități și primește feedback în timp real</p>
        </div>

        {/* Error Alert */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error || validationError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nume complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="Ion Popescu"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="exemplu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Parolă
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmă parola
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={20} />
                <span>Creează cont</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Ai deja cont?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Autentifică-te
            </Link>
          </p>
        </div>

        {/* Student Link */}
        <div className="mt-4 text-center">
          <Link to="/join" className="text-gray-500 hover:text-gray-700 text-sm">
            Ești student? Intră într-o activitate →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

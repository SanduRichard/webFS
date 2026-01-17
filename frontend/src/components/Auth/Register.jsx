import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, User, UserPlus, AlertCircle, GraduationCap } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'teacher'
  });
  
  const [validationError, setValidationError] = useState('');

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
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Creează un cont</h1>
          <p className="text-gray-600">Înregistrează-te ca profesor</p>
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
                className="input pl-10"
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
                className="input pl-10"
                placeholder="exemplu@email.com"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'role', value: 'teacher' } })}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'teacher'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <GraduationCap size={24} />
                <span className="font-medium">Profesor</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'role', value: 'student' } })}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'student'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User size={24} />
                <span className="font-medium">Student</span>
              </button>
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
                className="input pl-10"
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
                className="input pl-10"
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

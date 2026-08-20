// frontend/src/pages/Registration.jsx
// Homepage — registration form

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User, Hash, Phone, Droplets, MapPin, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import { ButtonLoading } from '../components/Loading.jsx';
import { registrationSchema, BLOOD_GROUPS } from '../utils/validation.js';
import { registerMember } from '../services/api.js';

export default function Registration() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registrationSchema) });

  const handlePhotoChange = (file, error) => {
    setPhoto(file);
    setPhotoError(error);
  };

  const onSubmit = async (data) => {
    // Validate photo first
    if (!photo) {
      setPhotoError('Profile photo is required.');
      return;
    }
    if (photoError) return;

    setSubmitting(true);
    setServerError('');

    const formData = new FormData();
    formData.append('fullName', data.fullName.trim());
    formData.append('age', data.age);
    formData.append('mobileNumber', data.mobileNumber.trim());
    formData.append('bloodGroup', data.bloodGroup);
    formData.append('city', data.city.trim());
    formData.append('photo', photo);

    try {
      const response = await registerMember(formData);
      if (response.success) {
        // Store in sessionStorage as backup
        sessionStorage.setItem('ualg_member', JSON.stringify(response.data));
        navigate('/registration-success', { state: { member: response.data } });
      }
    } catch (err) {
      const msg = err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Cannot connect to API server. Please check if the Worker API is running.'
          : err.message || 'Registration failed. Please try again.');
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ualg-navy rounded-full mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-ualg-gold" />
          </div>
          <h1 className="text-3xl font-black text-ualg-navy leading-tight">
            Member Registration
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Join <span className="font-semibold text-ualg-blue">UNITY A LIVE GROUP</span> and get your official Digital ID Card
          </p>
        </div>

        {/* Form card */}
        <div className="card shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Manan Patel"
                  autoComplete="name"
                  className={`input-field pl-10 ${errors.fullName ? 'input-error' : ''}`}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1" role="alert">
                  <span>⚠</span> {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Age + Blood Group row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="age"
                    type="number"
                    placeholder="e.g. 18"
                    min="1"
                    max="120"
                    className={`input-field pl-10 ${errors.age ? 'input-error' : ''}`}
                    {...register('age')}
                  />
                </div>
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1" role="alert">⚠ {errors.age.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                  <select
                    id="bloodGroup"
                    className={`input-field pl-10 appearance-none cursor-pointer ${errors.bloodGroup ? 'input-error' : ''}`}
                    {...register('bloodGroup')}
                  >
                    <option value="">Select...</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-xs mt-1" role="alert">⚠ {errors.bloodGroup.message}</p>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                <input
                  id="mobileNumber"
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  autoComplete="tel"
                  className={`input-field pl-20 ${errors.mobileNumber ? 'input-error' : ''}`}
                  {...register('mobileNumber')}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-500 text-xs mt-1" role="alert">⚠ {errors.mobileNumber.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. Ahmedabad"
                  autoComplete="address-level2"
                  className={`input-field pl-10 ${errors.city ? 'input-error' : ''}`}
                  {...register('city')}
                />
              </div>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1" role="alert">⚠ {errors.city.message}</p>
              )}
            </div>

            {/* Photo upload */}
            <PhotoUpload
              value={photo}
              onChange={handlePhotoChange}
              error={photoError}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-base"
              aria-busy={submitting}
            >
              {submitting ? (
                <ButtonLoading text="Registering..." />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Register & Get ID Card
                </span>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By registering, you agree to be a member of UNITY A LIVE GROUP.
            </p>
          </form>
        </div>

        {/* Admin link (subtle) */}
        <div className="text-center mt-8">
          <a href="/admin/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Admin Portal →
          </a>
        </div>
      </main>
    </div>
  );
}

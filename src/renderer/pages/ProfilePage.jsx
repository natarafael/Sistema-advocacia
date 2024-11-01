import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomSeparator from '../components/BreadCrumbs';
import { useAuth } from '../services/Auth';
import ActivityLogSection from '../components/ActivityProfile';

const userSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  currentPassword: yup.string().when('newPassword', {
    is: (value) => value?.length > 0,
    then: () =>
      yup.string().required('Current password is required to change password'),
    otherwise: () => yup.string(),
  }),
  newPassword: yup
    .string()
    .test(
      'password-validation',
      'Password must be at least 6 characters',
      function (value) {
        if (!value) return true; // Allow empty if not changing password
        return value.length >= 6;
      },
    )
    .test(
      'password-complexity',
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      function (value) {
        if (!value) return true; // Allow empty if not changing password
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value);
      },
    ),
  confirmPassword: yup
    .string()
    .test('passwords-match', 'Passwords must match', function (value) {
      return !this.parent.newPassword || value === this.parent.newPassword;
    }),
});

export default function ProfilePage() {
  const { user, updateProfile, fetchProfile, changePassword } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
  });

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const profileData = await fetchProfile();
          setUserData(profileData);
          setValue('username', profileData.username);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    }
    loadProfile();
  }, [user, fetchProfile, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Handle profile update
      const updates = {
        username: data.username,
        updated_at: new Date(),
      };

      await updateProfile(updates);

      // Handle password change if new password is provided
      if (data.newPassword) {
        try {
          await changePassword(data.currentPassword, data.newPassword);
        } catch (error) {
          setError('currentPassword', {
            type: 'manual',
            message: 'Current password is incorrect',
          });
          throw error;
        }
      }

      alert('Profile updated successfully!');
      setShowPasswordForm(false);
      reset();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CustomSeparator title={'Perfil'} />
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              <h3 className="text-2xl font-semibold leading-7 text-gray-900">
                Perfil de Usuário
              </h3>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* Username field */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="username"
                    className="block text-xl font-medium leading-6 text-gray-900"
                  >
                    Nome de Usuário
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 px-2 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary sm:max-w-md">
                      <input
                        {...register('username')}
                        id="username"
                        type="text"
                        autoComplete="username"
                        defaultValue={userData?.username}
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-lg text-gray-900 placeholder:text-gray-400 focus:ring-0  sm:leading-6"
                      />
                      {errors.username && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-primary text-xl hover:text-primary-dark"
            >
              {showPasswordForm ? 'Cancelar' : 'Mudar Senha'}
            </button>

            {showPasswordForm && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    {...register('currentPassword')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    {...register('newPassword')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-lg text-red-600">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className=" py-2 px-4 border justify-center border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Mudanças'}
            </button>
          </div>
        </form>
        <ActivityLogSection />
      </div>
    </>
  );
}

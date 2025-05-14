import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarMenu from "../../components/InstituteSidebar";
import Navbar from '../../components/Navbar';
const url = import.meta.env.VITE_REACT_APP_URL;

const InstituteProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    college: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'accessToken': token
        }
      };

      const res = await axios.get(`${url}institute/profile`, config);
      setProfile(res.data.institute);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);

      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError(`Failed to load profile: ${err.response.data.msg || 'Unknown server error'}`);
        }
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All fields are required');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found. Please login again.');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'accessToken': token
        }
      };

      const payload = { currentPassword, newPassword };
      await axios.put(`${url}institute/password`, payload, config);

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowPasswordForm(false);
      toast.success('Password updated successfully');
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || 'Unexpected error';
      toast.error(msg);

      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      }
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
    </div>
  );

  // Error component
  const ErrorDisplay = () => (
    <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
      <div className="bg-white max-w-lg w-full rounded-xl shadow-xl p-8 border-l-4 border-red-500">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-lg text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-300 shadow-md font-medium"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // Profile Info Card component
  const ProfileInfoCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 w-full">
      <div className="px-10 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
      </div>

      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          <ProfileField label="Name" value={profile.name} />
          <ProfileField label="Email" value={profile.email} />
          <ProfileField label="Role" value={profile.role} />
          <ProfileField label="Institution" value={profile.college} />
        </div>
      </div>
    </div>
  );

  // Password Management Card component
  const PasswordManagementCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
      <div className="px-10 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Password Management</h2>
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition duration-300 flex items-center shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Change Password
          </button>
        ) : (
          <button
            onClick={() => setShowPasswordForm(false)}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 shadow-md"
          >
            Cancel
          </button>
        )}
      </div>

      {showPasswordForm ? (
        <div className="p-10">
          <form onSubmit={handlePasswordSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  required
                />
              </div>

              <div className="col-span-1"></div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  required
                  minLength="6"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                type="submit"
                disabled={
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
                className={`px-8 py-3 text-white font-medium rounded-lg transition duration-300 shadow-md ${!passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-12 flex items-center justify-center">
          <div className="text-center max-w-2xl py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-4">Password Management</h3>
            <p className="text-gray-600 mb-6">
              You can change your password at any time by clicking the button above.
              Make sure to choose a strong, unique password.
            </p>
            <p className="text-sm text-gray-500">
              For security reasons, you'll need to enter your current password first.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Profile field component
  const ProfileField = ({ label, value }) => (
    <div className="border-b border-gray-100 pb-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{label}</h3>
      <p className="text-xl font-medium text-gray-900">{value}</p>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar yes={1}/>
      <div className="flex flex-grow">
        <SidebarMenu activeSection={activeSection} setActiveSection={setActiveSection} />

        <div className="flex-1">

          <div className="max-w-full mx-auto px-8 py-12">
            <ProfileInfoCard />
            <PasswordManagementCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteProfile;
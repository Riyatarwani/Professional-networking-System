import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuthUser, authUser } = useContext(AuthContext);
  // Redirect to /dashboard if already authenticated
  useEffect(() => {
    // Only redirect if authenticated and not already on /dashboard
    if (authUser && window.location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
  try {
  console.log('Attempting login with:', { email, password }); // Debug log
  
  const response = await axios.post(
    'https://professional-networking-system-1.onrender.com/api/auth/login',
    {
      email,
      password
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true  // ✅ Add this here
    }
  );
   
  console.log('Login response:', response.data); // Debug log
      
      if (response.data.success) {
        // Store user data in localStorage and context
        const userData = response.data.user || { email };
        localStorage.setItem('chatapp', JSON.stringify(userData));
        setAuthUser(userData);
        toast.success('Login successful!');
        navigate("/dashboard");
      } else {
        const errorMsg = response.data.message || "Login failed";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.log('Server error response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection.";
        console.log('Network error:', err.request);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

   return (
     <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-300">
       <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col justify-center">
         <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-700">Sign In</h2>
         <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">Email</label>
             <input
               type="email"
               id="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
               required
               autoComplete="email"
             />
           </div>
           <div>
             <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">Password</label>
             <input
               type="password"
               id="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
               required
               autoComplete="current-password"
             />
           </div>
                       {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}
           <button
             type="submit"
             className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition duration-200 text-lg"
             disabled={loading}
           >
             {loading ? "Logging in..." : "Login"}
           </button>
           <div className="text-center mt-4">
             <p className="text-sm text-gray-600">
               Don't have an account?{' '}
               <button
                 type="button"
                 onClick={() => navigate('/register')}
                 className="text-blue-600 hover:text-blue-500"
               >
                 Register here
               </button>
             </p>
           </div>
         </form>
       </div>
     </div>
   );
};

export default Login;

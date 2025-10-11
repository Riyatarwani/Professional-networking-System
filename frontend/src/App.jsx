import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './login/Login.jsx';
import Register from './register/Register.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './home/Home.jsx';
import { VerifyUser } from './utils/VerifyUser.jsx';

function App() {
    return (
        <>
            <div className="p-2 w-screen h-screen flex items-center justify-center">
                <Routes>
                    {/* Default route redirects to /login */}
                    <Route path="/" element={<Navigate to="/login" />} />

                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route element={<VerifyUser />}>
                        <Route path="/dashboard" element={<Home />} />
                    </Route>

                    {/* Catch-all route redirects to /login */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
                <ToastContainer />
            </div>
        </>
    );
}

export default App;
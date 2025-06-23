import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'dashboard', element: <Dashboard /> },
      { index: true, element: <Login /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

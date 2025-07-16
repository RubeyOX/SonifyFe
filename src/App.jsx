import { Suspense, lazy } from 'react'
import './App.css'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import "@fontsource/montserrat";
import "./components/colors/palette.css"

const MainLayout = lazy(() => import("./components/MainLayout"))
const SigninLayout = lazy(() => import("./components/SigninLayout"))
const Homepage = lazy(() => import("./components/pages/Homepage/Homepage"))
const Loading = lazy(() => import("./components/common/Loading"))
const Login = lazy(() => import("./components/auth/Login/Login"))
const Signup = lazy(() => import("./components/auth/Signup/Signup"))
const Verifyemail = lazy(() => import('./components/auth/VerifyMail'))
const ForgotPass = lazy(() => import('./components/auth/Forgotpass'))
const NotFound = lazy(() => import("./components/common/NotFound"))
const VerifyEmailPortal = lazy(() => import("./components/auth/verifyEmailPortal"))
const Dashboard = lazy(() => import('./component/pages/Dashboard/Dashboard'))
const DashboardLayout = lazy(() => import('./components/DashboardLayout'))
const Router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <MainLayout />
      </Suspense>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to='/home' replace />
      },
      {
        path: '/home',
        element: (
          <Suspense fallback={<Loading />}>
            <Homepage />
          </Suspense>
        )
      },
      {
        element: (
          <Suspense fallback={<Loading />}>
            <DashboardLayout />
          </Suspense>
        ),
        children: [
          {
            path: '/dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            )
          }
        ]
      },
    ],
  }, {
    path: '/',
    element: <SigninLayout />,
    children: [
      {
        path: 'login',
        element: (
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        )
      },
      {
        path: 'signup',
        element: (
          <Suspense fallback={<Loading />}>
            <Signup />
          </Suspense>
        )
      },
      {
        path: 'verifyemail/:email',
        element: (
          <Suspense fallback={<Loading />}>
            <Verifyemail />
          </Suspense>
        )
      },
      {
        path: 'verify/t/:token',
        element: (
          <Suspense fallback={<Loading />}>
            <VerifyEmailPortal />
          </Suspense>
        )
      },
      {
        path: 'forgotpass',
        element: (
          <Suspense fallback={<Loading />}>
            <ForgotPass />
          </Suspense>

        )
      },
      {
        path: 'forgotpass/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <ForgotPass />
          </Suspense>
        )
      },
    ]
  }
])

export default Router
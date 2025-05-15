import { Suspense, lazy } from 'react'
import './App.css'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import "@fontsource/montserrat";

const MainLayout = lazy(() => import("./component/MainLayout"))
const SigninLayout=lazy(()=>import("./component/SigninLayout"))
const Homepage = lazy(() => import("./component/pages/Homepage/Homepage"))
const Loading = lazy(() => import("./component/common/Loading"))
const Login = lazy(() => import("./component/auth/Login/Login"))
const Signup = lazy(()=>import("./component/auth/Signup/Signup"))
const Verifyemail=lazy(()=>import('./component/auth/VerifyMail'))
const ForgotPass=lazy(()=>import('./component/auth/Forgotpass'))
const NotFound = lazy(() => import("./component/common/NotFound"))
const Dashboard=lazy(()=>import('./component/pages/Dashboard/Dashboard'))
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
        index:true,
        element:<Navigate to='/home' replace/>
      },
      {
        path:'/home',
        element: (
          <Suspense fallback={<Loading />}>
            <Homepage />
          </Suspense>
        )
      },
    ],
  },{
    path:'/',
    element:<SigninLayout/>,
    children:[
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
        element:(
          <Suspense fallback={<Loading/>}>
            <Signup/>
          </Suspense>
        )
      },
      {
        path:'forgotpass',
        element:(
          <Suspense fallback={<Loading/>}>
            <ForgotPass/>
          </Suspense>
          
        )
      },
      {
        path:'forgotpass/:id',
        element:(
          <Suspense fallback={<Loading/>}>
            <ForgotPass/>
          </Suspense>
        )
      },
      {
        path:'dashboard',
        element:(
          <Suspense fallback={<Loading/>}>
            <Dashboard/>
          </Suspense>
        )
      }
    ]
  }
])

export default Router
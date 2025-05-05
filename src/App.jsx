import { Suspense, lazy } from 'react'
import './App.css'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import "@fontsource/montserrat";
import "./components/colors/palette.css"

const MainLayout = lazy(() => import("./components/MainLayout"))
const SigninLayout=lazy(()=>import("./components/SigninLayout"))
const Private = lazy(() => import("./components/Private"))
const Homepage = lazy(() => import("./components/pages/Homepage/Homepage"))
const User = lazy(() => import("./components/pages/Homepage/User"))
const Loading = lazy(() => import("./components/common/Loading"))
const Login = lazy(() => import("./components/auth/Login/Login"))
const Signup = lazy(()=>import("./components/auth/Signup/Signup"))
const Verifyemail=lazy(()=>import('./components/auth/VerifyMail'))
const ForgotPass=lazy(()=>import('./components/auth/Forgotpass'))
const NotFound = lazy(() => import("./components/common/NotFound"))
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
      {
        path: '/',
        element: (
          <Suspense fallback={<Loading />}>
            <Private />
          </Suspense>
        ),
        children: [
          {
            path: 'user',
            element: (
              <Suspense fallback={<Loading />}>
                <User />
              </Suspense>
            )
          },
        ]
      }
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
      }
    ]
  }
])

export default Router
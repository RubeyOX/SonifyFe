import { Suspense, lazy } from 'react'
import './App.css'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import "@fontsource/montserrat";

const MainLayout = lazy(() => import("./component/MainLayout"))
const SigninLayout=lazy(()=>import("./component/SigninLayout"))
const Private = lazy(() => import("./component/Private"))
const Homepage = lazy(() => import("./component/pages/Homepage/Homepage"))
const User = lazy(() => import("./component/pages/User"))
const Loading = lazy(() => import("./component/Loading"))
const Login = lazy(() => import("./component/pages/Login/Login"))
const Signup = lazy(()=>import("./component/pages/Signup/Signup"))
const Verifyemail=lazy(()=>import('./component/VerifyMail'))
const ForgotPass=lazy(()=>import('./component/Forgotpass'))
const NotFound = lazy(() => import("./component/pages/NotFound"))
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
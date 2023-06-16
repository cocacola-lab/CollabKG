import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Route, Router, Switch } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./features/auth/authcontext";
import { Login } from "./features/auth/login";
import { ProtectedRoute } from "./features/auth/protectedroute";
import { SignUp } from "./features/auth/signup";
import { Unauthorized } from "./features/auth/unauthorized";
import { Feed } from "./features/feed/feed";
import { Landing } from "./features/landing/landing";
import { PortalModal } from "./features/modals/modalportal";
import { AlertPortal } from "./features/alerts/alertportal";
import { Create } from "./features/projectcreation/create";
import { Project } from "./features/project/project";
import { Dashboard } from "./features/dashboard/Dashboard";
import About from "./features/about/About";
import { Profile } from "./features/profile/Profile";
import history from "./features/utils/history";

// import { Anonpage } from "./features/auth/anonpage";
// import { Dev } from "./features/dev/dev";

import Layout from "./features/common/Layout";

import { useDispatch, useSelector } from "react-redux";
import { selectAnnotationMode, setAnnotationMode } from "./app/dataSlice";

// dataSlice就相当于加载完project后用，标注用的
function App() {
  const dispatch = useDispatch(); // redux tool
  const annotationMode = useSelector(selectAnnotationMode); // initialState.annotationMode

  // hook, 副效应函数
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.keyCode === 77) { // 按下ctrl+M 
        dispatch(
          setAnnotationMode(annotationMode === "entity" ? "relation" : "entity") // ()里相当于setAnnotationMode的action.payload
        );
      }
    };

    window.addEventListener("keydown", handler, false); // 监听
    return () => window.removeEventListener("keydown", handler, false); // 组件卸载时清除副效应
  }, [annotationMode]);

  // component 是对应的页面/组件
  const routes = [
    {
      protected: true,
      title: "Profile",
      path: "/profile",
      name: "User Profile",
      component: <Profile />,
    },
    {
      protected: true,
      title: "Annotation",
      path: "/annotation/:projectId/page=:pageNumber",
      name: "Annotation",
      component: <Project />,
    },
    {
      protected: true,
      title: "New Project",
      path: "/project/new",
      name: "New Project",
      component: <Create />,
    },
    {
      protected: true,
      title: "Projects",
      path: "/feed",
      name: "Project Feed",
      component: <Feed />,
    },
    {
      protected: true,
      title: "Dashboard",
      path: "/dashboard/:projectId",
      name: "Dashboard",
      component: <Dashboard />,
    },
    {
      protected: false,
      title: "About",
      path: "/about",
      layout: null,
      name: null,
      component: <About />,
    },
    {
      protected: false,
      title: "Login",
      path: "/login",
      layout: null,
      name: null,
      component: <Login />,
    },
    {
      protected: false,
      title: "Signup",
      path: "/signup",
      layout: null,
      name: null,
      component: <SignUp />,
    },
    {
      protected: false,
      title: "Collabration (Event) Knowledge Graph Extraction",
      path: "/",
      name: null,
      layout: null,
      component: <Landing />,
    },
  ];

  // ProtectedRoute 是为了保护一些页面，对于未登陆的用户不可访问；Layout是上下的任务栏
  return (
    <Router history={history}>
      <AuthProvider>
        <Switch>
          {routes.map((route) => {
            //console.log(route)
            if (route.protected) {
              return (
                <ProtectedRoute path={route.path}>
                  <Helmet>
                    <title>{route.title} | CollabKG</title>
                  </Helmet>
                  <Layout
                    children={route.component}
                    context={{ name: route.name }}
                  />
                  <AlertPortal />
                  <PortalModal />
                </ProtectedRoute>
              );
            } else {
              return (
                <Route exact path={route.path}>
                  <Helmet>
                    <title>{route.title} | CollabKG</title>
                  </Helmet>
                  {route.layout ? (
                    <Layout
                      children={route.component}
                      context={{ name: route.name }}
                    />
                  ) : (
                    route.component
                  )}
                </Route>
              );
            }
          })}

          {/* <Route exact path="/dev" component={Dev} /> */}

          <Route exact path="/unauthorized" component={Unauthorized} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;

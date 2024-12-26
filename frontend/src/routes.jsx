import { useRoutes } from 'react-router-dom';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';

import Login from './components/login';
import Register from './components/register'
import DashboardLayout from './layouts/dashboard';
import Dashboard from './components/dashboard';
import Group from './components/groups';
import CreateGroup from './components/groups/createGroup';
import ViewGroup from './components/groups/viewGroup';
import EditGroup from "./components/groups/EditGroup.jsx"
import AddExpense from './components/expense/AddExpense.jsx';
import { ViewExpense } from './components/expense/ViewExpense.jsx';
import EditExpense from './components/expense/EditExpense.jsx';
import configData from "./config.json"

import { GroupSettlementsCall } from './components/groups/settlement/index.jsx';



export default function Router() {
    return useRoutes([
        {
            path: configData.DASHBOARD_HOME_URL,
            element: <DashboardLayout />,
            children: [
                {
                    path: configData.DASHBOARD_URL,
                    element: <Dashboard />
                },
                {
                    path: configData.CREATE_GROUP_URL,
                    element: <CreateGroup />
                },
                {
                    path: configData.ADD_EXPENSE_ROUTER_URL,
                    element: <AddExpense />
                },
                {
                    path: configData.EDIT_EXPENSE_ROUTER_URL,
                    element: <EditExpense />
                },
                {
                    path: configData.VIEW_EXPENSE_ROUTER_URL,
                    element: <ViewExpense />
                },
                {
                    path: configData.USER_GROUPS_URL,
                    element: <Group />
                },
                {
                    path: configData.VIEW_GROUP_ROUTER_URL,
                    element: <ViewGroup />
                },
                {
                    path: configData.EDIT_GROUP_ROUTER_URL,
                    element: <EditGroup />
                },
                {
                    path: configData.SETTLEMENT_ROUTER_URL,
                    element: <GroupSettlementsCall />
                },
                // {path:configData.ABOUT_URL,
                //   element: <About/>},
                // {
                //     path: configData.USER_PROFILE_URL,
                //     element: <Profile />
                // }
            ]
        }, {
            path: configData.LOGIN_URL,
            element: <LogoOnlyLayout />,
            children: [
                { path: '/', element: <Login /> },
                { path: configData.REGISTER_URL, element: <Register /> },
                // {path: configData.USER_DELETED_URL, element: <PageUserDeleted/>},
                // {path:configData.ABOUT_URL,element: <About/>}
            ]
        },
        { path: '*', element: <div>404 - Page Not Found</div> },
    ])
}
import { useRoutes } from 'react-router-dom';
import DashboardLayout from './layouts/dashboard';
import Dashboard from './components/dashboard';
import Group from './components/groups';
import CreateGroup from './components/groups/createGroup';
import ViewGroup from './components/groups/viewGroup';
import EditGroup from "./components/groups/EditGroup.jsx"

import configData from "./config.json"



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
                // {
                //     path: configData.ADD_EXPENSE_ROUTER_URL,
                //     element: <AddExpense />
                // },
                // {
                //     path: configData.EDIT_EXPENSE_ROUTER_URL,
                //     element: <EditExpense />
                // },
                // {
                //     path: configData.VIEW_EXPENSE_ROUTER_URL,
                //     element: <ViewExpense />
                // },
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
                // {path:configData.ABOUT_URL,
                //   element: <About/>},
                // {
                //     path: configData.USER_PROFILE_URL,
                //     element: <Profile />
                // }
            ]
        },
        { path: '*', element: <div>404 - Page Not Found</div> },
    ])
}
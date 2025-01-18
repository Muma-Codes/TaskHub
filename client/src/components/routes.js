import App from "../App";
import Login from "./Login";
import SignUp from "./SignUp";
import AddTask from "./AddTask";
import Tasks from "./Tasks";
import Categories from "./Categories";
import Display from "./Display";
const routes=[
    {
        path:"/",
        element:<App/>,
    },
    {
        path:"/signup",
        element:<SignUp/>,
    },
    {
        path:"/login",
        element:<Login/>,
    },
    {
        path:"/add-task",
        element:<AddTask/>,
    },
    {
        path:"/tasks",
        element:<Tasks/>,
    },
    {
        path:"/categories",
        element:<Categories/>,
    },
    {
        path:"/my-tasks",
        element:<Display/>,
    }
];
export default routes;

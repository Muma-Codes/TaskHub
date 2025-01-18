import { useState, useEffect } from "react";
import AddTask from "./AddTask";
import Tasks from "./Tasks";
import Categories from "./Categories";
import TaskCompletionStatus from "./TaskCompletionStatus";
function TaskManager(){
    const [categories, setCategories]=useState([]);
    const [tasks, setTasks]=useState([]);
    const [selectedCategoryId, setSelectedCategoryId]=useState(null);
    const [isSidebarOpen, setIsSidebarOpen]=useState(false);

    useEffect(()=>{
        fetchCategories();
        fetchTasks();
    }, []);

    async function fetchCategories(){
        try {
            const response=await fetch('https://taskhub-server.onrender.com/categories', {
                credentials:"include"
            });
            if(response.ok){
                const data=await response.json();
                setCategories(data);
            } 
        } catch (error){
            console.error(error.statusText);
        }
    }

    async function fetchTasks(){
        try{
            const response=await fetch("https://taskhub-server.onrender.com/tasks", {
                credentials:"include"
            });
            if(response.ok){
                const data=await response.json();
                setTasks(data);
            } else {
                const errorData=await response.json();
                console.error(errorData);
            }
        } catch(error){
            console.error(error);
        }
    }

    function handleCategoryUpdate(updatedCategory){
        // update categories
        setCategories(categories.map(category=>
            category.id === updatedCategory.id ? updatedCategory : category
        ));

        // update category name in tasks
        setTasks(tasks.map(task=>
            task.category.id === updatedCategory.id
            ? {
                ...task,
                category: {
                    ...task.category,
                    name:updatedCategory.name
                }
            }
            : task
        ));
    };

    const filteredTasks=selectedCategoryId ? tasks.filter(task=>task.category.id===selectedCategoryId) : tasks;


    return (
        <div className="min-h-screen bg-gray-50">
            {/* mobile header with menu button - only shows on mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
                <h1 className="text-xl font-bold">Todo List</h1>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <i className="bi bi-list w-6 h-6"></i>
                </button>
            </div>
            <div className="flex flex-col lg:flex-row">
                {/* sidebar */}
                <div className={`
                    fixed lg:static inset-0 z-30 transform 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 transition-transform duration-300 ease-in-out
                    w-64 bg-white border-r border-gray-100
                    ${isSidebarOpen ? 'block' : 'hidden'} lg:block
                    `}>
                        {/* close button for mobile */}
                        <div className="lg:hidden flex justify-end p-4">
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <i className="bi bi-x w-6 h-6"></i>
                            </button>
                        </div>
                            <Categories categories={categories} setCategories={setCategories} onCategoryUpdate={handleCategoryUpdate} selectedCategoryId={selectedCategoryId} setSelectedCategoryId={setSelectedCategoryId}/>
                    </div>
                    {/* main content area */}
                    <div className="flex-1 p-4 lg:p-6 space-y-6 min-h-screen overflow-x-hidden">
                        <AddTask categories={categories} tasks={tasks} setTasks={setTasks}/>
                        <TaskCompletionStatus tasks={tasks} selectedCategoryId={selectedCategoryId}/>
                        <Tasks tasks={filteredTasks} setTasks={setTasks} categories={categories}/>
                    </div>
            </div>
        </div>
    );
}
export default TaskManager;

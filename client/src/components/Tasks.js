import { useState, useEffect } from "react";

function Tasks({tasks, setTasks, categories}){
    const [success, setSuccess]=useState('');
    const [taskId, setTaskId]=useState(null);
    const [updateTask, setUpdateTask]=useState({
        updated_task:'',
        updated_date:'',
        updated_time:'',
        updated_category:''
    });


    useEffect(()=>{
            let timeoutId;
            if(success){
                timeoutId=setTimeout(()=>{
                    setSuccess('');
                }, 3000);
            }
            return ()=>{
                if(timeoutId){
                    clearTimeout(timeoutId);
                }
            };
        }, [success]);

    async function handleDeleteTaskButton(id){
        try{
            const response=await fetch(`https://taskhub-server.onrender.com/task/${id}`, {
                method:"DELETE",
                credentials:"include"
            });
            if(response.ok){
                const success=await response.json();
                setTasks(tasks.filter(task=>task.id!==id));
                setSuccess(success.msg);
            } else {
                alert(`Failed to delete task ${id}`);
            }
        } catch(error){
            console.error(error);
        }
    }

    async function handleCheckboxChange(task, e){
        const isChecked=e.target.checked;
        try{
            const response=await fetch(`https://taskhub-server.onrender.com/task/${task.id}`, {
                method:'PATCH',
                credentials:'include',
                headers:{
                    'Content-Type':'application/json',
                    'Accept':'application/json'
                },
                body:JSON.stringify({
                    is_complete:isChecked
                })
            });
            if(response.ok){
                setTasks(tasks.map(tasc=>(
                    tasc.id===task.id ? {...tasc, is_complete:isChecked} : tasc
                )));
            } else {
                alert('Failed to update task completion status');
            }
        } catch(error){
            console.error(error);
        }
    }

    async function handleTaskEditButton(id, e){
        e.preventDefault();
        
        try{
            const response=await fetch(`https://taskhub-server.onrender.com/task/${id}`, {
                method:"PATCH",
                credentials:"include",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    updated_task:updateTask.updated_task,
                    updated_date:updateTask.updated_date,
                    updated_time:updateTask.updated_time,
                    updated_category:updateTask.updated_category
                })
            });
            if(response.ok){
                const data=await response.json();
                console.log(data);
                setTasks(tasks.map(task=>{
                    if(task.id===id){
                        return {
                            ...task,
                            task:data.task,
                            date:data.date,
                            time:data.time,
                            category:{
                                id:data.category_id,
                                name:data.category_name
                            }
                        };
                    }
                    return task;
                }));
                setTaskId(null);
                setUpdateTask({
                    updated_task:'',
                    updated_date:'',
                    updated_time:'',
                    updated_category:''
                });
            } else {
                const errorData=await response.json();
                alert('Failed to update task', errorData);
            }
        } catch(error){
            console.error(error);
        }
    }

    function handleEditClick(task){
        setTaskId(task.id);
        setUpdateTask({
            updated_task: task.task,
            updated_date: task.date,
            updated_time: task.time,
            updated_category: task.category.id
        })
    }

    return (
        <div className="max-w-4xl mx-auto">
                <ol className="space-y-3">
                    {tasks.map((task)=>(
                        <li key={task.id} className="bg-white rounded-lg shadow-sm p-4">
                            {taskId===task.id ? (
                                <form onSubmit={(e)=>handleTaskEditButton(task.id, e)} className="space-y-4">
                                    <input type="text" name="task" value={updateTask.updated_task} onChange={(e)=>setUpdateTask({
                                        ...updateTask,
                                        updated_task:e.target.value
                                    })} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" required/>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="date" value={updateTask.updated_date} onChange={(e)=>setUpdateTask({
                                            ...updateTask,
                                            updated_date:e.target.value
                                        })} className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"/>
                                        <input type="time" value={updateTask.updated_time} onChange={(e)=>setUpdateTask({
                                            ...updateTask,
                                            updated_time:e.target.value
                                        })} className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" required/>
                                        <select value={updateTask.updated_category} name="category" onChange={(e)=>setUpdateTask({
                                            ...updateTask,
                                            updated_category:e.target.value
                                            })} className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" required>
                                                <option value="" disabled>Select a Category</option>
                                                {categories.map(category=>(
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Update</button>
                                        <button type="button" onClick={()=>setTaskId(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                    </div>
                            </form>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3">
                                    <input type="checkbox" name="checkbox" checked={task.is_complete || false} onChange={(e)=>handleCheckboxChange(task, e)} className="mt-1 sm:mt-0 w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-black"/>
                                    <div className={`${task.is_complete ? 'line-through text-gray-400' : 'text-gray-800'} flex flex-col sm:flex-row sm:items-center gap-2`}>
                                        <span>{task.task}</span>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="hidden sm:inline mx-2">•</span>
                                            <span>{task.date}</span>
                                            <span className="mx-1">{task.time}</span>
                                            <span className="hidden sm:inline mx-2">•</span>
                                            <span>{task.category.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:flex-none ml-8 sm:ml-0">
                                    <button onClick={()=>handleEditClick(task)} className="p-1 text-gray-400 hover:text-gray-600"><i className="bi bi-pencil-square w-4 h-4"></i></button>
                                    <button onClick={()=>handleDeleteTaskButton(task.id)} className="p-1 text-gray-400 hover:text-gray-600"><i className="bi bi-trash w-4 h-4"></i></button>                                   
                                </div>
                            </div>
                        )}
                    </li>
                ))}
                </ol>
                {success && <p className="mt-4 text-pretty text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-center">{success}</p>}
            </div>
    );

}
export default Tasks;
// map tasks: each task to have a radio button, the task itself, the date it is supposed to be carried out, the category it belongs to, an option for editing the task and also an option for deleting the task 
// include a radio button which if clicked, marks the task as complete and the radio button turns to a tick

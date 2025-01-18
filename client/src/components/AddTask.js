import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
function AddTask({categories, tasks, setTasks}){
    const [success, setSuccess]=useState('');
    const [error, setError]=useState('');
    
    useEffect(()=>{
        let timeoutId;
        if(success || error){
            timeoutId=setTimeout(()=>{
                setSuccess('');
                setError('');
            }, 3000);
        }
        return ()=>{
            if(timeoutId){
                clearTimeout(timeoutId);
            }
        };
    }, [success, error]);
    
    const formik=useFormik({
        initialValues:{
            task:"",
            date:"",
            time:"",
            category_id:""
        },
        validationSchema:Yup.object({
            task:Yup.string()
            .min(1, "Task description cannot be empty")
            .required("Task description is required"),
            date:Yup.date()
            .required("Date is required"),
            time:Yup.string()
            .required("Time is required"),
            category_id:Yup.number()
            .required("Category is required")
        }),
        onSubmit:async(values, { resetForm })=>{
            try{
                const response=await fetch("https://taskhub-server.onrender.com/tasks", {
                    method:"POST",
                    credentials:"include",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(values)
                });
                if(response.ok){
                    const data=await response.json();
                    setTasks([...tasks, {
                        id:data.id,
                        task:data.task,
                        date:data.date,
                        time:data.time,
                        category:{
                            id:data.category.id,
                            name:data.category.name
                        }
                    }]);
                    setSuccess('Task added successfully')
                    setError('');
                    resetForm();
                } else {
                    const errorData=await response.json();
                    setError('Failed to add task', errorData);
                    setSuccess('');
                }
                resetForm();
            } catch(error){
                console.error(error);
            }
        }
    })
    return(
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                    <div className="hidden lg:flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Todo List</h2>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <i className="bi bi-moon w-5 h-5"></i>
                        </button>
                    </div>
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="task" className="text-sm font-medium text-gray-700">Task:</label>
                                <div className="space-y-2">
                                    <textarea id="task" name="task" value={formik.values.task} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Buy milk" className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black min-h-[80px]" required></textarea>
                                    {formik.touched.task && formik.errors.task ? (<p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.task}</p>) : null}
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="date" className="text-sm font-medium text-gray-700">Date:</label>
                                    <div className="space-y-2">
                                        <input type="date" id="date" name="date" value={formik.values.date} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="YYYY/MM/DD" className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" required/>
                                        {formik.touched.date && formik.errors.date ? (<p className="text-sm text-red-600 font-medium">{formik.errors.date}</p>) : null}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="time" className="text-sm font-medium text-gray-700">Time:</label>
                                    <div className="space-y-2">
                                        <input type="time" id="time" name="time" value={formik.values.time} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"/>
                                        {formik.touched.time && formik.errors.time ? (<p className="text-sm text-red-600 font-medium">{formik.errors.time}</p>) : null}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 grid gap-2">
                                    <label htmlFor="category_id" className="text-sm font-medium text-gray-700">Category</label>
                                    <div className="space-y-2">
                                        <select id="category_id" name="category_id" value={formik.values.category_id} onChange={formik.handleChange} onBlur={formik.handleBlur} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black" required> {/* add onChange attr */}
                                            <option value="" disabled>Select a Category</option>
                                            {categories.map((category)=>(
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                        {formik.touched.category_id && formik.errors.category_id ? (<p className="text-sm text-red-600 font-medium">{formik.errors.category_id}</p>) : null}
                                    </div>
                                </div>
                                <button type="submit" className="self-end p-2 h-[42px] w-[42px] bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center">
                                    <i className="bi bi-plus-square w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="mt-4 space-y-2">
                    {success && <p className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 text-center">{success}</p>}
                    {error && <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">{error}</p>}
                </div>
            </div>
    );

}
export default AddTask;

// use formik: task, date, category_id




import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
function Categories({categories, setCategories, onCategoryUpdate, selectedCategoryId, setSelectedCategoryId}){
    const [success, setSuccess]=useState('');
    const [error, setError]=useState('');
    const [categoryId, setCategoryId]=useState(null);
    const [newName, setNewName]=useState('');

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

    async function handleCategoryDeleteButton(id){
        try {
            const response=await fetch(`https://taskhub-server.onrender.com/category/${id}`, {
                method:"DELETE",
                credentials:"include"
            });
            if(response.ok){
                const data=await response.json();
                setCategories(categories.filter(category=>category.id!==id));
                setSuccess(data.msg);
                setError('');
            }
        } catch (error){
            console.error(error);
        }
    }
   
    const formik=useFormik({
        initialValues:{
            name:""
        },
        validationSchema:Yup.object({
            name:Yup.string()
            .min(1, "Category name cannot be empty")
            .required("Category name is required")
        }),
        onSubmit:async(values, { resetForm })=>{
            try{
                const response=await fetch("https://taskhub-server.onrender.com/categories", {
                    method:"POST",
                    credentials:"include",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(values)
                });
                if(response.ok){
                    const category=await response.json();
                    console.log(category);
                    setCategories([...categories, {
                        id:category.id,
                        name:category.name
                    }]);
                    setSuccess('Category added successfully');
                    setError('');
                } else {
                    const errorData=await response.json();
                    setError(errorData.error);
                    setSuccess('');
                }
                resetForm();
            } catch(error){
                console.error(error);
            }
        }
    });

    async function handleEditCategoryButton(id, e){
        e.preventDefault();

        if(!newName.trim()){
            setError('Category name cannot be empty');
            return;
        }
        try{
            const response=await fetch(`https://taskhub-server.onrender.com/category/${id}`, {
                method:"PATCH",
                credentials:"include",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json"
                },
                body:JSON.stringify({
                    updated_name:newName
                })
            });
            if(response.ok){
                const data=await response.json();
                const updatedCategory={id: data.id, name: data.name};
                onCategoryUpdate(updatedCategory);
                // setCategories(categories.map(category=>(
                //     category.id===id ? {...category, id: data.id, name: data.name } : category
                // )));
                setSuccess(data.msg);
                setError('');
                setCategoryId(null);
                setNewName('');
            } else {
                const errorData=await response.json();
                setError(errorData.error);
                setSuccess('');
            }
        } catch(error){
            console.error(error);
        }
    }

    function handleEditClick(category){
        setCategoryId(category.id);
        setNewName(category.name);
        setError('');
        setSuccess('');
    }

    function handleCategoryClick(categoryId){
        setSelectedCategoryId(categoryId);
    }


    return (
        <div className="w-64 p-6 border-r border-gray-200 bg-white">
            <h2 className="text-2xl font-bold mb-6">Categories</h2>
            <ul className="space-y-4 mb-6">
                <li key="all" className="flex items-center space-x-3">
                    <span onClick={()=>handleCategoryClick(null)} className={`cursor-pointer ${selectedCategoryId === null ? 'font-bold' : ''} text-gray-600 hover:text-gray-900`}>
                        All
                    </span>
                </li>
                {categories.map(category=>(
                    <li key={category.id} className="flex items-center justify-between group">
                        {categoryId===category.id ? (
                            <form onSubmit={(e)=>handleEditCategoryButton(category.id, e)} className="flex space-x-2">
                                <input type="text" name="updated_name" value={newName} onChange={e=>setNewName(e.target.value)} className="px-2 py-1 border rounded" autoFocus/>
                                <button type="submit" className="px-2 py-1 bg-black text-white rounded hover:bg-gray-800">Update</button>
                                <button type="button" onClick={()=>{
                                    setCategoryId(null);
                                    setNewName('');
                                    setError('');
                                }} className="px-2 py-1 border rounded">Cancel</button>
                            </form>
                        ) : (
                            <>
                                <span onClick={()=>handleCategoryClick(category.id)}  className={`cursor-pointer ${selectedCategoryId === category.id ? 'font-bold' : ''} text-gray-600 hover:text-gray-900`}>{category.name}</span>
                                <div className="hidden group-hover:flex space-x-2">
                                    <button onClick={()=>handleEditClick(category)} className="p-1 text-gray-400 hover:text-gray-600"><i className="bi bi-pencil-square w-4 h-4"></i></button>
                                    <button onClick={()=>handleCategoryDeleteButton(category.id)} className="p-1 text-gray-400 hover:text-gray-600"><i className="bi bi-trash w-4 h-4"></i></button>   
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>


            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm/6 font-medium text-gray-700">New Category:</label>
                    <div className="mt-1">
                        <input type="text" id="name" name="name" placeholder="Category 1" value={formik.values.name} onChange={formik.handleChange} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" autoComplete="name" required/>
                    </div>
                </div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add Category</button>
            </form>
            {success && <p className="mt-4 text-pretty text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-center">{success}</p>}
            {error && <p className="mt-4 text-pretty text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 flex items-center justify-center">{error}</p>}
        </div>
    );

}
export default Categories;

import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
function SignUp(){
    const [success, setSuccess]=useState('');
    const [error, setError]=useState('');
    const navigate=useNavigate('');

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
            name:"",
            email:"",
            password:"",
            confirmPassword:""
        },
        validationSchema:Yup.object({
            name:Yup.string()
            .min(3, "Name must be at least 3 characters long")
            .required("Name is required"),
            email:Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
            password:Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required")
            .matches(/[0-9]/, "Password must include a number")
            .matches(/[a-zA-Z]/, "Password must include a letter")
            .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must include a special character"),
            confirmPassword:Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords should match")
            .required("Confirm password is required")
        }),
        onSubmit: async(values, { resetForm })=>{
            try {
                const response=await fetch("https://taskhub-server.onrender.com/users", {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(values)
                });
                if(response.ok){
                    const person=await response.json();
                    navigate('/my-tasks');
                    setSuccess("Account created successfully", person.name);
                } else{
                    const errorData=await response.json();
                    setError("Failed to create account", errorData)
                }
                resetForm();
            } catch(error){
                console.error(error);
            }
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50">
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Create your account</h2>
                    <p className="mt-10 text-center text-lg/6 font-bold text-gray-900">Start managing your tasks efficiently</p>
                </div>
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">Name:</label>
                            <div className="mt-2">
                                <input type="text" name="name" id="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="John Doe" autoComplete="name" required/>
                            </div>
                            {formik.touched.name && formik.errors.name ? (<p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.name}</p>) : null}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Email:</label>
                            <input type="email" name="email" id="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="xyz@gmail.com" autoComplete="email" required/>
                            {formik.touched.email && formik.errors.email ? (<p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.email}</p>) : null}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Password:</label>
                            <input type="password" name="password" id="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Password" required/>
                            {formik.touched.password && formik.errors.password ? (<p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.password}</p>) : null}
                        </div>
                        <div>
                            <label htmlFor="confirm_password" className="block text-sm/6 font-medium text-gray-900">Confirm Password:</label>
                            <input type="password" name="confirmPassword" id="confirm_password" value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur} className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" placeholder="Confirm Password" required/>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (<p className="mt-2 text-sm text-red-600 font-medium">{formik.errors.confirmPassword}</p>) : null}
                        </div>
                        <div>
                            <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign up</button>
                        </div>
                    </form>
                    </div>
                    {success && <p className="mt-4 text-pretty text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-center">{success}</p>}
                    {error && <p className="mt-4 text-pretty text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md p-3 flex items-center justify-center">{error}</p>}
                    <p className="mt-10 text-center text-sm/6 text-gray-500">Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link></p>
            </div>
        </div>
    );
}
export default SignUp;

//use formik: name, email, password, confirm_password

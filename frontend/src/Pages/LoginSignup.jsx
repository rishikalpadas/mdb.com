import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import { base_url} from '../Config/config'

const LoginSignup = () => {

  const config = base_url
  const [state,setState] = useState("Login");
  const [formData,setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Designer"
  });

  const changeHandler = (e) => {
    setFormData({...formData,[e.target.name]: e.target.value});
  }

  const login = async () => {
      console.log("Login executed",formData);
      let responseData ;
    await fetch(`${config}/login`,{
      method: "POST",
      headers: {
        Accept : "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json())
    .then((data) => {
      responseData = data;
    })
    if (responseData.success) {
      localStorage.setItem('auth-token',responseData.token);
      localStorage.setItem('role',responseData.role);
      localStorage.setItem('id',responseData.id);
      localStorage.setItem('username',responseData.name);
      // {responseData.role==="Designer"?window.location.href = "http://localhost:5173":window.location.href = "/"}
      window.location.href = "/"
    }
    else{
      alert(responseData.errors);
    }
  }

  const signup = async () => {
    console.log("Signup executed",formData);
    let responseData ;
    await fetch(`${config}/signup`,{
      method: "POST",
      headers: {
        Accept : "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json())
    .then((data) => {
      responseData = data;
    })
    if (responseData.success) {
      localStorage.setItem('auth-token',responseData.token);
      localStorage.setItem('role',responseData.role);
      localStorage.setItem('id',responseData.id);
      localStorage.setItem('username',responseData.name);
      window.location.href = "/"
      // {responseData.role==="Designer"?window.location.href = "http://localhost:5173":window.location.href = "/"}

    }
    else{
      alert(responseData.errors);
    }
  }


  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Sign Up"?<input value={formData.username} name="username" onChange={changeHandler} type="text"  placeholder='Your Name' />:null}
          <input value={formData.email} name="email" onChange={changeHandler} type="email" placeholder='Email Address' />
          <input value={formData.password} name="password" onChange={changeHandler} type="password" placeholder='Password' />
          {state==="Sign Up"?
          <select value={formData.role} name="role" onChange={changeHandler} id="">
            <option value="Designer">Designer</option>
            <option value="Buyer">Buyer</option>
          </select>:null}
        </div>
        <button onClick={() => state === "Login" ? login() : signup()}>Continue</button>
        <p className="loginsignup-login">
  {state === "Sign Up" 
    ? "Already have an account? "
    : "Don't have an account? "
  }
  <span onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}>
    {state === "Sign Up" ? "Login here" : "Sign Up"}
  </span>
</p>
        <div className="loginsignup-agree">
          <input type="checkbox" name='' id='' />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup

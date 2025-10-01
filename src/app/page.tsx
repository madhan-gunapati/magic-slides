'use client'

import { useState } from "react"
import {v4 as uuidV4} from 'uuid'
// import PptxGenJS from "pptxgenjs"

const Home = ()=>{
  const [input, setInput]  = useState('')
  const [chatVisibility , setChatVisibilty] = useState(false)
  const [chatList, setChatList] = useState([])

  
const changeInputText = (e)=>{
    setInput(e.target.value)

  }

const generatePPT =async (data)=>{
   
    

  
}

const fetchData = async(value)=>{
    const url = './api/slides'
    const options = {
      method:'POST', 
      headers:{
        'Content-Type':'Application/json',
       
        'Authorization':`Bearer 123456`
      },
      body:JSON.stringify({title:value})
    }
    const res = await fetch(url, options)
    const json_result = await res.json()
    console.log('json result '  , json_result)
    generatePPT(json_result)
  }

const addUserChat = (e)=>{
    setChatVisibilty(true)
    setChatList( (p)=>{
        const  temp_list = [...p]
        temp_list.push({source:'user' , msg:input})
        return temp_list })
    
      fetchData(input) 
      setInput('')
  }
  

  return <div className="flex flex-col justify-center align-middle h-screen text-center">
    {!chatVisibility &&
    <div >
    <h1 className="text-3xl font-extrabold">Hello , User!</h1>
    <p className="">What do you want me to generate Today?</p>
    </div>
}

    <div className={chatVisibility? '':'hidden'}>
      
     <ul className="p-5 flex flex-col align-top justify-start">
      
      {chatList.map((item)=><li key={uuidV4()} className={`${item.source==='user'? 'self-end':'self-start'} bg-black font-bold text-white w-fit p-2 rounded m-2`}>{item.msg}</li>)}
    </ul>
    </div>
<div className=" fixed bottom-0">
    <input type="text" className="bg-gray-100 p-3  h-1/12 rounded m-5 ml-10 font-semibold w-11/12"  placeholder="Start with a topic , we'll turn it into slides!" value={input} onChange={changeInputText} />
    <button type="button" onClick={addUserChat}>Send</button>
    </div>
  </div>

}

export default Home


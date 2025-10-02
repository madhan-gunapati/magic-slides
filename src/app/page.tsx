'use client'

import { useState, ChangeEvent } from "react"
import { v4 as uuidV4 } from 'uuid'
import SlidePreview from "./components/Slidepreview/page"

interface ChatItem {
  source: 'user' | 'bot'
  msg: string
}

const Home = () => {
  const [input, setInput] = useState<string>('')
  const [chatVisibility, setChatVisibility] = useState<boolean>(false)
  const [chatList, setChatList] = useState<ChatItem[]>([])
  
  const [slidesData, setSlidesData] = useState([])
  const [loading, setLoading] = useState<boolean>(false)
  const [initialFetch , setInitialFetch] = useState(true)

  const changeInputText = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const fetchData = async (value: string) => {
    setLoading(true)
    
    const url = '/api/slides'
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':'Application/json',
        'Authorization': `Bearer 123456`
      },
      body: JSON.stringify({ title: value })
    }
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error(res.statusText)
        const {data }= await res.json() 
      const {slides} = data 
      console.log(slides)
      setSlidesData(data.slides)
      console.log(data)
      
      // const blob = await res.blob()
      // const fileUrl = URL.createObjectURL(blob)
      // setPptUrl(fileUrl)
    } catch (err) {
      console.error("Failed to genrate ppt", err)
    } finally {
      setLoading(false)
    }
  }

const changeData = async(text:string)=>{
  setLoading(true)
  console.log('loading is true')
    const url = '/api/correction'
    const options = {
      method:'POST',
      headers:{
        'Content-Type':'Application/json',
        'Accept':'Application/json',
        'Authorization':'Bearer 123456'
      },
      body:JSON.stringify({edit_statement:text , slides:slidesData})
    }
    try{
    const res = await fetch(url, options)
    const readable_result = await res.json()
    
    const {data} = readable_result
    const {slides} = data
    setSlidesData(slides)
    }
    catch(e){
       console.error("Failed to correct Data:", e)
    } finally {
      setLoading(false)
    }
    }
    


  const addUserChat = () => {
    if (!input.trim()) return
    setChatVisibility(true)
    setChatList(prev => [...prev, { source: 'user', msg: input }])

    if(initialFetch){
       fetchData(input)
       setInitialFetch(false)
    }
    else{
      changeData(input)
    }
    
   
    setInput('')
  }

  return (
    <div className="">
     
        {/* Welcome screen */}
        {!chatVisibility && 
         <div className="flex flex-col justify-center items-center h-screen text-center p-5">
          <div className="space-y-3 w-full max-w-4xl">
            <h1 className="text-3xl font-extrabold">Hello, User!!</h1>
            <p>What do you want me to generate today?</p>
            <div className="flex justify-center mt-3 w-full">
              <input
                type="text"
                className="bg-gray-100 p-3 rounded w-4/5 font-semibold text-lg"
                placeholder="Start with a topic, we'll turn it into slides!"
                value={input}
                onChange={changeInputText}
              />
              <button
                className="ml-2 bg-black text-white px-4 rounded font-bold"
                onClick={addUserChat}
              >
                Send
              </button>
            </div>
          </div>
          </div>
        }
      
        {/* Chat screen */}
        {chatVisibility &&
          <div className="flex w-full h-full">
            <div className="flex flex-row justify-center p-5 w-full h-screen    relative">
              <ul className="p-5 flex flex-col w-4/5  space-y-2 overflow-y-auto max-h-[75vh] ">
                {chatList.map(item => (
                  <li
                    key={uuidV4()}
                    className={`${item.source === 'user' ? 'self-end bg-black text-white' : 'self-start bg-gray-200 text-black'} font-bold w-fit p-2 rounded`}
                  >
                    {item.msg}
                  </li>
                ))}

                {loading &&
                  <li className="self-start bg-gray-200 text-black font-bold w-fit p-2 rounded">
                    Loading...
                  </li>
                }
              </ul>
              <div className="absolute  bottom-0 w-full flex flex-row justify-center  p-5 ">
            <input
              type="text"
              className="bg-gray-100 p-3 rounded w-9/12 font-semibold text-lg"
              placeholder="Start with a topic, we'll turn it into slides!!  "
              value={input}
              onChange={changeInputText}
            />
          
            <button
              className="ml-1 bg-black text-white px-4 rounded font-extrabold"
              onClick={addUserChat}
            >
              Send
            </button>
          
            </div>
                </div>
                
              {slidesData.length !==0  && (
                <div className="w-full ">
                  <div className="absolute  w-[49%] flex flex-row justify-between p-2 bg-gray-300 z-10 ">
                  <h2 className=" top-0 font-bold text-center  p-1  rounded   ">Slide Preview</h2>
                  <button type="button" className=" top-0 font-bold text-center  p-1 z-10 bg-black text-white rounded shadow  ">Download</button>
                </div>
                <SlidePreview slides={slidesData} />
                  
                </div>
              )}
            
            </div>
        }
      
        
      
    </div>
  )
}

export default Home

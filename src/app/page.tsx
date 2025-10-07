'use client'

import { useState, ChangeEvent } from "react"
import { v4 as uuidV4 } from 'uuid'
import SlidePreview from "./components/SlidePreview"
import { title } from "process"
import Link from "next/link"

import { useRouter } from "next/navigation"
interface ChatItem {
  source: 'user' | 'bot'
  msg: string
  references?:string[]
}

const Home = () => {
  const [input, setInput] = useState<string>('')
  const [chatVisibility, setChatVisibility] = useState<boolean>(false)
  const [chatList, setChatList] = useState<ChatItem[]>([])
  const [slidesData, setSlidesData] = useState([])
  const [loading, setLoading] = useState<boolean>(false)
  const [initialFetch , setInitialFetch] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [conversation_id , setConversation_id] = useState('')
  const router = useRouter()

  const changeInputText = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const fetchData = async (value: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: value })
      })
      const { data , conversation_id } = await res.json()
      setSlidesData(data.slides)
      setConversation_id(conversation_id)
      setChatList((p)=>[...p, {source:'bot' ,msg:`(Tip:currently this AI may give irrelevant images, get your desired image url from google and ask this AI to put that in respec. slide). Fetched results about ${input} and showing preview.  Data Gathered From` , references:data.references}])
    } catch (err) {
      console.error("Failed to generate ppt", err)
    } finally {
      
      setLoading(false)
    }
  }

  const changeData = async (text: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/correction', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ edit_statement:text , slides:slidesData  , conversation_id})
      })
      const { data } = await res.json()
      setSlidesData(data.slides)
      
      setChatList((p)=>[...p, {source:'bot', msg:data.responseText}])
    } catch (e) {
      console.error("Failed to correct Data:", e)
    } finally {
      setLoading(false)
    }
  }

  const addUserChat = () => {
    if (!input.trim()) return
    setChatVisibility(true)
    setChatList(prev => [...prev, { source: 'user', msg: input }])
    if(initialFetch){ fetchData(input); setInitialFetch(false) }
    else{ changeData(input) }
    setInput('')
  }

  const downloadPpt = async () => {
    setDownloading(true)
  try {
    const url = "/api/pptxgen";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 123456",
      },
      body: JSON.stringify({ slides: slidesData }),
    };

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`Failed to download PPT: ${res.statusText}`);
    }

    // Get blob
    const blob = await res.blob();
    setDownloading(false)
    const fileUrl = URL.createObjectURL(blob);

    // Create a temporary link
    const link = document.createElement("a");
    link.href = fileUrl;
    
    link.download = `${title}.pptx`; // filename
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);

  } catch (error) {
    console.error("Error downloading PPT:", error);
  }
};


  return (
    <div className="min-h-screen flex flex-col bg-white">
     
      {/* Welcome screen */}
      {!chatVisibility && 
        <div className="flex flex-col justify-center items-center h-screen text-center p-5">
          <div className="space-y-5 w-full max-w-3xl  p-8">
            <h1 className="text-4xl font-extrabold"> Hello, User!</h1>
            <p className="text-gray-600">What do you want me to generate today?</p>
            <div className="flex justify-center mt-5 w-full">
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 p-3 rounded-lg w-4/5 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Start with a topic, we'll turn it into slides!"
                value={input}
                onChange={changeInputText}
              />
              <button
                className="ml-3 bg-black text-white px-6 rounded-lg font-bold hover:opacity-90 transition shadow"
                onClick={addUserChat}
              >
                Send
              </button>
              <button
                className="ml-3 bg-black text-white px-6 rounded-lg font-bold hover:opacity-90 transition shadow"
                onClick={()=>{router.push('./history')}}
              >
                History
              </button>
            </div>
          </div>
        </div>
      }
      
      {/* Chat screen */}
      {chatVisibility &&
        <div className="flex w-full h-screen">
          <div className="flex flex-row justify-center p-5 w-full h-full relative">
            
            {/* Chat box */}
            <ul className="p-5 flex flex-col w-4/5 space-y-3 overflow-y-auto max-h-[75vh] rounded-lg bg-gray-50 shadow-inner">
              {chatList.map(item => (
                <li
                  key={uuidV4()}
                  className={`${
                    item.source === 'user'
                      ? 'self-end bg-black text-white'
                      : 'self-start bg-gray-200 text-black'
                  } font-medium px-4 py-2 rounded-xl shadow transition transform hover:scale-105`}
                >
                  {item.msg}
                  {item.references && item.references.length > 0?(
                    item.references.map((i)=><a
                                     href={i}
                                     target="_blank"
    
                                    className="text-blue-600 underline hover:text-blue-800"
                                     key={i}
                                     >
                                      {i} <br/>
                                    </a> 
                                         ))
                   :""}
                </li>
              ))}
              {loading && (
                <li className="self-start bg-gray-200 text-black font-medium w-fit px-4 py-2 rounded-xl animate-pulse">
                  Loading...
                </li>
              )}
            </ul>
            
            {/* Input bar */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6">
              <div className="flex w-4/5 p-3 rounded-xl shadow-lg">
                <input
                  type="text"
                  className="bg-gray-100 p-3 rounded-lg w-10/12 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Start with a topic, we'll turn it into slides!!"
                  value={input}
                  onChange={changeInputText}
                />
                <button
                  className="ml-2 bg-black text-white px-6 rounded-lg font-bold hover:opacity-90 transition shadow"
                  onClick={addUserChat}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          {/* Slide preview */}
          {slidesData.length !== 0 && (
            <div className="w-full relative">
              <div className="absolute w-[100%] flex flex-row justify-between p-3 bg-gray-300 z-10 rounded-t-lg shadow-md">
                <h2 className="font-bold">📑 Slide Preview</h2>
                
                <button
                  type="button"
                  className="font-bold px-3 py-1 bg-black text-white rounded-lg shadow hover:opacity-90 transition"
                  onClick={downloadPpt}
                >
                  {downloading? 'Loading...': 'Download'}
                </button>
                 <Link href='/history'  className="font-bold px-3 py-1 bg-black text-white rounded-lg shadow hover:opacity-90 transition">History</Link>
            <Link href='/'  className="font-bold px-3 py-1 bg-black text-white rounded-lg shadow hover:opacity-90 transition">New Chat</Link>
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

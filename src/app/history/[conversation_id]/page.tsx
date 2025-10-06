"use client"

import { useEffect, useState ,  ChangeEvent} from "react"
import SlidePreview from "@/app/components/SlidePreview"
import { v4 as uuidV4 } from "uuid"
import { useParams } from "next/navigation"
import Link from "next/link"

interface ChatItem {
  sender: "user" | "bot"
  content: string
  references?: string[]
}

interface Slide {
    
   id:string
  title: string
  text: string
  image: string
  conversation_id:string
}
    
  
  

const Page = () => {
  const [input, setInput] = useState<string>('')
  const [chatList, setChatList] = useState<ChatItem[]>([])
  
    const [slidesData, setSlidesData] = useState<Slide[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [downloading, setDownloading] = useState(false)
  const {conversation_id} = useParams()
  
const changeInputText = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)
  
const addUserChat = () => {
    if (!input.trim()) return
    
    setChatList(prev => [...prev, { sender: 'user', content: input }])
    
    changeData(input) 
    setInput('')
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
      
      setChatList((p)=>[...p, {sender:'bot', content:data.responseText}])
    } catch (e) {
      console.error("Failed to correct Data:", e)
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const options = {
            method:'POST'
        }
        const res = await fetch(`http://localhost:3000/api/history/${conversation_id}` , options)
        const js_res = await res.json()
        setChatList(js_res.msgs || [])
        
        setSlidesData(js_res.slides || [])
      } catch (err) {
        console.error("Failed to fetch history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  },[conversation_id])

  const downloadPpt = async () => {
    setDownloading(true)
    try {
      const res = await fetch("/api/pptxgen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 123456",
        },
        body: JSON.stringify({ slides: slidesData }),
      })

      if (!res.ok) throw new Error(`Failed to download PPT: ${res.statusText}`)

      const blob = await res.blob()
      setDownloading(false)
      const fileUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = `history_slides.pptx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(fileUrl)
    } catch (error) {
      console.error("Error downloading PPT:", error)
      setDownloading(false)
    }
  }

  return (
    <div className="flex w-full h-screen bg-white">
      <div className="flex flex-row justify-center p-5 w-full h-full relative">
        {/* Chat box */}
        <ul className="p-5 flex flex-col w-4/5 space-y-3 overflow-y-auto max-h-[75vh] rounded-lg bg-gray-50 shadow-inner">
          {chatList.map((item) => (
            <li
              key={uuidV4()}
              className={`${
                item.sender === "user"
                  ? "self-end bg-black text-white"
                  : "self-start bg-gray-200 text-black"
              } font-medium px-4 py-2 rounded-xl shadow transition transform hover:scale-105`}
            >
              {item.content}
              {item.references
                ? item.references.map((i) => (
                    <a
                      href={i}
                      target="_blank"
                      className="text-blue-600 underline hover:text-blue-800"
                      key={i}
                    >
                      {i} <br />
                    </a>
                  ))
                : ""}
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
                
              {downloading ? "Loading..." : "Download"}
            </button>
             <Link href='/history'  className="font-bold px-3 py-1 bg-black text-white rounded-lg shadow hover:opacity-90 transition">History</Link>
            <Link href='/'  className="font-bold px-3 py-1 bg-black text-white rounded-lg shadow hover:opacity-90 transition">New Chat</Link>
          </div>
          <SlidePreview slides={slidesData} />
        </div>
      )}
    </div>
  )
}

export default Page

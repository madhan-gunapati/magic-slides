'use client'

import { useState, ChangeEvent } from "react"
import { v4 as uuidV4 } from 'uuid'

interface ChatItem {
  source: 'user' | 'bot'
  msg: string
}

const Home = () => {
  const [input, setInput] = useState<string>('')
  const [chatVisibility, setChatVisibility] = useState<boolean>(false)
  const [chatList, setChatList] = useState<ChatItem[]>([])
  const [pptUrl, setPptUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const changeInputText = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const fetchData = async (value: string) => {
    setLoading(true)
    const url = '/api/slides'
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 123456`
      },
      body: JSON.stringify({ title: value })
    }
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error(res.statusText)

      const blob = await res.blob()
      const fileUrl = URL.createObjectURL(blob)
      setPptUrl(fileUrl)
    } catch (err) {
      console.error("Failed to fetch PPT:", err)
    } finally {
      setLoading(false)
    }
  }

  const addUserChat = () => {
    if (!input.trim()) return
    setChatVisibility(true)
    setChatList(prev => [...prev, { source: 'user', msg: input }])
    setFileName(input)
    fetchData(input)
    setInput('')
  }

  return (
    <div>
      <div className="flex flex-col justify-center items-center h-screen text-center p-5">
        {/* Welcome screen */}
        {!chatVisibility && 
          <div className="space-y-3 w-full max-w-4xl">
            <h1 className="text-3xl font-extrabold">Hello, User!</h1>
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
        }

        {/* Chat screen */}
        {chatVisibility &&
          <div className="flex flex-col w-full max-w-3xl h-full relative">
            <ul className="p-5 flex flex-col space-y-2 overflow-y-auto max-h-[75vh]">
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

            {pptUrl && (
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-2">PPT Preview:</h2>
                <iframe
                  src={pptUrl}
                  width="100%"
                  height="600"
                  className="border"
                  title="PPT Preview"
                ></iframe>
                <a
                  href={pptUrl}
                  download={`${fileName}.pptx`}
                  className="mt-3 inline-block text-blue-500 underline"
                >
                  Download PPT
                </a>
              </div>
            )}
          </div>
        }
      </div>

      {/* Input bar at bottom */}
      {chatVisibility &&
        <div className="fixed bottom-0 w-full flex flex-row justify-center p-5 bg-white">
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
      }
    </div>
  )
}

export default Home

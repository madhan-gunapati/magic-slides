'use client'
import { useSession } from "next-auth/react"

import { useEffect, useState } from "react"

interface Conversation {
  id: string
  title: string
  createdAt: string
  references: string[]
}
type SessionUser = {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string | null
  }
  
const History = () => {
  const [convList, setConvList] = useState<Conversation[]>([])
  const {data }= useSession()
  const sessionData = data as { user?: SessionUser }
  const userId = sessionData?.user?.id
  

  useEffect(() => {
    const url='/api/history/conversations'
    const options = {
        method:'POST',
        headers:{
            'content-Type':'Application/json',
            'Accept':'Application/json',
            
        },
        body:JSON.stringify({userId})
    }
    const fetchData = async () => {
      const res = await fetch(url, options)
      const jsRes = await res.json()
      setConvList(jsRes.msg)
    }
    fetchData()
  }, [userId])

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="w-full max-w-md border border-black rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">Conversation History</h1>
        <ul className="space-y-2">
          {convList.map((item) => (
            <a key={item.id} href={`./history/${item.id}`}>
              <li
                className="border border-black/30 rounded-lg px-4 py-2 hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {item.title} ^
              </li>
            </a>
          ))}
        </ul>
        {convList.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No conversations found.</p>
        )}
      </div>
    </div>
  )
}

export default History

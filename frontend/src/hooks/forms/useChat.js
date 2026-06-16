import { useState } from 'react'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = (text) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender: 'me', timestamp: new Date() }])
    setInput('')
  }

  return { messages, input, setInput, sendMessage }
}

export default useChat

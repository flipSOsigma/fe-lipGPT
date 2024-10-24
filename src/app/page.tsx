'use client';
import { useState } from "react";

export default function Home() {
  interface ArrayText {
    msg: string;
    time: string;
    sender: 'user' | 'lifGPT'; // to distinguish between user and GPT
  }

  // State to store messages
  const [myText, setMyText] = useState<ArrayText[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('')

  const formatWhatsAppText = (text: string) => {
    const lines = text.split('\n').map(line => {
      if (line.startsWith('* ')) {
        return `<li style="list-style-type: disc; margin: 0;">${line.substring(2).trim()}</li>`; // Convert to list item
      }
      return line;
    });

    // Join lines back into a single string for further formatting
    text = lines.join('<br />');
    text = text.replace(/\*(.*?)\*/g, (match, p1) => `<strong>${p1}</strong><br>`);
    text = text.replace(/_(.*?)_/g, (match, p1) => `<em>${p1}</em>`);
    text = text.replace(/~(.*?)~/g, (match, p1) => `<del>${p1}</del>`);
    text = text.replace(/```(.*?)```/g, (match, p1) => `<code>${p1}</code>`);
    return text;
    
  };

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('text')?.toString() ?? '';

    if (!text) return;

    const date = new Date();
    const hour = date.getHours().toString().padStart(2, '0'); // Add leading zero
    const minute = date.getMinutes().toString().padStart(2, '0');
    const time = `${hour}:${minute}`;

    // Add user message to chat
    setMyText((prevMessages) => [
      ...prevMessages,
      { msg: formatWhatsAppText(text), time, sender: 'user' } // Format text before adding
    ]);
    setLoading(true);
    setError(null);
    // setTimeout(() => {
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // }, 100);

    // console.log(route);
    
    const route = process.env.NEXT_PUBLIC_AI_API_ROUTE
    try {
      const lifGPTResponse = await fetch(route + 'ai', {
      // const lifGPTResponse = await fetch('http://localhost:2000/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });

      if (!lifGPTResponse.ok) {
        throw new Error('Failed to fetch response');
      }

      const lifGPTResponseJson = await lifGPTResponse.json();

      // Add GPT message to chat
      setMyText((prevMessages) => [
        ...prevMessages,
        { msg: formatWhatsAppText(lifGPTResponseJson.response), time, sender: 'lifGPT' } // Format GPT response
      ]);
    } catch (error) {
      console.log("Failed to fetch GPT response:", error);
      setError('Error fetching GPT response');
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className="w-full flex justify-center text-black items-center min-h-screen bg-white">
      <div className="w-full container h-full flex flex-col justify-end py-20">
        
        {/* Chat Bubbles */}
        <div className="flex flex-col w-full min-h-screen items-end justify-end pb-24 gap-4" id="column">
          {myText.map((message, index) => (
            <div key={index} className="w-full flex flex-col gap-2">
              {message.sender === 'user' ? (
                // User message (left side)
                <div className="w-full flex justify-start">
                  <div className="neo max-w-sm md:max-w-lg xl:max-w-2xl flex flex-col gap-2 rounded-md rounded-tl-none bg-yellow-300">
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.msg }} />
                    <i className="text-xs text-end text-gray-500">{message.time}</i>
                  </div>
                </div>
              ) : (
                // lifGPT message (right side)
                <div className="w-full flex justify-end">
                  <div className="neo max-w-sm md:max-w-lg xl:max-w-2xl flex flex-col gap-2 rounded-md rounded-tr-none bg-blue-300">
                    <h1 className="text-md font-bold">lifGPT</h1>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.msg }} />
                    <i className="text-xs text-end text-gray-500">{message.time}</i>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Show a loading message while waiting for GPT response */}
          {loading && (
            <div className="w-full flex justify-end">
              <div className="neo max-w-sm flex flex-col gap-2 rounded-md rounded-tr-none bg-gray-300">
                <p className="text-sm italic">lifGPT is typing...</p>
              </div>
            </div>
          )}

          {/* Show error message if there's an issue */}
          {error && (
            <div className="w-full flex justify-center">
              <div className="neo max-w-sm flex flex-col gap-2 rounded-md rounded-tr-none bg-red-300">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full container flex flex-col items-center justify-between py-20 fixed bottom-0">
        <form onSubmit={handleForm} className="w-full flex gap-2 " method="post">
          <input
            type="text"
            name="text"
            autoComplete="off"
            className="w-full rounded-md border neo text-black outline-none"
            placeholder="Ask me anything"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="neo-default bg-yellow-300 rounded-md active:neo">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

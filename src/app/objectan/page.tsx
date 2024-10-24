'use client'
import { useState } from 'react';

export default function Test() {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZoneContent, setDropZoneContent] = useState<string>('');

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    setDropZoneContent(data);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This allows the drop event to occur
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-6">Draggable Element in Next.js</h1>

      {/* Draggable div */}
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, 'This is the draggable div')}
        className="w-52 h-24 bg-green-500 text-white flex items-center justify-center mb-4 cursor-grab"
      >
        Drag me
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-72 h-36 border-2 border-dashed border-gray-700 flex items-center justify-center"
      >
        {dropZoneContent || 'Drop here'}
      </div>
    </div>
  );
}

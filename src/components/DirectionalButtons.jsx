export default function DirectionalButtons({ onDirectionClick, selectedNodeId }) {
  if (!selectedNodeId) return null;

  return (
    <div className="absolute top-20 left-4 z-10 flex flex-col gap-2 bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg shadow-2xl border border-gray-700">
      <div className="text-xs text-gray-400 mb-2 text-center font-medium">Add Node</div>
      <button
        onClick={() => onDirectionClick('up')}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg transition-all hover:scale-110 active:scale-95"
        title="Add node above"
      >
        ↑ Up
      </button>
      <div className="flex gap-2">
        <button
          onClick={() => onDirectionClick('left')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg transition-all hover:scale-110 active:scale-95"
          title="Add node to the left"
        >
          ← Left
        </button>
        <button
          onClick={() => onDirectionClick('right')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg transition-all hover:scale-110 active:scale-95"
          title="Add node to the right"
        >
          Right →
        </button>
      </div>
      <button
        onClick={() => onDirectionClick('down')}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-lg transition-all hover:scale-110 active:scale-95"
        title="Add node below"
      >
        ↓ Down
      </button>
    </div>
  );
}


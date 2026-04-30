import { useNavigate } from 'react-router-dom';

export default function FloatingChatButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/chatbot')}
      className="fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition transform hover:scale-110"
      title="Ask NutriLens AI"
    >
      💬
    </button>
  );
}

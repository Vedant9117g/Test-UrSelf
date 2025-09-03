import { useState } from "react";
import axios from "axios";

const MultiQUpload = () => {
  const [questionsImg, setQuestionsImg] = useState(null);
  const [answersImg, setAnswersImg] = useState(null);
  const [results, setResults] = useState([]);

  const handleSubmit = async () => {
    if (!questionsImg || !answersImg) {
      alert("Upload both images");
      return;
    }

    const formData = new FormData();
    formData.append("questions", questionsImg);
    formData.append("answerKey", answersImg); // ✅ keep consistent

    try {
      const res = await axios.post(
        "http://localhost:5000/api/multiq/parse-multiq",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResults(res.data.data || []);
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Failed to parse questions.");
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl mb-4 font-bold">Multi-Question Parser</h1>
      <div className="space-y-4">
        <input
          type="file"
          onChange={(e) => setQuestionsImg(e.target.files[0])}
        />
        <input type="file" onChange={(e) => setAnswersImg(e.target.files[0])} />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Parse
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {results.map((q, i) => (
          <div key={i} className="p-4 bg-gray-800 rounded">
            <p className="font-semibold">
              Q{q.questionNumber}: {q.questionText}
            </p>
            <ul className="list-disc ml-5">
              {q.options.map((o, idx) => (
                <li
                  key={idx}
                  className={
                    q.correctOption && o.startsWith(q.correctOption)
                      ? "text-green-400 font-bold"
                      : ""
                  }
                >
                  {o}
                </li>
              ))}
            </ul>
            {q.correctOption && (
              <p className="text-green-300 mt-2">Answer: {q.correctOption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiQUpload;

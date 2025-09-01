// MentorUploadImage.jsx
import { useState } from "react";
import axios from "axios";

const MentorUploadImage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [parsedQuestion, setParsedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!imageFile) return alert("Select a screenshot first");

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/images/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      setParsedQuestion(res.data.parsedQuestion);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to parse screenshot. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to highlight correct option
  const renderOptions = () => {
    if (!parsedQuestion?.options) return null;
    return parsedQuestion.options.map((o, idx) => {
      const isCorrect = !!o.isCorrect || (parsedQuestion.answerKey && String(parsedQuestion.answerKey).trim() === String(o.text).trim());
      return (
        <li key={idx} className={`p-2 rounded ${isCorrect ? 'bg-green-900 text-green-200 font-semibold' : 'bg-gray-800 text-gray-300'}`}>
          {o.text}
        </li>
      );
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Upload Question Screenshot</h1>

      <div className="flex items-center gap-3 mb-4">
        <input type="file" accept="image/*" onChange={handleFileChange} className="flex-1 text-gray-200" />
        <button onClick={handleUpload} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
          {loading ? "Processing..." : "Upload"}
        </button>
      </div>

      {parsedQuestion && (
        <div className="mt-6 p-6 border rounded-xl bg-gray-800 shadow-lg">
          <p className="mb-3 text-lg"><strong className="text-blue-300">Question:</strong> {parsedQuestion.questionText}</p>

          <div className="mb-4">
            <strong className="text-blue-300">Options:</strong>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              {renderOptions()}
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div><strong className="text-blue-300">Difficulty:</strong> {parsedQuestion.difficulty}</div>
            <div><strong className="text-blue-300">Tags:</strong> {parsedQuestion.tags?.join(", ")}</div>
            <div><strong className="text-blue-300">Year:</strong> {parsedQuestion.year}</div>
            <div><strong className="text-blue-300">Source:</strong> {parsedQuestion.source}</div>
          </div>

          {/* Formulas */}
          {parsedQuestion.formulas?.length > 0 && (
            <div className="mb-4">
              <strong className="text-purple-400">Formulas:</strong>
              <ul className="pl-4 list-disc mt-2">
                {parsedQuestion.formulas.map((f, i) => (
                  <li key={i} className="text-yellow-300 font-mono">
                    <div><em>{f.description}</em></div>
                    <div>{f.expression}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Computed numeric result (from backend) */}
          {parsedQuestion.computed && (
            <div className="mb-4 p-3 bg-gray-900 rounded">
              <strong className="text-green-300">Computed:</strong>
              <div className="mt-1 text-sm text-gray-100">{parsedQuestion.computed.computedAnswerDescription}</div>
              <div className="mt-1 text-lg text-green-200 font-semibold">{parsedQuestion.computed.computedAnswerSeconds} seconds</div>
            </div>
          )}

          <hr className="my-4 border-gray-700" />

          {/* Solution steps */}
          {parsedQuestion.solution?.steps?.length > 0 && (
            <div className="mb-4">
              <strong className="text-blue-300 text-lg">Solution (Step-by-step):</strong>
              <ol className="list-decimal pl-6 mt-3 space-y-2 text-gray-200">
                {parsedQuestion.solution.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          )}

          {/* Explanation */}
          {parsedQuestion.solution?.explanation && (
            <div className="mb-3 text-gray-300">
              <strong className="text-blue-300">Explanation:</strong>
              <div className="mt-2">{parsedQuestion.solution.explanation}</div>
            </div>
          )}

          {/* Hint */}
          {parsedQuestion.hint && (
            <div className="mt-3 text-yellow-300"><strong>Hint:</strong> {parsedQuestion.hint}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorUploadImage;

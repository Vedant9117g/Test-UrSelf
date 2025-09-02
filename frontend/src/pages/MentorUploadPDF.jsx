import { useState } from "react";
import axios from "axios";

const MentorUploadPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const handleFileChange = (e) => setPdfFile(e.target.files[0]);

  // Step 1: Upload PDF and auto-fetch first batch
  const handleUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/pdfs/upload-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      alert(`PDF uploaded ✅ Total Questions: ${res.data.totalQuestions}`);

      // Reset states
      setBatch(1);
      setParsedQuestions([]);
      setHasMore(true);

      // 🔥 Auto-fetch first batch immediately
      const batchRes = await axios.get(
        `http://localhost:5000/api/pdfs/parse-batch?limit=20&batch=1`,
        { withCredentials: true }
      );

      setParsedQuestions(batchRes.data.parsedQuestions);
      setHasMore(batchRes.data.hasMore);
      setBatch(2);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload PDF. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch next batch
  const handleFetchBatch = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/pdfs/parse-batch?limit=20&batch=${batch}`,
        { withCredentials: true }
      );

      setParsedQuestions((prev) => [...prev, ...res.data.parsedQuestions]);
      setHasMore(res.data.hasMore);
      setBatch((prev) => prev + 1);
    } catch (err) {
      console.error("Batch fetch error:", err);
      alert("Failed to fetch parsed questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Upload PDF Questions</h1>

      <div className="flex items-center mb-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          className="ml-3 bg-blue-600 px-4 py-2 rounded shadow hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {parsedQuestions.length > 0 && (
        <div className="space-y-6">
          {parsedQuestions.map((q, idx) => (
            <div
              key={idx}
              className="border border-gray-700 p-5 rounded-lg bg-gray-800 shadow-lg"
            >
              <p className="mb-2 text-lg font-semibold">
                Q{idx + 1 + (batch - 2) * 20}: {q.questionText}
              </p>

              <ul className="list-disc ml-6 mb-3">
                {q.options?.map((o, i) => (
                  <li
                    key={i}
                    className={o.isCorrect ? "text-green-400 font-semibold" : ""}
                  >
                    {o.text}
                  </li>
                ))}
              </ul>

              <p className="mb-2">
                <strong>Difficulty:</strong> {q.difficulty}
              </p>
              <p className="mb-2">
                <strong>Tags:</strong> {q.tags?.join(", ")}
              </p>
              <p className="mb-2">
                <strong>Year:</strong> {q.year}
              </p>
              <p className="mb-2">
                <strong>Source:</strong> {q.source}
              </p>

              {/* ✅ Answer Key */}
              <p className="mb-2 text-green-400 font-bold">
                Answer: {q.answerKey}
              </p>

              {/* ✅ Structured Solution */}
              <div className="mb-3">
                <p className="font-semibold mb-1">Solution:</p>
                <div className="bg-gray-700 p-3 rounded whitespace-pre-line leading-relaxed">
                  {q.solution}
                </div>
              </div>

              {/* ✅ Hint */}
              <p className="text-yellow-400">
                <strong>Hint:</strong> {q.hint}
              </p>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={handleFetchBatch}
              disabled={loading}
              className="w-full bg-purple-600 px-4 py-2 rounded shadow hover:bg-purple-700"
            >
              {loading ? "Loading..." : "Load More Questions"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorUploadPDF;

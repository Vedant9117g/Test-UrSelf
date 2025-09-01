import { useState } from "react";
import axios from "axios";

const MentorUploadPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

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

      alert("PDF parsed successfully ✅");
      setParsedQuestions(res.data.parsedQuestions || []);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload PDF. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndSave = async () => {
    if (!parsedQuestions.length) return alert("No questions to save");

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/pdfs/save-approved",
        { questions: parsedQuestions },
        { withCredentials: true }
      );

      alert("Questions saved successfully 🎉");
      setParsedQuestions([]);
      setPdfFile(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-700 h-[90vh] text-white">
      <h1 className="text-2xl font-bold mb-4">Upload PDF Questions</h1>

      <input type="file" accept="application/pdf" onChange={handleFileChange} name="pdf" />
      <button
        onClick={handleUpload}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {parsedQuestions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Parsed Questions Preview</h2>
          <ul className="space-y-4">
            {parsedQuestions.map((q, idx) => (
              <li key={idx} className="border p-3 rounded bg-gray-800">
                <p><strong>Question:</strong> {q.questionText}</p>
                <p><strong>Options:</strong> {q.options?.map((o) => o.text).join(", ")}</p>
                <p><strong>Difficulty:</strong> {q.difficulty}</p>
                <p><strong>Tags:</strong> {q.tags?.join(", ")}</p>
                <p><strong>Year:</strong> {q.year}</p>
                <p><strong>Source:</strong> {q.source}</p>
              </li>
            ))}
          </ul>

          <button
            onClick={handleApproveAndSave}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Approve & Save to DB"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MentorUploadPDF;

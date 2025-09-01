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
      const res = await axios.post(
        "http://localhost:5000/api/images/upload-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setParsedQuestion(res.data.parsedQuestion);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to parse screenshot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-800 text-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Upload Question Screenshot</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Upload"}
      </button>

      {parsedQuestion && (
        <div className="mt-6 p-4 border rounded bg-gray-900">
          <p className="mb-2"><strong>Question:</strong> {parsedQuestion.questionText}</p>
          <p className="mb-2"><strong>Options:</strong> {parsedQuestion.options?.map(o => o.text).join(", ")}</p>
          <p className="mb-2"><strong>Difficulty:</strong> {parsedQuestion.difficulty}</p>
          <p className="mb-2"><strong>Tags:</strong> {parsedQuestion.tags?.join(", ")}</p>
          <p className="mb-2"><strong>Year:</strong> {parsedQuestion.year}</p>
          <p className="mb-2"><strong>Source:</strong> {parsedQuestion.source}</p>

          {/* ✅ New Fields */}
          <hr className="my-3 border-gray-600" />
          <p className="mb-2 text-green-400"><strong>Answer Key:</strong> {parsedQuestion.answerKey}</p>
          <p className="mb-2"><strong>Solution:</strong> {parsedQuestion.solution}</p>
          <p className="mb-2 text-yellow-400"><strong>Hint:</strong> {parsedQuestion.hint}</p>
        </div>
      )}
    </div>
  );
};

export default MentorUploadImage;

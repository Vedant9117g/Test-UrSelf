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
        headers: { "Content-Type": "multipart/form-data" }
      });
      setParsedQuestion(res.data.parsedQuestion);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to parse screenshot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Upload Question Screenshot</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
        {loading ? "Processing..." : "Upload"}
      </button>

      {parsedQuestion && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <p><strong>Question:</strong> {parsedQuestion.questionText}</p>
          <p><strong>Options:</strong> {parsedQuestion.options?.map(o => o.text).join(", ")}</p>
          <p><strong>Difficulty:</strong> {parsedQuestion.difficulty}</p>
          <p><strong>Tags:</strong> {parsedQuestion.tags?.join(", ")}</p>
          <p><strong>Year:</strong> {parsedQuestion.year}</p>
          <p><strong>Source:</strong> {parsedQuestion.source}</p>
        </div>
      )}
    </div>
  );
};

export default MentorUploadImage;

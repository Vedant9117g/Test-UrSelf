const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // works for images, PDFs, videos
    });
    return uploadResponse;
  } catch (error) {
    console.log(error);
  }
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};

const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  uploadMedia,
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
}; , const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { uploadPDF } = require("../controllers/pdfController");
const Question = require("../models/Question");
const { protect, mentorOnly } = require("../middleware/isAuthenticated");

// Step 1: Upload and parse PDF
router.post("/upload-pdf", protect, mentorOnly, upload.single("pdf"), uploadPDF);

// Step 2: Save approved questions
router.post("/save-approved", protect, mentorOnly, async (req, res) => {
  const { questions } = req.body;
  try {
    const result = await Question.insertMany(questions);
    res.json({ inserted: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save questions" });
  }
});

module.exports = router;  , const multer = require("multer");

const upload = multer({ dest: "uploads/" });
module.exports = upload; , , // utils/genai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genai = new GoogleGenerativeAI({
  apiKey: process.env.GENAI_API_KEY,
});

/**
 * Extracts structured question JSON from raw question text using Gemini
 * @param {string} rawQuestion - The text of the question
 * @returns {object} - Parsed question in JSON format
 */
const extractQuestionJSON = async (rawQuestion) => {
  // Prompt for the model
  const prompt = `
Extract question details in JSON format:
- questionText: the question text
- options: array of { text, isCorrect } objects
- difficulty: easy / medium / hard
- tags: relevant topics/keywords
- year: PYQ year
- source: Mock or PYQ
Please respond ONLY in valid JSON.
Question:
${rawQuestion}
`;

  try {
    const response = await genai.chat.completions.create({
      model: "chat-bison-001", // older model, works with free tier
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    // Parse and return JSON
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("Error parsing question with Gemini:", err);
    throw err;
  }
};

module.exports = { extractQuestionJSON };  , const fs = require("fs");
const { uploadMedia } = require("../utils/cloudinary");
const pdfParse = require("pdf-parse");
const { extractQuestionJSON } = require("../utils/genai");

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // 1️⃣ Upload PDF to Cloudinary
    const cloudinaryResponse = await uploadMedia(req.file.path);
    const pdfUrl = cloudinaryResponse.secure_url;

    // 2️⃣ Read file from disk into buffer
    const pdfBuffer = fs.readFileSync(req.file.path);

    // 3️⃣ Parse PDF text
    const pdfText = (await pdfParse(pdfBuffer)).text;

    // 4️⃣ Split into raw questions
    const rawQuestions = pdfText.split(/\n\n/);
    const parsedQuestions = [];

    for (let q of rawQuestions) {
      if (!q.trim()) continue;
      try {
        const parsed = await extractQuestionJSON(q);
        parsedQuestions.push(parsed);
      } catch (err) {
        console.error("❌ Failed to parse question:", q, err.message);
      }
    }

    // 5️⃣ Return questions for frontend preview
    res.json({ pdfUrl, parsedQuestions });
  } catch (err) {
    console.error("❌ PDF Upload Error:", err);
    res.status(500).json({ error: "Failed to upload PDF", details: err.message });
  }
};
 , import { useState } from "react";
import axios from "axios";

const MentorUploadPDF = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle PDF file selection
  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  // Upload PDF to backend and get parsed questions
  const handleUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF file");

    const formData = new FormData();
    formData.append("pdf", pdfFile); // must match multer .single("pdf")

    try {
      setLoading(true);

      // Use full backend URL if frontend dev server differs
      const res = await axios.post(
        "http://localhost:5000/api/pdfs/upload-pdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // needed for cookie auth
        }
      );

      alert(`PDF uploaded successfully: ${res.data.pdfUrl}`);
      setParsedQuestions(res.data.parsedQuestions || []);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload PDF. Make sure backend is running and route is correct.");
    } finally {
      setLoading(false);
    }
  };

  // Approve and save parsed questions to DB
  const handleApproveAndSave = async () => {
    if (!parsedQuestions.length) return alert("No questions to save");

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/pdfs/save-approved",
        { questions: parsedQuestions },
        { withCredentials: true }
      );

      alert("Questions saved successfully!");
      setParsedQuestions([]);
      setPdfFile(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save questions. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-700 h-[90vh]">
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
              <li key={idx} className="border p-3 rounded">
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

export default MentorUploadPDF; , 

getting response like , 
(A)
In a pipelined execution, forwarding means the result from a source stage of an
earlier instruction is passed on to the destination stage of a later instruction
(B)
In forwarding, data from the output of the MEM stage can be passed on to the
input of the EX stage of the next instruction
(C) Forwarding cannot prevent all pipeline stalls
(D)
Forwarding does not require any extra hardware to retrieve the data from the
pipeline stages
   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 20 of 36
Organizing Institute: IISc Bengaluru
Q.31 Which of the following fields is/are modified in the IP header of a packet going out
of  a  network  address  translation  (NAT)  device  from  an  internal  network  to  an
external network?

(A) Source IP
(B) Destination IP
(C) Header Checksum
(D) Total Length

Q.32
Let 퐴 and 퐵 be non-empty finite sets such that there exist one-to-one and onto
functions (i) from 퐴 to 퐵 and (ii) from 퐴×퐴 to 퐴∪퐵. The number of possible
values of
|
퐴
|
 is __________

Q.33 Consider the operator precedence and associativity rules for the integer arithmetic
operators given in the table below.
Operator Precedence Associativity
+
Highest Left
− High Right
∗
Medium Right
/
Low Right
The value of the expression  3+1+5∗2 / 7+2−4−7−6 / 2  as per the
above rules is __________


   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 21 of 36
Organizing Institute: IISc Bengaluru
Q.34 The number of spanning trees in a complete graph of 4 vertices labelled  A, B, C,
and D is _________

Q.35 Consider the following two relations, R(A,B) and S(A,C):


푹

푺
푨 푩

푨 푪
10 20  10 90
20 30  30 45
30 40  40 80
30 50
50 95


The total number of tuples obtained by evaluating the following expression
흈
푩<푪
(
푹⋈
푹.푨=푺.푨
푺
)

is _________










   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 22 of 36
Organizing Institute: IISc Bengaluru
Q.36 – Q.65 Carry TWO marks Each

Q.36
Consider a network path P—Q—R between nodes P and R via router Q. Node P
sends a file of size 10
6
 bytes to R via this path by splitting the file into chunks of
10
3
 bytes each. Node P sends these chunks one after the other without any wait time
between the successive chunk transmissions. Assume that the size of extra headers
added to these chunks is negligible, and that the chunk size is less than the MTU.

Each of the links P—Q and Q—R has a bandwidth of 10
6
bits/sec, and negligible
propagation latency. Router Q immediately transmits every packet it receives from
P   to   R,   with   negligible   processing   and   queueing   delays.   Router   Q   can
simultaneously receive on link P—Q and transmit on link Q—R.

Assume P starts transmitting the chunks at time 푡=0.
Which  one  of  the  following options  gives  the  time  (in  seconds, rounded  off  to  3
decimal places) at which R receives all the chunks of the file?

(A) 8.000
(B) 8.008
(C) 15.992
(D) 16.000





   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 23 of 36
Organizing Institute: IISc Bengaluru
Q.37 Consider the following syntax-directed definition (SDD).


푆→퐷퐻푇푈 { 푆.푣푎푙 = 퐷.푣푎푙 + 퐻.푣푎푙 + 푇.푣푎푙 + 푈.푣푎푙; }
퐷→"M"퐷
1
 { 퐷.푣푎푙 = 5 + 퐷
1
.푣푎푙; }
퐷→휖 { 퐷.푣푎푙 = −5; }
퐻→"L"퐻
1
 { 퐻.푣푎푙 = 5∗10 + 퐻
1
.푣푎푙; }
퐻→휖 { 퐻.푣푎푙 = −10; }
푇→"C"푇
1
 { 푇.푣푎푙 = 5∗100 + 푇
1
.푣푎푙; }
푇→휖 { 푇.푣푎푙 = −5; }
푈→"K" { 푈.푣푎푙 = 5; }


Given "MMLK" as the input, which one of the following options is the CORRECT
value computed by the SDD (in the attribute 푆.푣푎푙)?
(A) 45
(B) 50
(C) 55
(D) 65




   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 24 of 36
Organizing Institute: IISc Bengaluru
Q.38
Consider the following grammar 퐺, with 푆 as the start symbol. The grammar 퐺 has
three incomplete productions denoted by (1), (2), and (3).
푆→푑푎푇 |
(
1
)

푇→푎푆
|
 푏푇
|

(
2
)

푅→
(
3
)
    | 휖
The set of terminals is {푎,푏,푐,푑,푓}. The FIRST and FOLLOW sets of the different
non-terminals are as follows.
FIRST(푆) = {푐,푑,푓},  FIRST(푇) = {푎,푏,휖},  FIRST(푅) = {푐,휖}
FOLLOW(푆) = FOLLOW(푇) = {푐,푓,$},  FOLLOW(푅) = {푓}
Which  one  of  the  following options CORRECTLY  fills  in  the incomplete
productions?

(A)
 (1) 푆→푅푓    (2) 푇→휖      (3) 푅→푐푇푅
(B)  (1) 푆→푓푅    (2) 푇→휖      (3) 푅→푐푇푅
(C)
 (1) 푆→푓푅    (2) 푇→푐푇    (3) 푅→푐푅
(D)
 (1) 푆→푅푓    (2) 푇→푐푇    (3) 푅→푐푅





   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 25 of 36
Organizing Institute: IISc Bengaluru
Q.39 Consider the following pseudo-code.
퐿1:               푡1= −1
퐿2:               푡2 = 0
퐿3:               푡3 = 0
퐿4:               푡4 = 4∗푡3

퐿5:               푡5 = 4∗푡2
퐿6:               푡6 = 푡5∗푀
퐿7:               푡7 = 푡4+푡6
퐿8:               푡8 = 푎[푡7]
퐿9:               if  푡8 <= 푚푎푥 goto  퐿11
퐿10:             푡1 = 푡8

퐿11:             푡3 = 푡3+1
퐿12:             if  푡3 < 푀 goto  퐿4
퐿13:             푡2 = 푡2+1
퐿14:             if  푡2 < 푁 goto  퐿3
퐿15:             푚푎푥 = 푡1
Which one of the following options CORRECTLY specifies the number  of basic
blocks and the number of instructions in the largest basic block, respectively ?

(A) 6 and 6
(B) 6 and 7
(C) 7 and 7
(D) 7 and 6


   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 26 of 36
Organizing Institute: IISc Bengaluru
Q.40 Consider  the  following  two  threads  T1  and  T2  that  update  two  shared  variables
a and b. Assume that initially a = b = 1. Though context switching between
threads can happen at any time, each statement of T1 or T2 is executed atomically
without interruption.

T1                                                          T2
a = a + 1;                 b = 2 * b;
b = b + 1;                 a = 2 * a;
Which one of the following options lists all the possible combinations of values of
a and b after both T1 and T2 finish execution?

(A)
 (a = 4, b = 4); (a = 3, b = 3); (a = 4, b = 3)
(B)
 (a = 3, b = 4); (a = 4, b = 3); (a = 3, b = 3)
(C)
 (a = 4, b = 4); (a = 4, b = 3); (a = 3, b = 4)
(D)
 (a = 2, b = 2); (a = 2, b = 3); (a = 3, b = 4)

Q.41 An array [82, 101, 90, 11, 111, 75, 33, 131, 44, 93] is heapified. Which one of the
following options represents the first three elements in the heapified array?

(A)  82, 90, 101
(B)  82, 11, 93
(C)  131, 11, 93
(D)  131, 111, 90  Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 27 of 36
Organizing Institute: IISc Bengaluru
Q.42 Consider the following recurrence relation:
푇
(
푛
)
={
√
푛푇(
√
푛)+푛    for  푛≥1,
             1        for  푛=1.

Which one of the following options is CORRECT?

(A)  푇
(
푛
)
= Θ(푛 loglog푛)
(B)
 푇
(
푛
)
=Θ(푛 log푛)
(C)
 푇
(
푛
)
=Θ(푛
2
 log푛)
(D)
 푇
(
푛
)
=Θ(푛
2
loglog푛)


Q.43
Consider a binary min-heap containing 105 distinct elements. Let 푘 be the index (in
the underlying array) of the maximum element stored in the heap. The number of
possible values of 푘 is

(A) 53
(B) 52
(C) 27
(D) 1
   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 28 of 36
Organizing Institute: IISc Bengaluru
Q.44
The  symbol → indicates  functional  dependency in  the  context  of  a relational
database. Which of the following options is/are TRUE?

(A)

(
푋,푌
)
→
(
푍,푊
)
  implies  푋→
(
푍,푊
)

(B)
(
푋,푌
)
→
(
푍,푊
)
  implies
(
푋,푌
)
→푍
(C)
 (
(
푋,푌
)
→푍  and  푊→푌) implies
(
푋,푊
)
→푍
(D)


(
푋→푌  and  푌→푍
)
  implies  푋→푍




Q.45
Let 퐺 be a directed graph and 푇 a depth first search (DFS) spanning tree in 퐺 that
is  rooted  at  a  vertex 푣.  Suppose 푇 is  also  a  breadth  first  search (BFS) tree  in 퐺,
rooted at 푣. Which of the following statements is/are TRUE for every such graph 퐺
and tree 푇 ?

(A)
There are no back-edges in 퐺 with respect to the tree 푇
(B)
There are no cross-edges in 퐺 with respect to the tree 푇
(C)
There are no forward-edges in 퐺 with respect to the tree 푇
(D)
The only edges in 퐺 are the edges in  푇
   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 29 of 36
Organizing Institute: IISc Bengaluru
Q.46
Consider    the    following read-write schedule 푆 over    three    transactions
 푇
1
, 푇
2
, and 푇
3
, where the subscripts in the schedule indicate transaction IDs:
푆: 푟
1
(푧); 푤
1
(푧); 푟
2
(푥); 푟
3
(푦); 푤
3
(푦); 푟
2
(푦); 푤
2
(푥); 푤
2
(푦);
Which of the following transaction schedules is/are conflict equivalent to 푆 ?

(A)
푇
1
푇
2
푇
3

(B)
푇
1
푇
3
푇
2

(C) 푇
3
푇
2
푇
1

(D)
푇
3
푇
1
푇
2



Q.47
Consider a Boolean expression given by 퐹(푋,푌,푍)=∑(3,5,6,7).
Which of the following statements is/are CORRECT?

(A)
퐹
(
푋,푌,푍
)
=Π(0,1,2,4)


(B)
퐹
(
푋,푌,푍
)
=푋푌+푌푍+푋푍


(C)
퐹
(
푋,푌,푍
)
 is independent of input 푌
(D)
퐹
(
푋,푌,푍
)
 is independent of input 푋
   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 30 of 36
Organizing Institute: IISc Bengaluru
Q.48

Consider the following C function definition.

int f(int x, int y) {
  for (int i=0; i<y; i++) {
    x=x+x+y;
  }
  return x;
}
Which of the following statements is/are TRUE about the above function?


(A)
If the inputs are x=20, y=10, then the return value is greater than 2
20

(B)
If the inputs are x=20, y=20, then the return value is greater than 2
20

(C)
If the inputs are x=20, y=10, then the return value is less than 2
10

(D)
If the inputs are x=10, y=20, then the return value is greater than 2
20


Q.49
Let 퐴 be any 푛×푚 matrix, where 푚 >푛. Which of the following statements is/are
TRUE about the system of linear equations 퐴푥=0 ?

(A)
There exist at least 푚−푛 linearly independent solutions to this system
(B)
There exist 푚−푛 linearly independent vectors such that every solution is a linear
combination of these vectors
(C) There exists a non-zero solution in which at least 푚−푛 variables are 0
(D)
There exists a solution in which at least 푛 variables are non-zero
   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 31 of 36
Organizing Institute: IISc Bengaluru
Q.50
Consider the 5-state DFA  푀 accepting the language 퐿
(
푀
)
⊂
(
0+1
)
∗
 shown
below.  For any string 푤∈
(
0+1
)
∗
 let  푛
0
(푤) be the number of 0
′
푠 in 푤 and
푛
1
(푤) be the number of 1′푠 in 푤.


 Which of the following statements is/are FALSE?
(A)
States 2 and 4 are distinguishable in 푀
(B)
States 3 and 4 are distinguishable in 푀
(C)
States 2 and 5 are distinguishable in 푀
(D)
Any string 푤 with  푛
0
(
푤
)
=푛
1
(푤) is in 퐿(푀)






  Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 32 of 36
Organizing Institute: IISc Bengaluru
Q.51 The  chromatic  number  of  a  graph  is  the  minimum  number  of  colours  used  in  a
proper colouring of the graph. Let 퐺 be any  graph with 푛 vertices and chromatic
number 푘. Which of the following statements is/are always TRUE?

(A) 퐺 contains a complete subgraph with 푘 vertices
(B)
퐺 contains an independent set of size at least 푛/푘
(C)
퐺 contains at least 푘(푘−1)/2 edges
(D)
퐺 contains a vertex of degree at least 푘

Q.52
Consider the operators ◊ and □ defined by 푎◊푏=푎+2푏, 푎□푏=푎푏, for positive
integers. Which of the following statements is/are TRUE?

(A)
Operator ◊ obeys the associative law
(B)
Operator □ obeys the associative law
(C)
Operator ◊ over the operator □ obeys the distributive law
(D)
Operator □ over the operator ◊ obeys the distributive law



   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 33 of 36
Organizing Institute: IISc Bengaluru
Q.53 Consider  two  set-associative  cache  memory  architectures: WBC, which uses  the
write back policy, and WTC, which uses the write through policy. Both of them use
the  LRU  (Least  Recently  Used)  block  replacement  policy.  The  cache  memory  is
connected to the main memory. Which of the following statements is/are TRUE?

(A) A read miss in WBC never evicts a dirty block
(B)
A read miss in WTC never triggers a write back operation of a cache block to
main memory
(C) A write hit in WBC can modify the value of the dirty bit of a cache block
(D)
A write miss in WTC always writes the victim cache block to main memory
before loading the missed block to the cache

Q.54 Consider a 512 GB hard disk with 32 storage surfaces. There are 4096 sectors per
track and each sector holds 1024 bytes of data. The number of cylinders in the hard
disk is _________

Q.55 The  baseline  execution  time  of  a  program  on  a  2  GHz  single  core  machine  is
100 nanoseconds (ns). The code corresponding to 90% of the execution time can be
fully parallelized. The overhead for using an additional core is 10 ns when running
on a multicore system. Assume that all cores in the multicore system run their share
of the parallelized code for an equal amount of time.
The number of cores that minimize the execution time of the program is ________

Q.56 A given program has 25% load/store instructions. Suppose the ideal CPI (cycles per
instruction) without any memory stalls is 2. The program exhibits 2% miss rate on
instruction cache and 8% miss rate on data cache. The miss penalty is 100 cycles.
The speedup (rounded off to two decimal places) achieved with a perfect cache (i.e.,
with NO data or instruction cache misses) is _________  Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 34 of 36
Organizing Institute: IISc Bengaluru
Q.57 Consider the following code snippet using the fork() and wait() system calls.
Assume  that  the  code  compiles  and  runs  correctly,  and  that  the  system  calls  run
successfully without any errors.
int x = 3;
while(x > 0) {
  fork();
  printf("hello");
  wait(NULL);
  x--;
}
The total number of times the printf statement is executed is _______

Q.58 Consider the entries shown below in the forwarding table of an IP router. Each entry
consists of an  IP prefix and the  corresponding next hop router for packets whose
destination IP address matches the prefix. The notation “/N” in a prefix indicates a
subnet mask with the most significant N bits set to 1.
Prefix Next hop router
10.1.1.0/24 R1
10.1.1.128/25 R2
10.1.1.64/26 R3
10.1.1.192/26 R4
This router forwards 20 packets each to 5 hosts. The IP addresses of the hosts are
10.1.1.16,  10.1.1.72, 10.1.1.132,  10.1.1.191,  and  10.1.1.205  .  The  number  of
packets forwarded via the next hop router R2 is _______

Q.59
Let 퐺 = (푉,Σ,푆,푃)  be a context-free grammar in Chomsky Normal Form with
Σ =
{
푎,푏,푐
}
  and 푉 containing  10  variable  symbols  including  the  start
symbol 푆. The string 푤 = 푎
30
푏
30
푐
30
 is derivable from 푆. The number of steps
(application of rules) in the derivation 푆→
∗
푤 is _________
   Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 35 of 36
Organizing Institute: IISc Bengaluru
Q.60 The  number  of  edges  present  in  the  forest  generated  by  the  DFS  traversal of  an
undirected graph 퐺 with 100 vertices is 40. The number of connected components
in 퐺 is _________

Q.61
Consider the following two regular expressions over the alphabet {0,1}:
           푟= 0
∗
+1
∗

           푠=01
∗
+10
∗

The  total  number  of  strings  of  length  less  than  or  equal  to 5,  which  are
neither in 푟 nor in 푠, is _________

Q.62 Consider a memory management system that uses a page size of 2 KB. Assume that
both the physical and virtual addresses start from 0. Assume that the pages 0, 1, 2,
and 3 are stored in the page frames 1, 3, 2, and 0, respectively. The physical address
(in decimal format) corresponding to the virtual address 2500 (in decimal format)
is _________

Q.63 A bag contains 10 red balls and 15 blue balls. Two balls are drawn randomly without
replacement. Given that the first ball drawn is red, the probability (rounded off to 3
decimal places) that both balls drawn are red is _________






  Cannot read properties of undefined (reading 'completions')
Error parsing question with Gemini: TypeError: Cannot read properties of undefined (reading 'completions')
    at extractQuestionJSON (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\utils\genai.js:31:39)
    at exports.uploadPDF (C:\Users\Vedant\Desktop\Test-UrSelf\backend\src\controllers\pdfController.js:29:30)
❌ Failed to parse question:               Computer Science and Information Technology Set 1 (CS1)
Page 36 of 36
Organizing Institute: IISc Bengaluru
Q.64 Consider a digital logic circuit consisting of three 2-to-1 multiplexers M1, M2, and
M3  as  shown  below.  X1  and  X2  are  inputs of M1. X3  and  X4  are  inputs  of  M2.
A, B, and C are select lines of M1, M2, and M3, respectively.
M
1
M
2
M
3
A
B
C
1
0
1
0
1
0
X
2
X
1
X
4
X
3
Y
Q
1
Q
2
S
1
S
2
S
3

For   an   instance   of   inputs X1=1,   X2=1,   X3=0,   and X4=0,   the   number   of
combinations of A, B, C that give the output Y=1 is _________   

Q.65 Consider  sending  an  IP  datagram  of  size  1420  bytes  (including  20  bytes  of  IP
header) from a sender to a receiver over a path of two links with a router between
them. The first link (sender to router) has an MTU (Maximum Transmission Unit)
size of 542 bytes, while the second link (router to receiver) has an MTU size of 360
bytes. The number of fragments that would be delivered at the receiver is ________

  Cannot read properties of undefined (reading 'completions') 
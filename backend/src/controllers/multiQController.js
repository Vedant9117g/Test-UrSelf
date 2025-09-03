const { extractQuestionsFromImage, extractAnswerKeyFromImage, mergeQuestionsAndKeys } = require("../utils/genaiMultiQ");

exports.parseMultiQ = async (req, res) => {
  try {
    if (!req.files || !req.files.questions || !req.files.answerKey) {
      return res.status(400).json({ error: "Both question image and answer key image required" });
    }

    const qImg = req.files.questions[0].buffer;
    const aImg = req.files.answerKey[0].buffer;

    const questions = await extractQuestionsFromImage(qImg);
    const answers = await extractAnswerKeyFromImage(aImg);

    const merged = mergeQuestionsAndKeys(questions, answers);

    res.json({ success: true, data: merged });
  } catch (err) {
    console.error("❌ MultiQ Parse Error:", err);
    res.status(500).json({ error: err.message });
  }
};

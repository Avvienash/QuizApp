export function containsInappropriateContent(quizItem) {
  const inappropriateKeywords = [
    "sexual assault", "rape", "murder", "murdered", "kill", "killed", "death", "dead",
    "child abuse", "abuse", "assault", "shooting", "stabbing", "kidnap", "torture",
    "drugs", "human trafficking", "suicide", "harassment"
  ];

  const textToCheck = [
    quizItem.Question,
    quizItem["Option A"],
    quizItem["Option B"],
    quizItem["Option C"],
    quizItem["Option D"]
  ].join(" ").toLowerCase().replace(/[^\w\s]/g, "");

  return inappropriateKeywords.some(keyword => textToCheck.includes(keyword));
}
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
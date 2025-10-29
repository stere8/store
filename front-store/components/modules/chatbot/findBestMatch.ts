import {faqRules} from "@/constants/index"; // Importing the FAQ rules

export function findBestMatch(userInput: string): { responseIds: string[]; matched: boolean } {
  const input = userInput.toLowerCase();
  const matchedResponses: string[] = [];

  for (const rule of faqRules) {
    const matchCount = rule.keywords.reduce((count, keyword) => {
      return input.includes(keyword.toLowerCase()) ? count + 1 : count;
    }, 0);

    if (matchCount > 0) {
      matchedResponses.push(rule.response);
    }
  }

  if (matchedResponses.length > 0) {
    return {
      responseIds: matchedResponses,
      matched: true
    };
  }

  return {
    responseIds: ["chatbot.unrecognized"],
    matched: false
  };
}
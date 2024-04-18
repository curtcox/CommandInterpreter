function createRequestData(messages: any[]) : any {
    return {
      model: "gpt-4-turbo-preview",
      messages: messages,
      temperature: 1,
      max_tokens: 4096,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };
  }

function createRequestOptions(apiKey: string, requestData: any) {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestData),
    };
}

const apiKey = Deno.env.get("OPENAI_API_KEY") || "MISSING API KEY";
const apiUrl = "https://api.openai.com/v1/chat/completions";

export async function send(messages: any[]) {
    const requestData = createRequestData(messages);
    const requestOptions = createRequestOptions(apiKey, requestData);

    try {
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
}
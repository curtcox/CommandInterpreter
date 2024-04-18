function createRequestData(messages: any[]) : any {
    return {
      model: "claude-3-opus-20240229",
      messages: messages,
      max_tokens: 4096,
    };
}

function createRequestOptions(apiKey: string, requestData: any) : any {
    return {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "x-api-key": `${apiKey}`,
        "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestData),
    };
}

const apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "MISSING API KEY";
const apiUrl = "https://api.anthropic.com/v1/messages";

export async function send(messages: any[]) : Promise<any> {
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
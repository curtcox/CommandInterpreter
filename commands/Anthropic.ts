export interface Options {
    model: string;
    max_tokens: number;
}

export interface Message {
    role: string;
    content: string;
}

interface RequestData {
    model: string;
    messages: Message[];
    max_tokens: number;
}

const createRequestData = (options: Options, messages: Message[]) => (
    {
      model: options.model,
      messages: messages,
      max_tokens: options.max_tokens,
    }
)

function createRequestOptions(apiKey: string, requestData: RequestData) {
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

export async function send(options: Options, messages: Message[]) : Promise<any> {
    const requestData = createRequestData(options, messages);
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
import { assertStringIncludes } from "https://deno.land/std/assert/mod.ts";
import { command, markdown } from "./MarkdownCommand.ts";
import { emptyContext } from "../command/Empty.ts";

const interview = "https://www.nytimes.com/2024/04/12/podcasts/transcript-ezra-klein-interviews-dario-amodei.html";

function assertContents(text: string) {
    assertStringIncludes(text, "What if Dario Amodei Is Right About A.I.?");
    assertStringIncludes(text, "No, no, I told you. I’m a believer in exponentials.");
    assertStringIncludes(text, "The Ezra Klein Show");
    assertStringIncludes(text, "The really disorienting thing about talking");
    assertStringIncludes(text, "Behind those predictions are what are called the scaling laws.");
}

Deno.test("Interview using markdown function", async () => {
    const text = await markdown(interview);
    assertContents(text);
});

Deno.test("Directly using command definition", async () => {
    const result = await command.func(emptyContext,{format: "text", content: interview});
    const text = result.output.content as string;
    assertContents(text);
});

// Deno.test("Directly using command definition", async () => {
//     const result = await run(emptyContext,{format: "text", content: interview});
//     assertContents(result.output.content);
// });

// https://www.nytimes.com/2024/04/12/podcasts/transcript-ezra-klein-interviews-dario-amodei.html
// https://curtcox-markdown_download.web.val.run/?url=https%3A%2F%2Fwww.nytimes.com%2F2024%2F04%2F12%2Fpodcasts%2Ftranscript-ezra-klein-interviews-dario-amodei.html

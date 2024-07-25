import { CommandDefinition, CommandContext, CommandData } from "../command/CommandDefinition.ts";
import { email } from "https://esm.town/v/std/email";

const meta = {
  name: "email",
  doc: "send an email",
  source: import.meta.url,
};

const func = async (context: CommandContext, options: CommandData) => {
  const result = await email({
    subject: options.content.subject,
    text: options.content.text,
  });
  return {
    commands: context.commands,
    output: {
      format: "JSON",
      content: result,
    },
  };
}

export interface EmailOptions {
  subject: string;
  text: string;
}

export const email_cmd: CommandDefinition = {
  meta, func
};
import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { CommandData, CommandRecord } from './CommandDefinition.ts';

const app = new Hono()

interface FileInfo {
  id: string;
  record: CommandRecord;
}

function table(files: FileInfo[]): string {
  let htmlContent = `<table border="1"><tr><th>ID</th><th>Command</th><th>Output</th><th>Format</th></tr>`;
  files.forEach(file => {
    console.log({file})
    const name = file.id;
    const record = file.record;
    const command = record.command.meta.name;
    const output = record.result.output.content;
    const format = record.result.output.format;
    htmlContent += `<tr><td>${name}</td><td>${command}</td><td>${output}</td><td>${format}</td></tr>`;
  });
  htmlContent += '</table>';
  return htmlContent;
}

async function logs(): Promise<FileInfo[]> {
  const files = [];
  const dir = './store/log';
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile) {
      const filePath = `${dir}/${entry.name}`;
      const file = await Deno.readTextFile(filePath);
      const data = JSON.parse(file) as CommandData;
      const record = data.content as CommandRecord;
      const id = entry.name.replace('.json', '');
      files.push({ id, record });
    }
  }
  return files;
}

app.get('/', async (c) => {
  try {
    return c.html(table(await logs()));
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
})

Deno.serve(app.fetch)

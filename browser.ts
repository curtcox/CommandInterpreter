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
    const record_link = `<a href="/log/${name}">${name}</a>`;
    htmlContent += `<tr><td>${record_link}</td><td>${command}</td><td>${output}</td><td>${format}</td></tr>`;
  });
  htmlContent += '</table>';
  return htmlContent;
}

const logDir = './store/log';

async function log_file_contents(name: string): Promise<CommandRecord> {
  const filePath = `${logDir}/${name}`;
  const file = await Deno.readTextFile(filePath);
  const data = JSON.parse(file) as CommandData;
  return data.content as CommandRecord;
}

async function logs(): Promise<FileInfo[]> {
  const files = [];
  for await (const entry of Deno.readDir(logDir)) {
    if (entry.isFile) {
      const record = await log_file_contents(entry.name);
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

app.get('/log/:id', async (c) => {
  try {
    const { id } = c.req.param();
    return c.json(await log_file_contents(`${id}.json`));
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
})

Deno.serve(app.fetch)

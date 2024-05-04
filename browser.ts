import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { CommandData, CommandRecord } from './CommandDefinition.ts';
import { a, tr, th, td, bordered } from './viewer/Html.ts';

const app = new Hono()

interface FileInfo {
  id: string;
  record: CommandRecord;
}

function table(files: FileInfo[]): string {
  let rows = '';
  files.forEach(file => {
    const id = file.id;
    const record = file.record;
    const command = record.command.meta.name;
    const options = record.options;
    const output = record.result.output;
    rows += tr(td(a(`/log/${id}`,id)),td(a(`/log/${id}/command`,command)),td(options),td(output.content),td(output.format));
  });
  const header = tr(th('ID'),th('Command'),th('Options'),th('Output'),th('Format'));
  return bordered(header, rows);
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
    const record = await log_file_contents(`${id}.json`);
    return c.json(record);
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
})

app.get('/log/:id/command', async (c) => {
  try {
    const { id } = c.req.param();
    const record = await log_file_contents(`${id}.json`);
    return c.json(record.command);
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
})

Deno.serve(app.fetch)

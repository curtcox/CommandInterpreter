import { Hono, Context } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
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

async function log_for_id(id: string): Promise<CommandRecord> {
  return await log_file_contents(`${id}.json`);
}

function trap(c: Context, f: (c: Context) => any) {
  try {
    return f();
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
}

const handle = <T>(f: (c: Context) => Promise<T> ) => (c: Context) => trap(c, () => {
  const result = f(c);
  return Promise.resolve(result).then((response) => {
    if (typeof response === 'string') {
      return c.html(response);
    } else {
      return c.json(response);
    }
  });
});

const get = <T>(path:string, f: (c: Context) => Promise<T> ) => app.get(path, handle(f));

get('/',                async ()  => table(await logs()));
get('/log/:id',         async (c) => await log_for_id(c.req.param('id')));
get('/log/:id/command', async (c) => (await log_for_id(c.req.param('id'))).command);

Deno.serve(app.fetch)

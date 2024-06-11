import { Hono, Context } from 'https://deno.land/x/hono@v4.2.9/mod.ts'
import { CommandData, CommandRecord, CommandError, CommandCompletionRecord } from './command/CommandDefinition.ts';
import { a, tr, th, td, bordered } from './viewer/Html.ts';
import { lookupJson } from './core_commands/RefCommand.ts';
import { filename_safe } from "./core_commands/StoreCommand.ts";

const app = new Hono()
const debug = true

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
    const options = record.options.content;
    let content = '';
    let format = '';
    if (record instanceof CommandError) {
      const error = record as CommandError;
      content = `${error.message}`;
      format = 'Error';
    } else {
      const completion = record as CommandCompletionRecord;
      const output = completion.result.output;
      content = `${output.content}`;
      format = output.format;
    }
    rows += tr(td(a(`/log/${id}`,id)),td(a(`/log/${id}/command`,command)),td(`${options}`),td(content),td(format));
  });
  const header = tr(th('ID'),th('Command'),th('Options'),th('Output'),th('Format'));
  return bordered(header, rows);
}

const logDir = './store/log';
const hashDir = './store/hash';

async function log_file_contents(name: string): Promise<CommandRecord> {
  const filePath = `${logDir}/${name}`;
  const text = await Deno.readTextFile(filePath);
  const lookup = (key:string) => Deno.readTextFileSync(`${hashDir}/${filename_safe(key)}.json`);
  const json = lookupJson(text, lookup);
  const data = JSON.parse(json) as CommandData;
  return data.content as CommandRecord;
}

function sort(files: FileInfo[]): FileInfo[] {
  return files.sort((a, b) => parseInt(a.id) - parseInt(b.id) );
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
  return sort(files);
}

async function log_for_id(id: string): Promise<CommandRecord> {
  return await log_file_contents(`${id}.json`);
}

function trap(c: Context, f: (c: Context) => unknown) : unknown {
  try {
    return f(c);
  } catch (error) {
    console.error('Error:', error);
    return c.text('Error: ' + error.message);
  }
}

const handle = <T>(f: (c: Context) => Promise<T> ) => (c: Context) => trap(c, () => {
    console.log('Handling request');
    // console.log({c});
    const result = f(c);
    return Promise.resolve(result).then((response) => {
      if (typeof response === 'string') {
        return c.html(response);
      } else {
        return c.json(response);
      }
    }).catch((err) => {
      console.error('Error:', err);
      if (debug) {
        return c.text(err.stack, 500)
      } else {
        return c.text('Internal Server Error', 500)
      }
    });
});

const get = <T>(path:string, f: (c: Context) => Promise<T> ) => app.get(path, handle(f));

get('/',                async ()  => table(await logs()));
get('/log/:id',         async (c) => await log_for_id(c.req.param('id')));
get('/log/:id/command', async (c) => (await log_for_id(c.req.param('id'))).command);

Deno.serve(app.fetch)

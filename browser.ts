import { Hono } from 'https://deno.land/x/hono@v4.2.9/mod.ts'

const app = new Hono()

interface FileInfo {
  name: string;
  start: string;
}

function table(files: FileInfo[]): string {
  let htmlContent = `<table border="1"><tr><th>Name</th><th>Start</th></tr>`;
  files.forEach(file => {
    htmlContent += `<tr><td>${file.name}</td><td>${file.start}</td></tr>`;
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
      const first100Chars = file.substring(0, 100);
      files.push({ name: entry.name, start: first100Chars });
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

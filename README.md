# CommandInterpreter
A simple command interpreter.

## A simple command interpreter like bash?
- Agressively open source
- Open execution
- Using commands should be easy
- Making commands should be easy
- It should run everywhere

## Run the CLI
```bash
deno run --allow-all main.ts --commands="11 + 11"
```

## Run the browser
```bash
deno run --allow-net browser.ts
```

### Tests
```bash
deno test --allow-all *_test.ts 
```
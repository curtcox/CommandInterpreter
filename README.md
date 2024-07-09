# CommandInterpreter
A simple command interpreter.

## A simple command interpreter like bash?
- Agressively open source
- Open execution
- Using commands should be easy
- Making commands should be easy
- It should run everywhere

## Docs
- [Pitch](docs/pitch.md)
- [Goals](docs/goals.md)
- [Usage](docs/usage.md)
- [Structure](docs/structure.md)
- [Concepts](docs/concepts.md)
- [Plans](docs/plans.md)
- [History](docs/history.md)
- [Examples](docs/examples.md)

## Build Status
![Deno Status](https://github.com/curtcox/CommandInterpreter/actions/workflows/deno.yml/badge.svg)

## Run the CLI
```bash
deno run --allow-all main.ts --commands="11 + 11"
```

## Run the browser
```bash
deno run --allow-net --allow-read browser.ts
```

### Tests
```bash
deno test --allow-all *_test.ts 
```

Core commands don't depend on any commands besides other core commands.
Some core commands depend on each other.
All commands depend on the interfaces defined in CommandDefinition.
Despite this dependence, store commands use context to resolve each other,
so they could reasonably be replaced with enhanced versions.

```mermaid
do -> {help log context}
log -> store
context -> {define nop}
```
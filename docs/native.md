# Native

## Store
A store is needed in order to execute commands.
- command defintions can come from the store
- command execution will update the store

The store might, be backed by memory, a filesystem, a database,
an API, or some mixture of these.
You might want to think of it as like a unix filesystem.
However, it is a map from strings to strings that can be
snapshotted in order to pass a reference to its contents.

## Env
The environment is used for storing secrets and configuration.
- secrets, so that all of the details of running something can be shared without sharing the secrets.
- configuration, just like you might using environment variables.

The store might, be backed by memory, a filesystem, a database,
an API, or some mixture of these.
You might want to think of it as like a unix environment variables.


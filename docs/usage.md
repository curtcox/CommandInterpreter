# Usage

# Command Line

# Browser

## Paths
- GET /
- GET /context/:c
- GET /commands/ -> List[string]
- GET /time/ -> Times
- GET /time/:t -> Conext | Result
- GET /log/:id -> CommandRecord
- GET /store/:key -> string
- GET /command/:id -> CommandDefinition
- GET /options:/:id -> CommandData
- GET /input/:id -> CommandData
- GET /output/:id -> CommandResult
- GET /explain
- GET /hash/:#
- GET /env/:key -> string
- GET /snapshot/:#

- POST /do -> redirect to /
- POST /store/:key VALUE -> redirect to /
- POST /hash/:# VALUE -> redirect to /
- POST /env/:key VALUE -> redirect to /

## Path Parameters
- t = timestamp
- id = sequence number
- # = hash

## Query Params
- q = The query text if there is any.
- c = The context if there is any.
- other = Any additional query parameters will be used to define or override environment variables.
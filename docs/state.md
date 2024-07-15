# State

The interpreter can be thought of as a finite state machine moving from one
context to the next.

```mermaid
graph LR

S[Context]
T1[do]
T2[store]
T3[hash]
T4[env]

S --> T1 --> S
S --> T2 --> S
S --> T3 --> S
S --> T4 --> S
```

We can map those state transitions onto different user interfaces 
like a command line or a web site.

# HTTP

Consider the following functional mapping for HTTP.

```mermaid
graph LR

S[Context]
T1[do]
T2[store]
T3[hash]
T4[env]

S --> T1 --> S
S --> T2 --> S
S --> T3 --> S
S --> T4 --> S

P1[POST /do commands]
P2[POST /store/:key value]
P3[POST /hash/:# value]
P4[POST /env/:key value]

T1 --> P1
T2 --> P2
T3 --> P3
T4 --> P4
```

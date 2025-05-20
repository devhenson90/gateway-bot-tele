## Command

### Publish
```bash
nats pub greet 'Hello NATS!' --server nats://localhost:4223 --user gatewaynats --password 'aBk4HtB2tekrb+Nf'
```

### Subscribe
```bash
nats sub greet --server nats://localhost:4223 --user gatewaynats --password 'aBk4HtB2tekrb+Nf'
```

## Command

### Publish
```bash
nats pub -s nats://gatewaynats:aBk4HtB2tekrb+Nf@localhost:4223 greet 'Hello NATS!'
```

### Subscribe
```bash
nats sub -s nats://gatewaynats:aBk4HtB2tekrb+Nf@localhost:4223 greet
```
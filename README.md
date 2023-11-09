# setup-sd

This action sets up [chmln/sd](https://github.com/chmln/sd).

`sd` began adding a file extension starting on version v1.0.0.
`setup-sd@v2` doesn't support `sd@v0.*`; use `setup-sd@v1` instead for `sd@v0.*`.

## Usage

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3

      - name: Set up sd
        uses: kenji-miyake/setup-sd@v2

      - name: Run sd
        run: |
          sd before after
```

## Action inputs and outputs

Refer to [action.yaml](./action.yaml).

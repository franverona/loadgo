# Contributing

## Development setup

```bash
git clone https://github.com/franverona/loadgo.git
cd loadgo
npm install
```

This installs dev dependencies and sets up the Git hooks (Husky).

## Making changes

- Source files: `loadgo.js` (jQuery) and `loadgo-vanilla.js` (vanilla JS)
- Type declarations: `types/loadgo-vanilla.d.ts` and `types/loadgo.d.ts`
- Tests: `tests/loadgo.test.js` and `tests/loadgo-vanilla.test.js`

Run the full build to verify everything compiles correctly:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Lint and format:

```bash
npm run lint
npm run format
```

## Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook will reject messages that don't conform. Examples:

```
feat: add resize callback option
fix: correct overlay height for bt direction
docs: update README examples
chore: bump dependencies
```

## Submitting a pull request

1. Fork the repository and create a branch from `main`.
2. Make your changes, add tests if applicable, and ensure `npm test` and `npm run build` pass.
3. Open a pull request against `main`.

## Releasing (maintainers only)

To publish a new version:

```bash
npm version patch   # or minor / major — bumps package.json, commits, creates tag
git push && git push --tags
npm publish         # prepublishOnly runs npm run build automatically
```

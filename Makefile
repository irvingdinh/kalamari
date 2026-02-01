.PHONY: check publish kill

check:
	cd api && npm run format && npm run lint && npm run test:e2e && npm run build

kill:
	@lsof -ti :3456 | xargs kill -9 2>/dev/null || true

publish:
	cd api && npm install && npm run build && npm pack && npm publish

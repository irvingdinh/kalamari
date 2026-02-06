.PHONY: check check-api check-ui publish kill dev

check:
	$(MAKE) -j2 check-api check-ui

check-api:
	cd api && npm run format && npm run lint && npm run test:e2e && npm run build

check-ui:
	cd ui && bun run lint && bun run build

kill:
	@lsof -ti :3456 | xargs kill -9 2>/dev/null || true
	@lsof -ti :5173 | xargs kill -9 2>/dev/null || true

dev: kill
	cd api && npm start & cd ui && bun dev

publish:
	cd api && npm install && npm run build && npm pack && npm publish

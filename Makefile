.PHONY: check publish

check:
	cd api && npm run format && npm run lint && npm run test:e2e

publish:
	cd api && npm install && npm run build && npm pack && npm publish

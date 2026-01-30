.PHONY: publish

publish:
	cd api && npm install && npm run build && npm pack && npm publish

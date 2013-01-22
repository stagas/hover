
build: components index.js test
	@component-build --dev

components: component.json
	@component-install --dev

clean:
	rm -rf components

.PHONY: clean

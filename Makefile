SHELL := bash
PKG := npm

.PHONY: help install setup dev build preview generate lint lint-fix format format-check check clean clean-all precommit

help:
	@echo "Available targets:"
	@echo "  make install        Install dependencies"
	@echo "  make setup          Install + nuxt prepare + lint"
	@echo "  make dev            Start dev server"
	@echo "  make build          Production build"
	@echo "  make preview        Preview build"
	@echo "  make generate       Static generate"
	@echo "  make lint           Run ESLint"
	@echo "  make lint-fix       Run ESLint with --fix"
	@echo "  make format         Run Prettier (write)"
	@echo "  make format-check   Run Prettier (check)"
	@echo "  make check          Lint + format-check"
	@echo "  make clean          Remove build artifacts"
	@echo "  make clean-all      Remove build artifacts + node_modules"

install:
	$(PKG) install

install:
	$(PKG) update

setup:
	$(PKG) install
	$(PKG) run postinstall
	$(PKG) run lint

dev:
	$(PKG) run dev

build:
	$(PKG) run build

preview:
	$(PKG) run preview

generate:
	$(PKG) run generate

lint:
	$(PKG) run lint

lint-fix:
	$(PKG) run lint:fix

format:
	$(PKG) run format

format-check:
	$(PKG) run format:check

check:
	$(PKG) run lint
	$(PKG) run format:check

clean:
	rm -rf .nuxt .output dist coverage

clean-all: clean
	rm -rf node_modules

precommit:
	$(PKG) run precommit

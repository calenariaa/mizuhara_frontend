set shell := ["powershell", "-NoProfile", "-Command"]

help:
  @just --list

install:
  npm install

setup:
  npm install
  npm run postinstall
  npm run lint

dev:
  npm run dev

build:
  npm run build

preview:
  npm run preview

generate:
  npm run generate

lint:
  npm run lint

lint-fix:
  npm run lint:fix

format:
  npm run format

format-check:
  npm run format:check

check:
  npm run lint
  npm run format:check

clean:
  Remove-Item -Recurse -Force .nuxt,.output,dist,coverage -ErrorAction SilentlyContinue

clean-all:
  Remove-Item -Recurse -Force .nuxt,.output,dist,coverage,node_modules -ErrorAction SilentlyContinue

precommit:
  npm run precommit
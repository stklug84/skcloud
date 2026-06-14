#!/usr/bin/env bash
# @author:
#	Steffen Klug <45033201+stklug84@users.noreply.github.com>
# @dependencies:
#	python3 (>= 3.9), PyYAML, Jinja2 (pip install --user pyyaml jinja2)
#	A checkout of stklug84/actions for cv/parse/scripts/parse.py. Point
#	PARSE_DIR at the action root; defaults to a local checkout at
#	/Volumes/Data/repositories/ghec/stklug84/actions/cv/parse.
# @description:
#	Regenerate _data/cv.yml locally from the canonical curriculum-vitae
#	source. In CI this is done by the `generate` job in the
#	deploy/validate workflows (fetch cv.yaml from
#	stklug84/curriculum-vitae @ main, then run stklug84/actions/cv/parse
#	in web mode). For local `jekyll serve`, this script reproduces that
#	step so you preview real data instead of the committed fallback
#	_data/cv.yml.
# @arguments:
#	none (configured via environment variables, see @usage)
# @usage:
#	scripts/gen-cv.sh                          # fetch cv.yaml from main
#	CV_SOURCE=/path/to/cv.yaml scripts/gen-cv.sh   # use a local cv.yaml
#	PARSE_DIR=/path/to/actions/cv/parse scripts/gen-cv.sh  # local action

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# 1. Obtain the canonical bilingual cv.yaml.
if [ -n "${CV_SOURCE:-}" ]; then
  echo "Using local CV source: $CV_SOURCE"
  cp "$CV_SOURCE" "$WORK/cv.yaml"
else
  echo "Fetching cv.yaml from stklug84/curriculum-vitae @ main ..."
  curl -fsSL \
    https://raw.githubusercontent.com/stklug84/curriculum-vitae/main/data/cv.yaml \
    -o "$WORK/cv.yaml"
fi

# 2. Locate the action's parse.py.
PARSE_DIR="${PARSE_DIR:-/Volumes/Data/repositories/ghec/stklug84/actions/cv/parse}"
PARSE_PY="$PARSE_DIR/scripts/parse.py"
if [ ! -f "$PARSE_PY" ]; then
  echo "ERROR: parse.py not found at $PARSE_PY" >&2
  echo "Set PARSE_DIR to a checkout of stklug84/actions/cv/parse." >&2
  exit 1
fi

# 3. Emit cv.yml (web mode) and place it at _data/cv.yml.
python3 "$PARSE_PY" \
  --source "$WORK/cv.yaml" \
  --mode web \
  --out-dir "$WORK"

cp "$WORK/cv.yml" "$REPO_ROOT/_data/cv.yml"
echo "Wrote $REPO_ROOT/_data/cv.yml"
echo "Note: this overwrites the committed fallback. Do not commit local output."

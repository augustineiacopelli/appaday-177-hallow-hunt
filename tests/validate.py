#!/usr/bin/env python3
"""Validator for AppADay 177 Hallow Hunt.

Run from the repo root:  python3 tests/validate.py
Checks: inline scripts parse as classic scripts (node --check), no top level
await, ASCII only source, no forbidden APIs, and exactly one of each of the
seven required head tags with 177 in the hrefs.
"""
import os
import re
import subprocess
import sys
import tempfile

APP = '177'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'index.html')

fails = []


def check(ok, msg):
    print(('PASS  ' if ok else 'FAIL  ') + msg)
    if not ok:
        fails.append(msg)


src = open(PATH, encoding='utf-8').read()
head = src.split('</head>')[0]

# 1. Inline scripts parse as classic scripts
scripts = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', src, re.S)
check(len(scripts) >= 1, 'found %d inline script block(s)' % len(scripts))
for i, body in enumerate(scripts):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(body)
        tmp = f.name
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    os.unlink(tmp)
    check(r.returncode == 0, 'inline script %d parses with node --check %s' % (i, r.stderr.strip()[:300]))

# 2. No top level await (node --check on a .js CommonJS file already rejects it;
#    this heuristic catches an await at zero brace depth as a second guard)
def top_level_await(code):
    depth = 0
    for m in re.finditer(r'[{}]|\bawait\b', code):
        t = m.group(0)
        if t == '{':
            depth += 1
        elif t == '}':
            depth -= 1
        elif depth == 0:
            return True
    return False


check(not any(top_level_await(s) for s in scripts), 'no top level await')

# 3. ASCII only
bad = [(i, hex(ord(c))) for i, c in enumerate(src) if ord(c) > 127]
check(not bad, 'source is ASCII clean' + ('' if not bad else ' (first at %s)' % (bad[:5],)))

# 4. Forbidden APIs
code = '\n'.join(scripts)
for name, pat in [
    ('roundRect', r'\broundRect\b'),
    ('ellipse()', r'\.ellipse\s*\('),
    ('confirm()', r'\bconfirm\s*\('),
    ('bare element.remove()', r'(?<!classList)\.remove\(\s*\)'),
]:
    hits = re.findall(pat, code)
    check(not hits, 'no forbidden %s (%d found)' % (name, len(hits)))

# 5. Seven head tags, exactly once each, numbered 177
tags = [
    ('apple-touch-icon', r'<link rel="apple-touch-icon" href="https://augustineiacopelli\.github\.io/appaday/icons/%s\.png">' % APP),
    ('apple-mobile-web-app-title', r'<meta name="apple-mobile-web-app-title" content="[^"]{1,12}">'),
    ('apple-mobile-web-app-capable', r'<meta name="apple-mobile-web-app-capable" content="yes">'),
    ('mobile-web-app-capable', r'<meta name="mobile-web-app-capable" content="yes">'),
    ('status-bar-style', r'<meta name="apple-mobile-web-app-status-bar-style" content="black">'),
    ('manifest', r'<link rel="manifest" href="https://augustineiacopelli\.github\.io/appaday/manifests/%s\.webmanifest">' % APP),
    ('save.js', r'<script src="https://augustineiacopelli\.github\.io/appaday/save\.js" defer></script>'),
]
for name, pat in tags:
    n = len(re.findall(pat, head))
    check(n == 1, 'head tag %s appears exactly once (found %d)' % (name, n))
for kind in ['apple-touch-icon', 'apple-mobile-web-app-title', 'apple-mobile-web-app-capable',
             'name="mobile-web-app-capable"', 'apple-mobile-web-app-status-bar-style', 'rel="manifest"', 'save.js']:
    check(head.count(kind) == 1, 'no duplicate %s in head' % kind)
check('<title>Hallow Hunt | AppADay 177</title>' in head, 'tab title is Hallow Hunt | AppADay 177')
check(src.count('https://augustineiacopelli.github.io/appaday/"') >= 2, 'portfolio link present in header and footer')

# 6. Not an AI app: no Claude call, no keys.js or models.js
check('api.anthropic.com' not in src, 'no Claude API call (not an AI app)')
check('keys.js' not in src and 'models.js' not in src, 'no keys.js or models.js tags')

print()
if fails:
    print('%d check(s) failed' % len(fails))
    sys.exit(1)
print('All checks passed')

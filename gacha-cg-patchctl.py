#!/usr/bin/env python3
"""Independent Gacha Forge CG runtime policy patch controller."""
import argparse
import hashlib
from pathlib import Path
import re
import subprocess

ROOT=Path('/root/Marinara-Engine')
OVERRIDE=ROOT/'docker-compose.override.yml'
SRC=Path(__file__).with_name('gacha-cg-runtime.cjs')
DEST=ROOT/'gacha-cg-runtime.cjs'
BACKUP=ROOT/'.gacha-cg-override-before'
HASH=ROOT/'.gacha-cg-installed-sha256'
MOUNT='./gacha-cg-runtime.cjs:/app/gacha-cg-runtime.cjs:ro'
REQUIRE='--require=/app/gacha-cg-runtime.cjs'

def stop(msg): raise SystemExit('STOP: '+msg)
def checksum(s): return hashlib.sha256(s.encode()).hexdigest()
def compose_ok():
    result=subprocess.run(['docker','compose','config','-q'],cwd=ROOT,capture_output=True,text=True)
    if result.returncode: stop('Compose validation failed: '+result.stderr[-500:])

def add(s):
    if MOUNT in s or REQUIRE in s: stop('CG patch appears installed; use status')
    lines=s.splitlines(keepends=True)
    mi=next((i for i,x in enumerate(lines) if re.fullmatch(r'  marinara:\s*\n?',x)),None)
    if mi is None:
        if not s.strip(): lines=['services:\n','  marinara:\n'];mi=1
        else: stop('Expected two-space marinara service under services; cannot safely edit this YAML')
    end=next((i for i in range(mi+1,len(lines)) if re.match(r'^(?:  [A-Za-z0-9_-]+:|\S)',lines[i])),len(lines))
    chunk=lines[mi+1:end]
    vi=next((i for i,x in enumerate(chunk) if re.match(r'^    volumes:\s*$',x.rstrip('\n'))),None)
    if vi is None: chunk[0:0]=['    volumes:\n','      - '+MOUNT+'\n']
    else: chunk.insert(vi+1,'      - '+MOUNT+'\n')
    ei=next((i for i,x in enumerate(chunk) if re.match(r'^    environment:\s*$',x.rstrip('\n'))),None)
    if ei is None: chunk.extend(['    environment:\n','      NODE_OPTIONS: "'+REQUIRE+'"\n'])
    else:
        opt=next((i for i,x in enumerate(chunk) if re.match(r'^      NODE_OPTIONS:\s*',x)),None)
        if opt is None:
            following=next((x for x in chunk[ei+1:] if x.strip()),'')
            if following and following.startswith('      - '): stop('List-form environment requires manual setup')
            chunk.insert(ei+1,'      NODE_OPTIONS: "'+REQUIRE+'"\n')
        else:
            m=re.fullmatch(r'(      NODE_OPTIONS:\s*)(["\'])(.*)\2\s*',chunk[opt].rstrip('\n'))
            if not m: stop('NODE_OPTIONS must be a quoted YAML scalar; inspect manually')
            chunk[opt]=m.group(1)+m.group(2)+m.group(3)+' '+REQUIRE+m.group(2)+'\n'
    lines[mi+1:end]=chunk
    return ''.join(lines)

def main():
    p=argparse.ArgumentParser()
    p.add_argument('action',choices=['status','check','install','restore'])
    action=p.parse_args().action
    if not ROOT.is_dir():stop('Marinara directory missing')
    s=OVERRIDE.read_text() if OVERRIDE.exists() else ''
    installed=(MOUNT in s and REQUIRE in s)
    if action=='status':
        print('CG patch configured:',installed,'backup exists:',BACKUP.exists())
        return
    if action=='restore':
        if not BACKUP.exists() or not HASH.exists():stop('No recorded backup')
        if checksum(s)!=HASH.read_text().strip():stop('Compose settings changed since installation; refusing unsafe overwrite')
        prior=BACKUP.read_text()
        if prior:OVERRIDE.write_text(prior)
        else:OVERRIDE.unlink(missing_ok=True)
        try:compose_ok()
        except BaseException:
            OVERRIDE.write_text(s)
            raise
        BACKUP.unlink();HASH.unlink()
        print('CG settings restored. Restart Marinara to apply.')
        return
    if not SRC.is_file():stop('Place gacha-cg-runtime.cjs next to this script')
    if '[gacha-cg]' not in SRC.read_text() or 'const BEFORE=' not in SRC.read_text():stop('Unexpected CG runtime file')
    if installed:stop('CG patch already configured')
    if BACKUP.exists() or HASH.exists():stop('Existing backup state; inspect before continuing')
    updated=add(s)
    if action=='check':
        print('CHECK OK: independent CG patch can be configured; Korean patch settings preserved')
        return
    BACKUP.write_text(s)
    try:
        DEST.write_bytes(SRC.read_bytes())
        OVERRIDE.write_text(updated)
        compose_ok()
        HASH.write_text(checksum(updated))
    except BaseException:
        if s:OVERRIDE.write_text(s)
        else:OVERRIDE.unlink(missing_ok=True)
        BACKUP.unlink(missing_ok=True)
        raise
    print('CG PATCH INSTALLED. Restart Marinara to activate.')

if __name__=='__main__':main()

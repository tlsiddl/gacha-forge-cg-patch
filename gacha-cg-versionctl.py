#!/usr/bin/env python3
"""Manage v1/v1.1/v1.2/v1.2.1 CG policy without changing other Marinara patches."""
from pathlib import Path
import argparse, hashlib, os, subprocess, tempfile

ROOT=Path('/root/Marinara-Engine')
HERE=Path(__file__).resolve().parent
OVERRIDE=ROOT/'docker-compose.override.yml'
ACTIVE=ROOT/'gacha-cg-runtime.cjs'
LEGACY_CTL=HERE/'gacha-cg-patchctl.py'
MOUNT='./gacha-cg-runtime.cjs:/app/gacha-cg-runtime.cjs:ro'
REQUIRE='--require=/app/gacha-cg-runtime.cjs'
VERSIONS={'v1':HERE/'gacha-cg-v1.cjs','v1.1':HERE/'gacha-cg-v1.1.cjs','v1.2':HERE/'gacha-cg-v1.2.cjs','v1.2.1':HERE/'gacha-cg-v1.2.1.cjs'}

def fail(s):raise SystemExit('STOP: '+s)
def hash_bytes(b):return hashlib.sha256(b).hexdigest()
def current_version():
    if not ACTIVE.exists():return 'none'
    b=ACTIVE.read_bytes()
    for k,p in VERSIONS.items():
        if p.exists() and p.read_bytes()==b:return k
    return 'unrecognized'
def installed():
    if not OVERRIDE.exists():return False
    s=OVERRIDE.read_text()
    a=MOUNT in s;b=REQUIRE in s
    if a!=b:fail('Incomplete CG Compose configuration; inspect manually')
    return a
def checked_source(version):
    p=VERSIONS[version]
    if not p.is_file():fail('Missing '+str(p)+'; download both version files first')
    b=p.read_bytes()
    if b'[gacha-cg]' not in b or b'const BEFORE=' not in b:fail('Invalid source: '+str(p))
    return b
def write_atomic(path,data):
    fd,tmp=tempfile.mkstemp(prefix='.gacha-cg-version-',dir=str(path.parent))
    try:
        with os.fdopen(fd,'wb') as f:f.write(data)
        os.chmod(tmp,0o644)
        os.replace(tmp,path)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
def main():
    p=argparse.ArgumentParser()
    p.add_argument('action',choices=['status','install','switch'])
    p.add_argument('version',nargs='?',choices=['v1','v1.1','v1.2','v1.2.1'])
    a=p.parse_args()
    if not ROOT.is_dir():fail('Missing Marinara directory')
    on=installed()
    cur=current_version()
    if a.action=='status':
        print('CG configured:',on,'active runtime:',cur)
        return
    if not a.version:fail('Choose v1, v1.1, or v1.2.1')
    new=checked_source(a.version)
    if a.action=='install':
        if on:fail('CG already installed; use switch')
        if cur not in ('none','v1','v1.1','v1.2','v1.2.1'):fail('Existing runtime unknown; refusing overwrite')
        if not LEGACY_CTL.exists():fail('Missing gacha-cg-patchctl.py')
        old=ACTIVE.read_bytes() if ACTIVE.exists() else None
        try:
            write_atomic(ACTIVE,new)
            result=subprocess.run(['python3',str(LEGACY_CTL),'check'],capture_output=True,text=True)
            if result.returncode:fail('Preflight failed: '+result.stdout+result.stderr)
            result=subprocess.run(['python3',str(LEGACY_CTL),'install'],capture_output=True,text=True)
            if result.returncode:fail('Install failed: '+result.stdout+result.stderr)
            print(result.stdout.strip())
        except BaseException:
            if old is None:ACTIVE.unlink(missing_ok=True)
            else:write_atomic(ACTIVE,old)
            raise
    else:
        if not on:fail('CG not installed; use install')
        if cur=='unrecognized':fail('Current runtime differs from official v1/v1.1/v1.2/v1.2.1; refusing overwrite')
        if cur=='none':fail('Active CG runtime file not found')
        if cur==a.version:
            print('Already using '+cur)
            return
        write_atomic(ACTIVE,new)
        print('Switched '+cur+' -> '+a.version+'. Recreate Marinara container to apply the new bind-mounted file.')
    print('Run: cd /root/Marinara-Engine && docker compose up -d --force-recreate --no-deps marinara')

if __name__=='__main__':main()

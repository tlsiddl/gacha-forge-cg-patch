# Gacha Forge CG 조건 패치 — v1 / v1.1 / v1.2

가챠 포지 **1.8.12**에서 CG 선정 조건을 캐릭터 중심으로 개선하는 비공식 런타임 패치입니다. **원하는 버전을 선택해 설치하신 뒤, 필요하면 v1 ↔ v1.1로 변경할 수 있습니다.**

> 이 문서의 명령어는 Docker Compose로 운영하는 Marinara Engine 2.5.0, Gacha Forge 1.8.12, Node.js 22 이상 및 설치 경로 `/root/Marinara-Engine` 기준입니다. 다른 환경에서는 적용 전 검토해 주세요.

## 버전 선택

| 기능 | v1 — 캐릭터 우대형 | v1.1 — 페르소나 동반형 |
| --- | --- | --- |
| 주요 캐릭터 첫 등장·첫 대면 CG 우대 | 지원 | 지원 |
| 인상적인 상호작용·다인 장면 우대 | 지원 | 지원 |
| **플레이어 페르소나(내 캐릭터)** 함께 등장 우대 | 기존 처리 유지 | **강화** |
| 실제 포옹·손잡기·부축 등 동작 정확성 강조 | 기존 처리 유지 | **강화** |
| 없는 행동·감정·접촉 임의 생성 금지 | 유지 | 유지 |
| 기존 CG 빈도 상한·사용자 이미지 지침 | 변경 없음 | 변경 없음 |

**v1.2를 추천**하지만, 기존 v1도 계속 선택하실 수 있습니다. v1.1은 페르소나가 **실제 장면에 참여하거나 화면에 존재할 때** CG에서 누락되지 않도록 모델에 더 명확히 지시합니다. 페르소나를 모든 그림에 강제로 등장시키지는 않습니다.

이 패치는 CG를 *선정하는 스토리 생성 프롬프트*를 변경합니다. 이미지 생성기나 캐릭터 시트 연결 코드를 수정하는 것은 아닙니다. 따라서 CG 포함을 보장하지 않으며, 이미 생성된 스토리·CG에는 소급 적용되지 않습니다.


## v1.2 — 다인물 CG 외형 분리 (추천)

v1.2는 v1.1의 CG 장면 선정 및 페르소나 동반 우대 기능을 유지하면서 **스토리 CG에 한해서** 이미지 프롬프트를 아래 형식으로 구성합니다.

```text
배경, 분위기, 공통 구도 | 캐릭터 1 외형, 복장, 행동 | 캐릭터 2 외형, 복장, 행동
```

기존 이미지 참조를 추가하거나 캐릭터 초상화를 참조 이미지로 전송하지 않습니다. 각 인물의 이미지용 외형 태그와 장면 동작을 독립 구획으로 묶어 특징 교차를 완화하려는 시도이며, 이미지 모델의 결과를 보장하지는 않습니다. **캐릭터가 누락되거나 실제 등장하지 않은 인물을 강제 추가하지 않습니다.** 주인공 유닛의 외형이 비어 있다면 기존 런의 `protagonist.appearance`를 이미지 생성 시에만 대신 사용합니다. 저장된 주인공 유닛이나 페르소나 자체는 변경하지 않습니다. 일반 배너·초상화 생성에는 이 구분 형식을 적용하지 않습니다.

기존 설치자는 **스토리·CG 생성 작업이 모두 끝난 후** 아래처럼 업데이트할 수 있습니다.

```bash
cd /root
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1.2/gacha-cg-runtime.cjs -o gacha-cg-v1.2.cjs
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-versionctl.py -o gacha-cg-versionctl.py
python3 /root/gacha-cg-versionctl.py switch v1.2
cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

**주의:** 버전 관리 도구는 활성 런타임 파일을 원자적으로 교체하므로 기존 컨테이너의 파일 바인드 마운트가 이전 버전을 가리킬 수 있습니다. 버전 변경 후에는 단순 `restart` 대신 위의 `--force-recreate` 명령으로 컨테이너를 재생성해야 합니다. 작업 중 재생성하면 진행 중인 AI 요청이 중단될 수 있습니다. Compose의 데이터 볼륨은 삭제하지 않습니다.

확인:
```bash
python3 /root/gacha-cg-versionctl.py status
docker logs --since 10m marinara-engine-marinara-1 2>&1 | grep 'gacha-cg' | tail -20
```

기대 적용 로그: `CG character-focused selection and pipe-separated CG prompt v1.2 applied in memory`.

v1.2는 향후 생성되는 CG에만 영향을 주며 기존 그림을 다시 그리지 않습니다. 이전 버전으로 돌아가려면 `switch v1.1` 후 동일한 컨테이너 재생성 과정을 사용하세요.

## 1. 공통 준비 — GitHub에서 직접 다운로드

SSH로 마리나라 서버에 접속한 뒤 아래 명령어를 **통째로** 실행해 주세요. 기존 한국어 패치나 가속 패치의 설치 여부와 관계없이 사용할 수 있습니다.

```bash
cd /root

curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1/gacha-cg-runtime.cjs -o gacha-cg-v1.cjs
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1.1/gacha-cg-runtime.cjs -o gacha-cg-v1.1.cjs
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-patchctl.py -o gacha-cg-patchctl.py
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-versionctl.py -o gacha-cg-versionctl.py
```

이미 v1을 사용하고 계신 분도 위 파일들을 새로 다운로드하시면 됩니다. 기존 스토리와 CG 저장 데이터는 건드리지 않습니다.

## 2. CG 패치를 처음 설치하시는 분

먼저 설치 상태를 확인해 주세요.

```bash
python3 /root/gacha-cg-versionctl.py status
```

`CG configured: False`라면 아래 중 **하나만 선택**해 실행해 주세요.

**v1 처음 설치**

```bash
python3 /root/gacha-cg-versionctl.py install v1
```

**v1.1 처음 설치 (추천)**

```bash
python3 /root/gacha-cg-versionctl.py install v1.1
```

설치 성공 메시지를 확인하셨다면 마리나라를 재시작해 주세요.

```bash
cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

## 3. 기존 v1 사용자 — v1.1로 업그레이드

**기존 CG 패치 v1을 설치한 상태라면 제거하거나 재설치할 필요가 없습니다.**

공통 준비의 파일을 다운로드한 뒤 다음 명령어를 실행해 주세요.

```bash
python3 /root/gacha-cg-versionctl.py status
python3 /root/gacha-cg-versionctl.py switch v1.1

cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

설치 스크립트는 이미 적용된 Compose 마운트 및 `NODE_OPTIONS`를 유지하고 **CG 런타임 파일만 교체**합니다. 한국어 패치 설정과 CG 패치의 기존 복구용 백업은 변경하지 않습니다.

현재 런타임이 공식 배포한 v1/v1.1 파일과 다른 것으로 판별되면 덮어쓰기를 중단합니다.

## 4. v1.1에서 v1으로 되돌리기

v1.1을 사용해 보신 뒤 기존 CG 선정 방식을 선호하신다면 아래 명령어를 실행해 주세요.

```bash
python3 /root/gacha-cg-versionctl.py switch v1

cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

이는 CG 패치를 제거하는 것이 아니라 **버전만 변경**하는 작업입니다.

## 5. 설치·적용 상태 확인

```bash
python3 /root/gacha-cg-versionctl.py status

docker logs --since 10m marinara-engine-marinara-1 2>&1 | grep 'gacha-cg' | tail -20
```

`CG configured: True`는 설치 설정을 뜻합니다. `hook registered`는 로더 등록만 의미하며 실제 프롬프트 교체 성공은 다음 로그로 판단해 주세요.

- v1: `CG character-focused selection policy applied in memory`
- v1.1: `CG character-focused selection policy v1.1 applied in memory`

실제 CG 생성 여부는 새로운 스토리 장면과 이미지 저장 결과를 확인하셔야 합니다. 기존 생성 장면은 자동 수정되지 않습니다.

## 6. CG 패치를 완전히 제거하기

설치 전의 Compose 설정으로 되돌리려면 기존 복구 도구를 사용해 주세요.

```bash
python3 /root/gacha-cg-patchctl.py restore

cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

복원은 CG 패치 설치 직전 Compose 상태를 되살립니다. v1을 설치한 후 v1.1로 전환했더라도 복원 대상은 **최초 CG 패치 설치 직전 설정**입니다. 설치 이후 Compose 설정을 수동 변경하셨다면 자동 복구가 안전하게 중단될 수 있습니다.

## 지원 파일

- `versions/v1.2/gacha-cg-runtime.cjs`: 다인물 CG 프롬프트 `|` 분리 및 주인공 외형 fallback

- `versions/v1/gacha-cg-runtime.cjs`: v1 런타임 (보존)
- `versions/v1.1/gacha-cg-runtime.cjs`: 페르소나 동반 CG 선정 기능을 강화한 v1.1
- `gacha-cg-versionctl.py`: 버전별 신규 설치 및 버전 전환 도구
- `gacha-cg-patchctl.py`: 기존 설치·상태·복구 도구
- `gacha-cg-runtime.cjs`: 이전 v1 설치 방식과 호환되는 레거시 파일

## 유의사항

- **v1과 v1.1을 동시에 실행하지 마세요.** 같은 CG 패치에서 사용 버전 하나만 선택합니다.
- CG 빈도 설정, 사용자 지정 화풍 지침, 이미지 생성 모델 및 한국어 배경·스탠딩 패치는 변경하지 않습니다.
- 파일을 다운로드하는 명령은 README의 버전별 경로를 사용해 주세요. `main/gacha-cg-runtime.cjs`는 호환성을 위해 **v1**으로 유지됩니다.
- CG 이미지 생성에는 기존 모델 설정에 따른 비용이 발생할 수 있습니다.
- 서버 비밀번호, API 키, 개인 설정 및 게임 저장 데이터를 공개 저장소에 올리지 마세요.
- 본 프로젝트는 [Marinara Agents](https://github.com/Pasta-Devs/Marinara-Agents)의 비공식 패치입니다.


## 주인공 유닛 외형이 비어 있는 경우 — 저장 데이터 동기화

### 어떤 경우에 필요한가요?

**페르소나를 처음 만들 때 외형을 ‘설명’란이나 `Image Appearance Override`에는 작성했지만, 페르소나의 별도 ‘외형’ 입력란은 비워 둔 경우**입니다. 실제 확인한 사례도 **`Image Appearance Override`에는 외형을 넣었으나 별도의 외형란은 비워 둔 상태**였습니다. 이 상태로 가챠 포지를 시작하면 기존 런에 주인공 외형 정보가 비어 있을 수 있습니다. `Image Appearance Override`는 이미지 생성용 외형 지침이며, 별도의 페르소나 `appearance` 필드와 동일하게 자동 저장·동기화되는 것으로 가정하면 안 됩니다. 이후 페르소나 편집 화면에서 외형란을 채우더라도, **이미 만들어진 가챠 포지 런과 주인공 유닛이 자동으로 동기화된다고 가정하시면 안 됩니다.**

이 문제는 다음 순서로 확인하고 해결해 주세요.

1. 마리나라 **페르소나 편집 화면**에서 ‘설명’ 또는 **`Image Appearance Override`**에 작성해 둔 외형 묘사를 확인하고, 별도의 **‘외형’ 입력란**에도 정확한 외형을 작성·저장합니다. 기존 설명이나 이미지 오버라이드 설정은 필요에 따라 유지해도 됩니다.
2. **새로 생성할 런**이라면, 페르소나 외형을 저장한 뒤 시작하는 것이 가장 간단합니다.
3. **이미 진행 중인 기존 런**이라면 런에 저장된 `protagonist.appearance`도 확인해야 합니다. 런 외형이 비어 있다면 **아래의 유닛 동기화 명령부터 실행해서는 안 됩니다.** 해당 명령은 원본 페르소나 설명을 읽거나 외형을 자동 추출하지 못합니다. 런 외형을 먼저 안전하게 반영·검증해야 합니다.
4. 기존 런 외형이 정상이고 **주인공 유닛의 외형만 비어 있을 때** 아래 백업·동기화 명령을 사용합니다.

**중요:** 아래 코드는 ‘설명’이나 `Image Appearance Override`에서 외형을 자동 추출하는 코드가 아닙니다. **런에 이미 저장된 외형을 빈 주인공 유닛에 복사**하는 코드입니다. 실제 검증 사례에서도 ① 원본 페르소나의 별도 외형란 저장 → ② 기존 런 외형 동기화 → ③ 주인공 유닛 외형 동기화 순서로 진행했습니다. 아래에는 기존 런에 원본 페르소나 외형을 복사하는 **2단계**와, 그 외형을 빈 주인공 유닛에 복사하는 **3단계**를 구분해 안내합니다.

### 기존 런에 원본 페르소나 외형 반영하기 (2단계)

페르소나 편집 화면의 별도 **외형란을 저장한 뒤** 실행하는 단계입니다. `Image Appearance Override`에 작성한 문장을 자동 추출하지 않습니다. 원본 페르소나의 `appearance`가 비어 있으면 작업을 중단합니다.

**아래 명령은 이미 만들어진 런의 `protagonist.appearance`가 빈 경우에만 복사합니다.** 기존 런에 값이 있다면 덮어쓰지 않습니다. 다른 페르소나·다른 런을 건드리지 않도록 런에 연결된 `personaId`와 이름을 대조하고, 수정 전에 인덱스 파일을 백업합니다. 이 코드는 Gacha Forge 1.8.12의 실제 저장 구조를 기준으로 작성한 안내용 스크립트입니다. **실제 사용자 사례에서는 같은 저장 필드를 동기화하고 400자가 들어간 것을 확인했지만, 아래 범용화한 명령을 여러 환경에서 검증한 것은 아닙니다.** 모든 스토리·CG 생성 작업이 끝나고 서버 백업을 준비한 뒤 사용하세요.

```bash
RUN_ID='여기에-런-ID'
docker exec -i -e RUN_ID="$RUN_ID" marinara-engine-marinara-1 python3 - <<'PY'
import json, os, shutil, tempfile
from pathlib import Path
from datetime import datetime

root = Path('/app/data/storage/tables/capability_documents')
run_id = os.environ.get('RUN_ID', '')
if not run_id or run_id == '여기에-런-ID':
    raise SystemExit('중단: RUN_ID를 실제 값으로 변경해 주세요.')
index_path = root / 'index.json'
original = index_path.read_bytes()
rows = json.loads(original)
if not isinstance(rows, list) or len(rows) != 1:
    raise SystemExit('중단: 알 수 없는 런 저장 구조입니다.')
raw = rows[0].get('data')
if not isinstance(raw, str):
    raise SystemExit('중단: 알 수 없는 인덱스 데이터 형식입니다.')
index_data = json.loads(raw)
runs = index_data.get('runs', [])
matched = [x for x in runs if x.get('runId') == run_id]
if len(matched) != 1:
    raise SystemExit('중단: 런을 유일하게 찾을 수 없습니다.')
run = matched[0]
protagonist = run.get('protagonist') or {}
persona_id = protagonist.get('personaId')
name = protagonist.get('name')
if not persona_id or not name:
    raise SystemExit('중단: 연결된 페르소나 정보가 없습니다.')
if (protagonist.get('appearance') or '').strip():
    raise SystemExit('중단: 런의 외형란이 이미 채워져 있습니다. 덮어쓰지 않습니다.')

persona_root = Path('/app/data/storage/tables/personas')
found = []
for path in persona_root.glob('*.json'):
    try:
        item = json.loads(path.read_text())
        if isinstance(item, list) and len(item) == 1 and item[0].get('id') == persona_id:
            found.append(item[0])
    except (ValueError, OSError, TypeError, KeyError):
        continue
if len(found) != 1:
    raise SystemExit('중단: 원본 페르소나를 유일하게 찾지 못했습니다.')
persona = found[0]
if persona.get('name') != name:
    raise SystemExit('중단: 원본 페르소나 이름과 런의 주인공 이름이 다릅니다.')
appearance = persona.get('appearance') or ''
if not isinstance(appearance, str) or not appearance.strip():
    raise SystemExit('중단: 원본 페르소나의 별도 외형란이 비어 있습니다.')

backup = index_path.with_name('index.json.appearance-backup-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
shutil.copy2(index_path, backup)
protagonist['appearance'] = appearance
rows[0]['data'] = json.dumps(index_data, ensure_ascii=False)
if index_path.read_bytes() != original:
    raise SystemExit('중단: 작업 도중 런 인덱스 파일이 변경되었습니다.')
fd, temporary = tempfile.mkstemp(prefix='.gacha-run-appearance-', dir=str(root))
try:
    with os.fdopen(fd, 'w', encoding='utf-8') as handle:
        json.dump(rows, handle, ensure_ascii=False)
    shutil.copymode(index_path, temporary)
    os.replace(temporary, index_path)
finally:
    if os.path.exists(temporary): os.unlink(temporary)
check = json.loads(index_path.read_text())[0]['data']
check = json.loads(check) if isinstance(check, str) else check
verified = next(x for x in check['runs'] if x.get('runId') == run_id)
print('주인공:', name)
print('원본 외형:', len(appearance), '자')
print('런 외형:', len(verified['protagonist'].get('appearance', '')), '자')
print('외형 일치:', verified['protagonist'].get('appearance') == appearance)
print('백업:', backup.name)
PY
```

이 단계에서 **`외형 일치: True`**가 확인되면 다음 **주인공 유닛 외형 동기화(3단계)**를 진행할 수 있습니다. 원본 페르소나 외형도 비어 있다면 명령을 반복하지 말고 먼저 편집 화면에서 외형란을 저장하세요. 서버가 기존 문서를 캐시하는 경우 실행 중인 프로세스에 즉시 반영되지 않을 수 있으므로 새 CG 결과는 별도로 확인해야 합니다.

### 기존 런의 주인공 유닛에 외형 반영하기 (3단계)

가챠 포지의 **런에 저장된 주인공 외형**과 **주인공 캐릭터 유닛 외형**은 별개일 수 있습니다. 기존 런의 `protagonist.appearance`에는 텍스트가 있어도 유닛 `appearance`가 빈 문자열인 경우가 확인되었습니다.

**검증 사례:** Gacha Forge 1.8.12의 한 기존 런에서 런 외형 400자, 유닛 외형 0자였으며, 외형 한 필드만 동기화한 뒤 읽기 전용 검사에서 **400자 / 400자 / 동일함(True) / 주인공(True)**를 확인했습니다. 이것은 **저장 파일 검증**이며 새 CG 반영이나 서버 캐시 갱신을 보장하는 결과는 아닙니다.

**주의:** 아래 절차는 Docker 안의 Gacha Forge 저장 JSON 문서를 직접 수정하는 고급 사용자용 방법입니다. 생성 중인 스토리·CG 작업이 없을 때만 사용하시고, 작업 전 서버 백업을 권장합니다. 다른 저장소 구조/버전에서는 사용하지 마세요. 인용부호와 `PY` 종료 행을 포함한 전체 명령어를 붙여 넣어야 합니다. 종료 행 `PY`는 맨 앞부터 단독으로 입력해야 합니다.

1. 자신의 런 ID를 확인하고 `RUN_ID`를 변경합니다. 주인공 이름을 특정 이름으로 고정하지 않습니다.
2. 동기화 전에 런과 유닛의 ID, 주인공 여부를 검증하고 대상 문서의 원본 백업을 남깁니다.
3. 현재 빈 `appearance`만 채웁니다. 이미 값이 있는 유닛은 자동으로 덮어쓰지 않습니다.
4. 파일 수정 후 다시 내용을 읽어 두 외형이 완전히 동일한지 확인합니다.

```bash
# 반드시 본인의 런 ID로 바꾸세요.
RUN_ID='여기에-런-ID'
docker exec -i -e RUN_ID="$RUN_ID" marinara-engine-marinara-1 python3 - <<'PY'
import json, os, shutil
from pathlib import Path
from datetime import datetime

root = Path('/app/data/storage/tables/capability_documents')
run_id = os.environ['RUN_ID']
if not run_id or run_id == '여기에-런-ID':
    raise SystemExit('중단: RUN_ID를 실제 값으로 변경해 주세요.')

index = json.loads((root / 'index.json').read_text())[0]['data']
if isinstance(index, str): index = json.loads(index)
run = next((x for x in index['runs'] if x.get('runId') == run_id), None)
if not run: raise SystemExit('중단: 런을 찾지 못했습니다.')
source = run.get('protagonist') or {}
appearance = source.get('appearance') or ''
name = source.get('name') or ''
if not name or not appearance.strip():
    raise SystemExit('중단: 런의 주인공 이름 또는 외형이 없습니다.')

id_expected = run_id + ':unit:protagonist'
target = root / (id_expected.replace(':', '%3A') + '.json')
if not target.exists():
    raise SystemExit('중단: 주인공 유닛 파일을 찾지 못했습니다. 수정하지 않았습니다.')
original = target.read_text()
records = json.loads(original)
if not isinstance(records, list) or len(records) != 1 or records[0].get('id') != id_expected:
    raise SystemExit('중단: 유닛 문서의 형식 또는 ID가 다릅니다.')
data = records[0]['data']
if isinstance(data, str): data = json.loads(data)
if data.get('name') != name or data.get('isProtagonist') is not True:
    raise SystemExit('중단: 유닛의 주인공 신원이 일치하지 않습니다.')
if (data.get('appearance') or '').strip():
    raise SystemExit('중단: 유닛 외형이 이미 있습니다. 덮어쓰지 않습니다.')

backup = target.with_name(target.name + '.appearance-backup-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
shutil.copy2(target, backup)
data['appearance'] = appearance
records[0]['data'] = json.dumps(data, ensure_ascii=False)
if target.read_text() != original:
    raise SystemExit('중단: 작업 도중 문서가 변경되었습니다.')
with target.open('w') as file:
    json.dump(records, file, ensure_ascii=False)
print('외형 동기화 완료:', name, len(appearance), '자')
print('백업:', backup.name)
PY
```

**저장 파일 검증:** 같은 `RUN_ID`를 유지한 채 아래 명령을 실행합니다.

```bash
docker exec -e RUN_ID="$RUN_ID" marinara-engine-marinara-1 python3 -c 'import json,os,pathlib; p=pathlib.Path("/app/data/storage/tables/capability_documents"); rid=os.environ["RUN_ID"]; q=json.loads((p/"index.json").read_text())[0]["data"]; q=json.loads(q) if isinstance(q,str) else q; run=next(r for r in q["runs"] if r.get("runId")==rid); x=json.loads((p/(rid.replace(":","%3A")+"%3Aunit%3Aprotagonist.json")).read_text())[0]["data"]; x=json.loads(x) if isinstance(x,str) else x; a=run["protagonist"].get("appearance",""); b=x.get("appearance",""); print("런 외형:",len(a),"자"); print("유닛 외형:",len(b),"자"); print("외형 일치:",a==b); print("주인공 여부:",x.get("isProtagonist"))'
```

두 외형의 길이가 같고 `외형 일치: True`이면 **저장 파일**에는 반영된 것입니다. 실행 중인 서버가 이전 문서를 캐시할 수 있으므로 새 CG 반영은 별도로 테스트해야 합니다. 이 방법은 한 런에서 검증된 절차이며 모든 Gacha Forge 버전에 대한 자동 복구 도구가 아닙니다.

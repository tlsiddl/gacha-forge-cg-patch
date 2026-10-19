# 페르소나 외형 누락 해결 가이드

[← 메인 README로 돌아가기](../README.md)

> **이 안내는 Gacha Forge 1.8.12 / Marinara Engine 2.5.0 / Docker Compose 사용자를 기준으로 작성했습니다.** 서버 파일을 직접 수정하는 절차는 고급 사용자용입니다. 먼저 스토리·CG 생성이 완료되었는지 확인하고 백업을 준비해 주세요.

## 먼저 확인 — 이런 상황인가요?

마리나라에서 페르소나를 만들 때 **`Image Appearance Override`**에는 외형을 적었지만, 페르소나 편집 화면의 **별도 ‘외형(Appearance)’ 칸**은 비워 둔 경우입니다. ‘설명(Description)’에 외형을 적어 둔 경우도 비슷한 문제가 생길 수 있습니다.

이 세 입력란은 혼동하기 쉽습니다.

| 입력란 | 무엇을 위한 칸인가요? |
| --- | --- |
| **설명(Description)** | 캐릭터 설정을 서술하는 칸 |
| **Image Appearance Override** | 이미지 생성을 위한 별도 외형 지침 |
| **외형(Appearance)** | 페르소나의 `appearance` 데이터가 저장되는 칸 |

**중요:** `Image Appearance Override`를 채웠다고 가챠 포지의 런·주인공 유닛 외형까지 자동 채워지는 것은 아닙니다.

## 1단계 — 페르소나 편집 화면에서 외형란 채우기

1. **마리나라의 페르소나 편집 화면**을 엽니다.
2. 이전에 **Image Appearance Override** 또는 설명란에 적어 둔 외형을 확인합니다.
3. 페르소나의 별도 **외형(Appearance)** 입력란에도 외형을 작성합니다.
4. **저장**합니다. 기존 오버라이드 문구는 지울 필요 없습니다.

아직 가챠 포지 런을 만들지 않았다면 여기서 멈추고 새 런을 시작하면 됩니다. 아래 2·3단계는 **이미 게임을 진행 중인 경우**를 위한 것입니다.

## Run ID가 뭔가요? 어디서 확인하나요?

**Run ID(런 ID)는 가챠 포지에서 진행 중인 게임 기록을 구별하는 고유 번호**입니다. *캐릭터 이름, 페르소나 ID, 챕터 번호와 다릅니다.* 한 계정에서 게임을 여러 번 시작했다면 Run ID도 여러 개일 수 있습니다.

SSH에서 아래 **한 줄**을 실행하면 저장된 게임의 **주인공 이름과 Run ID를 함께** 보여줍니다. 이 명령은 읽기 전용입니다.

```bash
docker exec marinara-engine-marinara-1 python3 -c 'import json,pathlib; p=pathlib.Path("/app/data/storage/tables/capability_documents/index.json"); d=json.loads(p.read_text())[0]["data"]; d=json.loads(d) if isinstance(d,str) else d; print("\n".join("주인공: {} | Run ID: {}".format((r.get("protagonist") or {}).get("name","이름 없음"),r.get("runId","")) for r in d.get("runs",[])))'
```

예시 출력:

```text
주인공: 김띠니 | Run ID: run-예시123
주인공: 다른캐릭터 | Run ID: run-예시456
```

**수정할 게임 기록의 Run ID**를 확인하고, 아래 코드의 `RUN_ID='여기에-런-ID'` 부분을 실제 값으로 변경해 주세요. 같은 이름으로 여러 런이 있다면 ID만으로 어떤 게임인지 단정하지 말고 게임 진행 상황을 먼저 구분해 주세요.

## 2단계 — 원본 페르소나 외형을 기존 게임 런에 복사하기

**언제 필요한가요?** 1단계에서 페르소나의 별도 외형란을 저장했지만, **예전에 만든 게임 런의 외형란이 여전히 비어 있는 경우**입니다.

**무엇을 바꾸나요?** 원본 페르소나의 `appearance`를 **기존 런의 `protagonist.appearance`에 복사**합니다. 다른 게임 기록을 건드리지 않도록 Run ID와 페르소나 ID·이름을 검사합니다. 기존 외형이 있다면 덮어쓰지 않고 중단합니다. 변경 전에는 `index.json`을 자동 백업합니다.

> **주의:** 스토리·CG 사전 생성이 진행 중이라면 실행하지 마세요. 저장 파일을 직접 수정하므로 서버 캐시와 충돌할 수 있습니다. 아래 범용 스크립트는 한 환경에서 사용한 절차를 일반화한 것이며, 모든 설치 환경에서 검증된 것은 아닙니다.

아래 **코드 전체**를 SSH에 붙여 넣되, 첫 줄의 `여기에-런-ID`만 본인의 값으로 변경해 주세요. 코드 마지막 `PY`는 맨 앞에 단독으로 있어야 합니다. `>` 표시만 뜨면 `Ctrl+C`로 입력 대기를 취소하고 다시 붙여 넣으세요.

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

**성공 확인:** 출력에서 `외형 일치: True`와 외형 글자 수를 확인합니다. 이미 런의 외형이 존재한다는 메시지가 나온다면 **덮어쓰지 말고** 현재 내용을 확인한 후 3단계로 넘어가세요.

## 3단계 — 기존 주인공 유닛에도 외형 반영하기

**언제 필요한가요?** 2단계에서 기존 런의 외형은 채워졌지만 **주인공 유닛의 `appearance`가 비어 있는 경우**입니다.

**무엇을 바꾸나요?** 런의 외형을 주인공 유닛의 외형에 복사합니다. 기존 레벨·장비·전투 능력을 초기화하지 않습니다. 대상 파일을 백업하며 이미 외형이 있으면 덮어쓰지 않습니다.

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

### 최종 결과 확인 (읽기 전용)

2·3단계가 끝나면 같은 Run ID로 확인합니다.

```bash
docker exec -e RUN_ID="$RUN_ID" marinara-engine-marinara-1 python3 -c 'import json,os,pathlib; p=pathlib.Path("/app/data/storage/tables/capability_documents"); rid=os.environ["RUN_ID"]; q=json.loads((p/"index.json").read_text())[0]["data"]; q=json.loads(q) if isinstance(q,str) else q; run=next(r for r in q["runs"] if r.get("runId")==rid); x=json.loads((p/(rid.replace(":","%3A")+"%3Aunit%3Aprotagonist.json")).read_text())[0]["data"]; x=json.loads(x) if isinstance(x,str) else x; a=run["protagonist"].get("appearance",""); b=x.get("appearance",""); print("런 외형:",len(a),"자"); print("유닛 외형:",len(b),"자"); print("외형 일치:",a==b); print("주인공 여부:",x.get("isProtagonist"))'
```

다음처럼 나오면 **저장 파일 기준으로** 동기화된 것입니다.

```text
런 외형: 400 자
유닛 외형: 400 자
외형 일치: True
주인공 여부: True
```

`400`은 실제 사례의 예시이며, 다른 사람의 외형 글자 수는 달라도 됩니다.

**실제 확인 사례:** 처음에는 주인공 유닛 외형 0자였으나, 기존 런 외형 400자를 복사한 다음 **400자 / 400자 / True / True**를 확인했습니다.

## 자주 묻는 질문

**Q. 기존 CG도 수정되나요?** 아니요. 이미 생성한 이미지는 바뀌지 않습니다.

**Q. 2단계와 3단계를 꼭 둘 다 해야 하나요?** 아닙니다. 이미 값이 들어 있는 단계는 건너뛰세요. 각 스크립트는 기존 외형을 자동 덮어쓰지 않습니다.

**Q. 실행 후에도 그림이 달라지나요?** 저장 파일이 맞아도 실행 중인 서버 캐시·이미지 모델의 해석 차이로 달라질 수 있습니다. 새 CG에 실제 반영되는지는 별도로 확인해야 합니다.

**Q. 데이터를 되돌릴 수 있나요?** 스크립트가 출력한 `appearance-backup-` 백업 파일을 보존해 두세요. 복원 전에는 서버의 상태와 다른 변경 사항을 반드시 확인해야 합니다.

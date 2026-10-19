# Gacha Forge CG 패치

가챠 포지 **1.8.12**의 스토리 CG 선정 및 인물 표현을 보완하는 **비공식 런타임 패치**입니다. v1 / v1.1 / v1.2 중 **한 버전만** 설치할 수 있고, 기존 버전으로 돌아갈 수 있습니다.

> 지원 기준: Marinara Engine 2.5.0 · Gacha Forge 1.8.12 · Node.js 22 이상 · Docker Compose · `/root/Marinara-Engine`. 설치 전에 스토리·CG 생성 작업을 모두 마쳐 주세요.

## v1.2 — 다인물 CG 프롬프트 개선

v1.2에는 **인물별 `|` 분리**, **주인공 런 외형 fallback**, **외형 태그 조립 정규화**, **인물별 좌우 위치·외형 특징 혼합 방지 지침**이 포함됩니다. 새 CG 생성 시 등장인물 수에 따라 LEFT/CENTER/RIGHT 등의 구역을 배정하며, 인물 고유의 머리색·동물 귀·안경 등을 서로 혼합하지 말라고 명시합니다. 위치는 CG마다 등장인물 수와 순서에 맞춰 배정되며, 결과를 반드시 보장하는 기능은 아닙니다. 새 CG를 생성할 때 `CG prompt assembled` 진단 로그를 기록합니다. 인물 이름이나 외형 원문은 로그에 저장하지 않습니다.

**새 CG를 생성한 뒤** 점검:

```bash
docker logs --since 30m marinara-engine-marinara-1 2>&1 | grep -E 'v1.2|CG prompt assembled' | tail -20
```

`CG prompt assembled: characters=N pipes=N fragmented=false`는 **패치 안에서 조립한 프롬프트의 진단 결과**입니다. 실제 그림의 외형 일관성은 이미지 모델에 따라 달라질 수 있습니다. 이미 생성된 CG는 자동으로 바뀌지 않습니다.

## 1. 버전 비교 — 어떤 걸 설치하면 될까요?

| 기능 | v1 | v1.1 | v1.2 |
| --- | :---: | :---: | :---: |
| 주요 캐릭터 첫 등장·첫 대면 CG 우대 | ✅ | ✅ | ✅ |
| 인상적인 상호작용·다인 장면 CG 우대 | ✅ | ✅ | ✅ |
| **주인공이 장면에 실제 등장할 때 CG 동반 우대** | 기본 | ✅ 강화 | ✅ 강화 |
| 포옹·손잡기 등 실제 동작을 충실히 표현하도록 강조 | 기본 | ✅ 강화 | ✅ 강화 |
| **다인물 CG 프롬프트를 인물별로 분리** | ❌ | ❌ | ✅ |
| 주인공 유닛 외형이 비면 **런 외형을 CG에서 대체 사용** | ❌ | ❌ | ✅ |
| 이미지 참조 파일 요구 | ❌ | ❌ | ❌ |

**추천:** 캐릭터 등장 CG만 개선하려면 **v1**, 주인공을 포함한 관계·상호작용 CG를 더 선호한다면 **v1.1**, 추가로 **여러 인물의 머리·눈·복장이 섞이는 현상을 줄이고 싶다면 v1.2**를 선택해 주세요. `|` 방식이 이미지 모델의 외형 일관성을 완전히 보장하지는 않습니다.

**v1.1 또는 v1.2 설치 전 필수 확인:** 페르소나 **‘외형(Appearance)’란**이 채워져 있나요? **Image Appearance Override에만 외형을 입력한 경우**는 별도로 확인해 주세요. [**페르소나 외형 확인·기존 런 복구 방법 보기 →**](docs/persona-appearance.md)

### `|` 분리 기능만 필요하신가요?

CG 선정 정책 없이 **스토리 CG 프롬프트 구획 분리만** 사용하는 독립판도 있습니다.

- [**`|` 분리 전용 패치 — 설치 안내 바로가기**](standalone/README.md)
- [**전용 패치 코드 파일 확인**](standalone/gacha-cg-pipe-runtime.cjs)

독립판은 **통합 v1.2와 동시에 설치하지 마세요.** 이미지 참조 기능은 사용하지 않습니다.

## 2. 설치 — 공통 준비 (처음 한 번)

SSH로 마리나라 서버에 접속해 **설치·버전 전환 도구만** 먼저 내려받아 주세요. **버전 파일은 다음 3번에서 원하는 것 하나만 받습니다.** 기존 한국어·가속 패치와는 별도로 관리됩니다.

```bash
cd /root
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-patchctl.py -o gacha-cg-patchctl.py
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-versionctl.py -o gacha-cg-versionctl.py
```

설치 여부를 확인해 주세요.

```bash
python3 /root/gacha-cg-versionctl.py status
```

- **`CG configured: False`** → 새 설치: 아래 **3번**에서 원하는 버전을 **하나만** 선택하세요.
- **`CG configured: True`** → 이미 설치됨: **4번 버전 변경**으로 진행하세요. `install`을 재실행하지 마세요.

## 3. 처음 설치하는 경우 — 버전별 명령어

**아래 세 가지 중 하나만 실행해 주세요.** 어느 버전을 선택하든 마지막 **‘공통 적용’** 명령어까지 실행해야 합니다.

### v1 설치 — 기본 캐릭터 우대

첫 등장·첫 대면·의미 있는 상호작용의 CG 선정을 개선합니다.

```bash
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1/gacha-cg-runtime.cjs -o /root/gacha-cg-v1.cjs
python3 /root/gacha-cg-versionctl.py install v1
```

### v1.1 설치 — 주인공 동반 CG 강화

v1 기능에 더해, **실제 장면에 존재하는 주인공**이 다른 인물과 함께 묘사되도록 강조합니다. 없는 행동·동의·접촉을 만들어 내지는 않습니다.

**먼저 [페르소나 외형이 채워졌는지 확인하세요](docs/persona-appearance.md).**

```bash
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1.1/gacha-cg-runtime.cjs -o /root/gacha-cg-v1.1.cjs
python3 /root/gacha-cg-versionctl.py install v1.1
```

### v1.2 설치 — 주인공 동반 + `|` 외형 분리

v1.1 기능에 더해 **스토리 CG 프롬프트를 인물별로 분리**합니다.

```text
배경, 분위기, 공통 구도 | 캐릭터 1 외형·복장·동작 | 캐릭터 2 외형·복장·동작
```

주인공 유닛 외형이 비면 런의 `protagonist.appearance`를 **이미지 생성 시에만** 대신 사용합니다. 저장 데이터를 직접 고치지는 않습니다.

**먼저 [페르소나 외형이 채워졌는지 확인하세요](docs/persona-appearance.md).**

```bash
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1.2/gacha-cg-runtime.cjs -o /root/gacha-cg-v1.2.cjs
python3 /root/gacha-cg-versionctl.py install v1.2
```

### 공통 적용 — 위에서 선택한 버전 설치 후 실행

```bash
cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

파일 마운트가 이전 버전을 가리키지 않도록 **`--force-recreate`**로 컨테이너를 재생성합니다. 진행 중인 생성 작업이 있다면 완료된 후 실행해야 합니다. 데이터 볼륨을 삭제하는 명령은 아닙니다.

## 4. 이미 설치한 경우 — 다른 버전으로 전환

**2번의 관리 도구를 최신 상태로 내려받은 뒤**, 아래에서 변경하려는 버전 **하나만 다운로드하고 전환**하세요. 기존 패치를 제거할 필요는 없습니다.

### v1로 변경

```bash
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1/gacha-cg-runtime.cjs -o /root/gacha-cg-v1.cjs
python3 /root/gacha-cg-versionctl.py switch v1
```

### v1.1로 변경

```bash
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1.1/gacha-cg-runtime.cjs -o /root/gacha-cg-v1.1.cjs
python3 /root/gacha-cg-versionctl.py switch v1.1
```

### v1.2로 변경

```bash
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/versions/v1.2/gacha-cg-runtime.cjs -o /root/gacha-cg-v1.2.cjs
python3 /root/gacha-cg-versionctl.py switch v1.2
```

이어서 **3번의 공통 적용 명령어**를 실행해 컨테이너를 재생성하세요. 버전 전환 시 다른 한국어·가속 패치를 제거하지 않습니다.

## 5. 설치 확인

```bash
python3 /root/gacha-cg-versionctl.py status
docker logs --since 10m marinara-engine-marinara-1 2>&1 | grep 'gacha-cg' | tail -20
```

상태에 `CG configured: True`, `active runtime: v1` (또는 `v1.1`, `v1.2`)가 나타나는지 확인해 주세요.

| 버전 | 실제 코드 적용 로그의 핵심 문구 |
| --- | --- |
| v1 | `CG character-focused selection policy applied in memory` |
| v1.1 | `CG character-focused selection policy v1.1 applied in memory` |
| v1.2 | `CG character-focused selection and pipe-separated CG prompt v1.2 applied in memory` |

`hook registered`는 로더 등록 상태일 뿐, 실제 교체 성공을 뜻하지 않습니다. 적용 결과는 **새롭게 생성되는 스토리 CG**에서 확인해 주세요. 과거 그림을 자동 수정하지 않습니다.

## 6. 완전히 제거하기

```bash
python3 /root/gacha-cg-patchctl.py restore
cd /root/Marinara-Engine
docker compose up -d --force-recreate --no-deps marinara
```

설치 당시 Compose 설정을 복구하는 방식입니다. **설치 후 Compose를 직접 수정했다면** 안전을 위해 자동 복원이 중단될 수 있습니다. 이때는 다른 패치를 덮어쓰지 않도록 설정을 먼저 확인해 주세요.

## 7. 문제 해결 및 관련 파일

| 필요한 안내 | 바로가기 |
| --- | --- |
| **Image Appearance Override만 채운 경우 / 외형란 확인** | [페르소나 외형 복구 안내](docs/persona-appearance.md) |
| **Run ID가 무엇이고 어떻게 찾는지** | [Run ID 설명과 조회 명령어](docs/persona-appearance.md#run-id가-뭔가요-어디서-확인하나요) |
| **기존 런 외형 동기화 (2단계)** | [원본 페르소나 → 게임 런](docs/persona-appearance.md#2단계--원본-페르소나-외형을-기존-게임-런에-복사하기) |
| **주인공 유닛 외형 동기화 (3단계)** | [게임 런 → 주인공 유닛](docs/persona-appearance.md#3단계--기존-주인공-유닛에도-외형-반영하기) |
| **인물별 프롬프트 분리 기능만 사용** | [단독판 설치 안내](standalone/README.md) |

각 버전 소스: [v1](versions/v1/gacha-cg-runtime.cjs) · [v1.1](versions/v1.1/gacha-cg-runtime.cjs) · [v1.2](versions/v1.2/gacha-cg-runtime.cjs)

**유의사항:** 기존 CG 빈도 제한 및 사용자 화풍 지침은 유지합니다. 이미지 생성 비용은 기존 이미지 모델 설정에 따라 발생할 수 있습니다. 서버 비밀번호·관리자 키·API 키와 사용자 게임 데이터를 공개 저장소에 올리지 마세요.

본 프로젝트는 [Marinara Agents](https://github.com/Pasta-Devs/Marinara-Agents)의 비공식 패치입니다.

### 캐릭터 원본 설정과 실제 게임 유닛의 불일치

CG 패치는 로어북 설정을 자동으로 기존 게임 유닛에 동기화하지 않습니다. 가령 논바이너리·출생 시 지정 성별 여성 캐릭터가 유닛 이미지 태그에 `1man`으로 저장된 경우, 이 태그를 먼저 해당 게임의 유닛 데이터에서 안전하게 수정해야 합니다. 특정 NPC 이름과 설정을 공용 패치에 하드코딩하지 않습니다. 기존 CG는 자동으로 바뀌지 않습니다.

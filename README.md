# Gacha Forge CG 조건 패치 — v1 / v1.1

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

**v1.1을 추천**하지만, 기존 v1도 계속 선택하실 수 있습니다. v1.1은 페르소나가 **실제 장면에 참여하거나 화면에 존재할 때** CG에서 누락되지 않도록 모델에 더 명확히 지시합니다. 페르소나를 모든 그림에 강제로 등장시키지는 않습니다.

이 패치는 CG를 *선정하는 스토리 생성 프롬프트*를 변경합니다. 이미지 생성기나 캐릭터 시트 연결 코드를 수정하는 것은 아닙니다. 따라서 CG 포함을 보장하지 않으며, 이미 생성된 스토리·CG에는 소급 적용되지 않습니다.

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
docker compose up -d --no-deps marinara
```

## 3. 기존 v1 사용자 — v1.1로 업그레이드

**기존 CG 패치 v1을 설치한 상태라면 제거하거나 재설치할 필요가 없습니다.**

공통 준비의 파일을 다운로드한 뒤 다음 명령어를 실행해 주세요.

```bash
python3 /root/gacha-cg-versionctl.py status
python3 /root/gacha-cg-versionctl.py switch v1.1

cd /root/Marinara-Engine
docker compose up -d --no-deps marinara
```

설치 스크립트는 이미 적용된 Compose 마운트 및 `NODE_OPTIONS`를 유지하고 **CG 런타임 파일만 교체**합니다. 한국어 패치 설정과 CG 패치의 기존 복구용 백업은 변경하지 않습니다.

현재 런타임이 공식 배포한 v1/v1.1 파일과 다른 것으로 판별되면 덮어쓰기를 중단합니다.

## 4. v1.1에서 v1으로 되돌리기

v1.1을 사용해 보신 뒤 기존 CG 선정 방식을 선호하신다면 아래 명령어를 실행해 주세요.

```bash
python3 /root/gacha-cg-versionctl.py switch v1

cd /root/Marinara-Engine
docker compose up -d --no-deps marinara
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
docker compose up -d --no-deps marinara
```

복원은 CG 패치 설치 직전 Compose 상태를 되살립니다. v1을 설치한 후 v1.1로 전환했더라도 복원 대상은 **최초 CG 패치 설치 직전 설정**입니다. 설치 이후 Compose 설정을 수동 변경하셨다면 자동 복구가 안전하게 중단될 수 있습니다.

## 지원 파일

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

# Gacha Forge 캐릭터 우대형 CG 조건 패치 v1

가챠 포지 **1.8.12**에서 CG를 선정할 때 **주요 인물 첫 등장, 첫 대면, 인물 간 상호작용과 시각적으로 인상적인 캐릭터 장면**을 더 적극적으로 고려하도록 하는 비공식 테스트 패치입니다.

**한국어 배경·스탠딩 패치와 별개로 설치하고 제거하실 수 있습니다.** 기존 CG 생성 빈도 상한, CG 데이터 구조 및 사용자가 설정한 이미지 화풍 지침은 수정하지 않습니다. CG가 매 장면 생성되거나 일정 개수 이상 생성되는 것을 보장하지 않습니다.

> 실제 서버에서 CG가 성공적으로 생성되는지 추가 검증이 필요한 테스트 버전입니다. 기존 생성 스토리에는 소급 적용되지 않습니다.

## 적용 대상

- Marinara Engine 2.5.0 / Gacha Forge **1.8.12**
- Node.js 22 이상
- Docker Compose 서비스 이름: `marinara`
- 기본 엔진 설치 경로: `/root/Marinara-Engine`

해당 버전의 서버 런타임 스냅샷에만 적용합니다. 원본 CG 선정 문구가 예상한 형태와 일치하지 않으면 변경을 건너뛰도록 구성했습니다.

## 1. SSH에서 GitHub 패치 파일 다운로드

SSH로 서버에 접속한 후 아래 명령어를 순서대로 복사해 실행해 주세요. **PC에서 ZIP을 다운로드하거나 SCP로 업로드하지 않아도 됩니다.**

```bash
cd /root

curl -fL \
  https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-runtime.cjs \
  -o gacha-cg-runtime.cjs

curl -fL \
  https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/gacha-cg-patchctl.py \
  -o gacha-cg-patchctl.py
```

## 2. 설치 전 상태 확인

```bash
python3 /root/gacha-cg-patchctl.py status
python3 /root/gacha-cg-patchctl.py check
```

최초 설치 상태라면 다음과 유사하게 출력됩니다.

```text
CG patch configured: False backup exists: False
CHECK OK: independent CG patch can be configured; Korean patch settings preserved
```

`CHECK OK`가 출력될 때만 설치를 진행해 주세요. 설정 형식이 예상과 다르면 자동 설치를 중단합니다.

## 3. CG 패치 설치

```bash
python3 /root/gacha-cg-patchctl.py install
```

정상적으로 설치되면 `CG PATCH INSTALLED` 메시지가 출력됩니다. 기존 한국어 패치 및 다른 `NODE_OPTIONS` 설정은 최대한 그대로 보존합니다. 가속 패치는 필수 조건이 아닙니다.

## 4. 마리나라 컨테이너 재시작

3단계가 성공한 경우에만 실행해 주세요.

```bash
cd /root/Marinara-Engine
docker compose up -d --no-deps marinara
```

## 5. 패치 적용 확인

```bash
python3 /root/gacha-cg-patchctl.py status

docker logs --since 10m marinara-engine-marinara-1 2>&1 \
  | grep 'gacha-cg' | tail -20
```

`CG patch configured: True`와 `hook registered`는 설정과 로더 등록 여부를 의미합니다. 실제 CG 지침 교체 성공은 **`CG character-focused selection policy applied in memory`** 메시지로 확인해 주세요.

새로운 스토리 장면을 생성해 보시고, 캐릭터가 포함된 인상적인 장면에서 CG가 선정되는지 확인해 주세요. CG가 생성되지 않더라도 반드시 오류라는 의미는 아니며, AI 판단과 기존 빈도 설정에 따라 달라집니다.

## 6. CG 패치만 제거하고 이전 설정으로 복원

```bash
python3 /root/gacha-cg-patchctl.py restore

cd /root/Marinara-Engine
docker compose up -d --no-deps marinara
```

CG 패치 설치 직전의 Compose 설정을 복원합니다. 설치 전에 한국어 패치가 적용되어 있었다면 해당 설정도 그대로 복원됩니다. 설치 후 Compose 파일을 수동으로 수정하셨다면 안전을 위해 자동 복원이 중단될 수 있습니다.

## 어떤 기준이 달라지나요?

**CG 후보로 더 적극적으로 고려하는 장면**

- 중요한 캐릭터의 첫 등장 및 첫 대면
- 인물 사이의 인상적인 감정 표현이나 긴장, 대치
- 두 명 이상 캐릭터가 한 화면에서 의미 있는 행동을 보여주는 장면
- 캐릭터와 공간이 어우러지는 시각적으로 매력적인 장면
- 중요한 발견, 반전, 관계 변화, 사건의 전환점

**여전히 CG를 아끼는 장면**

- 단순한 이동 또는 정보 설명
- 의미 없는 짧은 대화나 반복 구도
- 특별한 시각적 가치가 없는 우연한 등장

이미지 생성을 위해 실제 이야기에 없는 접촉, 감정, 로맨스, 행동을 추가하도록 지시하지 않습니다.

## 변경하지 않는 부분

- 기존 CG 빈도 설정 및 허용 횟수 계산
- `cg.from`, `cg.to`, `cg.title`, `cg.prompt`, `cg.characters`, `cg.reason` 구조
- 이미지 모델 연결, 캐릭터 시트, 갤러리 저장
- 사용자 지정 화풍·세계관 지침
- 한국어 배경·스탠딩 패치
- 기존 저장된 스토리

## 주의사항

이 패치는 가챠 포지 공식 제작진과 무관한 비공식 패치입니다. 업데이트 후에는 호환성을 다시 확인해 주세요. 공개 저장소에는 서버 주소, 비밀번호, API 키, `.env` 파일 및 개인 게임 데이터를 올리지 마세요.

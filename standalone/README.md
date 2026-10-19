# CG 인물별 프롬프트 분리 — 단독 사용판

가챠 포지 **1.8.12**의 **스토리 CG 이미지 생성 프롬프트**만 변경하는 비공식 패치입니다. 기존 CG 선정 기준과 페르소나 데이터, 스토리·진행도는 수정하지 않습니다.

기존 이미지 생성 프롬프트에서 캐릭터별 외형 태그가 서로 합쳐지는 부분을 `배경·분위기 | 인물 1 외형·동작 | 인물 2 외형·동작` 형태로 분리합니다. 원래 일러스트 에이전트에서 사용하던 `|` 구분 관례를 적용하는 것이며, 이미지 모델의 완벽한 인물 구별을 보장하지는 않습니다.

**기능 범위**

- 스토리 CG (`framing: scene`)만 변경합니다. 일반 배너/캐릭터 초상화는 변경하지 않습니다.
- CG 선정 빈도, 주인공 우대 정책은 변경하지 않습니다.
- 주인공 유닛의 외형이 비어 있어도 자동으로 채우지 않습니다. 이 기능은 통합 **v1.2**에서 제공됩니다.
- 이미지 참조 파일이나 캐릭터 시트 이미지는 전송하지 않습니다.
- 이미 생성된 CG에는 소급 적용되지 않습니다.

## 설치 전 확인

Docker Compose, Node.js 22 이상, Gacha Forge 1.8.12 기준입니다. **통합 CG 패치 v1.2와 함께 설치하지 마세요.** 동일한 이미지 프롬프트 함수를 수정하므로 충돌하거나 중복 적용될 수 있습니다. 한국어 패치와는 별개입니다.

SSH에서 파일을 내려받아 사용하실 수 있습니다.

```bash
cd /root/Marinara-Engine
curl -fL https://raw.githubusercontent.com/tlsiddl/gacha-forge-cg-patch/main/standalone/gacha-cg-pipe-runtime.cjs -o gacha-cg-pipe-runtime.cjs
```

Compose 서비스 `marinara`의 파일 마운트에 다음을 추가하고:

```yaml
volumes:
  - ./gacha-cg-pipe-runtime.cjs:/app/gacha-cg-pipe-runtime.cjs:ro
```

기존 `NODE_OPTIONS` 값 **뒤에** 다음 옵션을 추가해 주세요. 기존 `NODE_OPTIONS` 값은 삭제하지 마세요.

```text
--require=/app/gacha-cg-pipe-runtime.cjs
```

다른 설정이나 기존 런타임이 설치된 경우 Compose의 `volumes`, `environment`를 덮어쓰지 않고 병합해야 합니다. 설정을 확인하신 후 **진행 중인 AI 생성 작업이 없는 때에** 실행해 주세요.

```bash
cd /root/Marinara-Engine
docker compose config >/dev/null && docker compose up -d --force-recreate --no-deps marinara
docker logs --since 10m marinara-engine-marinara-1 2>&1 | grep gacha-cg-pipe
```

`[gacha-cg-pipe] pipe-separated story CG prompt enabled` 로그가 출력되어야 실제 변경이 적용된 것입니다. 적용 로그가 없거나 시그니처 불일치가 발생하면 파일을 복구하고 가챠 포지 버전을 확인해 주세요.

## 제거

Compose에 직접 추가했던 **이 파일의 마운트와 NODE_OPTIONS 옵션만** 제거한 후 컨테이너를 재생성해 주세요. 한국어 패치나 다른 `--require` 항목은 유지하셔야 합니다.

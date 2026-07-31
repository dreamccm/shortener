# 사용 가이드

컴퓨터를 잘 몰라도 따라 할 수 있게 썼습니다. 위에서부터 순서대로 보셔도 되고,
필요한 항목만 찾아 보셔도 됩니다.

## 목차

1. [이게 뭔가요?](#1-이게-뭔가요)
2. [가장 쉬운 방법: 웹에서 링크 추가하기](#2-가장-쉬운-방법-웹에서-링크-추가하기)
3. [명령어로 링크 추가하기](#3-명령어로-링크-추가하기)
4. [클릭 수 보기](#4-클릭-수-보기)
5. [링크 수정하기 / 지우기](#5-링크-수정하기--지우기)
6. [짧은 이름 짓는 규칙](#6-짧은-이름-짓는-규칙)
7. [뭔가 안 될 때](#7-뭔가-안-될-때)
8. [토큰 관리](#8-토큰-관리)
9. [알아둘 한도](#9-알아둘-한도)
10. [용어 사전](#10-용어-사전)

---

## 1. 이게 뭔가요?

긴 인터넷 주소를 짧게 줄여 주는 나만의 서비스입니다.

예를 들어 이런 긴 주소가 있다고 합시다.

```
https://github.com/dreamccm/shortener/blob/main/docs/GUIDE.md
```

이걸 이렇게 짧게 만들 수 있습니다.

```
https://shortener.dream-ccm.workers.dev/guide
```

짧은 주소를 누른 사람은 **자동으로** 원래의 긴 주소로 넘어갑니다. 중간에 뭐가
보이거나 기다릴 필요 없이 곧바로 이동합니다.

**내 주소는 이것입니다:**

```
https://shortener.dream-ccm.workers.dev
```

이 주소 뒤에 `/`와 짧은 이름을 붙이면 됩니다. 위 예시의 `guide`처럼요.
이 짧은 이름을 **슬러그**라고 부릅니다. 이 문서에서 계속 나오는 말이니 기억해 두세요.

지금 등록된 링크가 실제로 동작하는지 보고 싶으면, 브라우저 주소창에 이걸 넣어 보세요.

```
https://shortener.dream-ccm.workers.dev/gh
```

GitHub 저장소로 넘어가면 잘 돌아가고 있는 것입니다.

---

## 2. 가장 쉬운 방법: 웹에서 링크 추가하기

프로그램 설치도, 명령어도 필요 없습니다. 브라우저만 있으면 됩니다.
**대부분의 경우 이 방법이면 충분합니다.**

### 순서

**① 링크 목록 파일을 엽니다**

아래 주소를 클릭하세요.

https://github.com/dreamccm/shortener/blob/main/links.json

**② 편집 모드로 들어갑니다**

파일 내용 오른쪽 위에 있는 **연필 모양 아이콘**을 누릅니다.
(마우스를 올리면 "Edit this file"이라는 설명이 뜹니다.)

**③ 링크를 추가합니다**

지금은 이렇게 생겼을 것입니다.

```json
{
  "gh": "https://github.com/dreamccm/shortener"
}
```

여기에 한 줄을 추가합니다. **중요한 건 두 가지입니다.**

- 앞줄 끝에 **쉼표(`,`)를 찍어야 합니다**
- 마지막 줄 끝에는 **쉼표를 찍으면 안 됩니다**

블로그를 `blog`라는 이름으로 추가한다면 이렇게 됩니다.

```json
{
  "gh": "https://github.com/dreamccm/shortener",
  "blog": "https://내블로그.com"
}
```

세 개, 네 개도 같은 방식으로 늘리면 됩니다.

```json
{
  "gh": "https://github.com/dreamccm/shortener",
  "blog": "https://내블로그.com",
  "insta": "https://instagram.com/내계정",
  "cv": "https://drive.google.com/아주긴주소"
}
```

**④ 저장합니다**

오른쪽 위 초록색 **Commit changes...** 버튼 → 다시 **Commit changes** 버튼.
설명을 적는 칸이 나오는데 비워 두셔도 됩니다.

**⑤ 1분쯤 기다립니다**

저장하면 자동으로 반영 작업이 시작됩니다. 보통 30초~1분 걸립니다.
잘 됐는지 보고 싶으면 https://github.com/dreamccm/shortener/actions 에서
맨 위 항목에 **초록색 체크(✓)** 가 떴는지 확인하세요.
노란색 점이면 아직 진행 중이니 조금 더 기다리시면 됩니다.

**⑥ 확인합니다**

브라우저에 `https://shortener.dream-ccm.workers.dev/blog`를 넣어 보세요.
블로그로 넘어가면 성공입니다.

### 흔한 실수

**쉼표를 빠뜨렸을 때** — GitHub 편집 화면에서 빨간 표시가 뜨거나, 저장은 되는데
반영이 안 됩니다. Actions에서 빨간 X가 보이면 대부분 이 문제입니다.
다시 열어서 쉼표를 확인하세요.

**따옴표를 빠뜨렸을 때** — 이름과 주소 **양쪽 모두** 큰따옴표(`"`)로 감싸야 합니다.
작은따옴표(`'`)는 안 됩니다.

```json
"blog": "https://내블로그.com"      ← 맞음
blog: https://내블로그.com          ← 틀림
'blog': 'https://내블로그.com'      ← 틀림
```

**주소에 `https://`를 안 붙였을 때** — `내블로그.com`이 아니라
`https://내블로그.com`이라고 전부 적어야 합니다.

---

## 3. 명령어로 링크 추가하기

이 방법은 **기다림 없이 즉시 반영**되고, 짧은 이름을 자동으로 지어 줄 수도 있습니다.
잠깐 쓰고 말 링크에 편합니다.

대신 준비물이 하나 있습니다. **토큰**입니다.

### 토큰이 뭔가요?

링크를 만들거나 지울 수 있는 열쇠입니다. 아무나 내 단축 서비스에 링크를 만들지
못하게 막는 장치입니다. 앞서 설정할 때 만들어서 어딘가에 저장해 두셨을 것입니다.

> 링크를 **누르는 것**(리다이렉트)에는 토큰이 필요 없습니다. 누구나 짧은 주소를
> 열 수 있습니다. 토큰은 **만들고 지울 때**만 필요합니다.

### 준비: 토큰을 등록합니다

PowerShell을 엽니다. (시작 메뉴에서 "PowerShell" 검색 →
**관리자 권한 없이** 그냥 실행)

아래를 붙여넣되, 따옴표 안의 내용을 **실제 토큰 값**으로 바꾸세요.

```powershell
$env:TOKEN = "여기에_내_토큰_값"
```

> ⚠️ 꺾쇠괄호나 따옴표를 값에 함께 넣지 마세요. 순수한 값만 넣습니다.
> 예를 들어 토큰이 `abc123=`라면 `$env:TOKEN = "abc123="`입니다.

이 설정은 **그 PowerShell 창에서만** 유효합니다. 창을 닫았다 새로 열면 다시
넣어야 합니다. 이걸 깜빡해서 나는 오류가 제일 흔합니다.

### 이름을 직접 정해서 만들기

```powershell
curl.exe -X POST https://shortener.dream-ccm.workers.dev/api/links `
  -H "authorization: Bearer $env:TOKEN" `
  -H "content-type: application/json" `
  -d '{\"slug\": \"blog\", \"url\": \"https://내블로그.com\"}'
```

`blog`와 `https://내블로그.com` 두 군데만 바꿔 쓰시면 됩니다.

> 줄 끝의 백틱(`` ` ``)은 "다음 줄에 이어진다"는 뜻입니다. 그대로 복사하면 됩니다.
> 한 줄로 붙여 써도 똑같이 동작합니다.

성공하면 이런 응답이 나옵니다.

```json
{
  "slug": "blog",
  "shortUrl": "https://shortener.dream-ccm.workers.dev/blog",
  "url": "https://내블로그.com",
  "createdAt": "2026-07-31T22:25:25.791Z"
}
```

`shortUrl`이 바로 쓰면 되는 주소입니다.

### 이름을 자동으로 받기

`slug` 부분을 빼면 알아서 7글자짜리 이름을 지어 줍니다.

```powershell
curl.exe -X POST https://shortener.dream-ccm.workers.dev/api/links `
  -H "authorization: Bearer $env:TOKEN" `
  -H "content-type: application/json" `
  -d '{\"url\": \"https://아주긴주소.com/a/b/c\"}'
```

```json
{
  "slug": "AOqHoSK",
  "shortUrl": "https://shortener.dream-ccm.workers.dev/AOqHoSK",
  ...
}
```

### 두 방법의 차이

| | 웹에서 편집 (2번) | 명령어 (3번) |
| --- | --- | --- |
| 준비물 | 브라우저만 | PowerShell + 토큰 |
| 반영 속도 | 30초~1분 | 즉시 |
| 기록 | git에 남음 | 남지 않음 |
| 이름 자동 생성 | ✗ | ✓ |
| 추천 용도 | 오래 쓸 링크 | 임시 링크 |

둘은 같은 곳에 저장되고 똑같이 동작합니다. 섞어 쓰셔도 아무 문제 없습니다.

---

## 4. 클릭 수 보기

몇 명이나 눌렀는지 볼 수 있습니다. 토큰이 필요합니다.

```powershell
curl.exe https://shortener.dream-ccm.workers.dev/api/links/blog -H "authorization: Bearer $env:TOKEN"
```

`blog` 자리에 확인하고 싶은 이름을 넣으세요.

```json
{
  "slug": "blog",
  "clicks": 42,
  "url": "https://내블로그.com",
  "createdAt": "2026-07-31T22:25:25.791Z"
}
```

`clicks`가 눌린 횟수입니다.

> 여러 명이 동시에 누르면 몇 건이 빠질 수 있습니다. 정확한 숫자가 아니라
> "대충 이 정도 인기구나" 정도로 보시면 됩니다.

---

## 5. 링크 수정하기 / 지우기

### 수정하기 (연결될 주소 바꾸기)

**`links.json`에 적어 둔 링크라면** — 2번 방법으로 파일을 다시 열어서 주소만
고치고 저장하면 됩니다. 가장 간단합니다.

**명령어로 만든 링크라면** — 같은 이름으로 다시 만들 수는 없습니다
(`slug already exists` 오류가 납니다). **먼저 지우고 다시 만드세요.**

### 지우기

```powershell
curl.exe -X DELETE https://shortener.dream-ccm.workers.dev/api/links/blog -H "authorization: Bearer $env:TOKEN"
```

성공하면 아무 내용도 안 나옵니다. 조용하면 잘 된 것입니다.

> ⚠️ **`links.json`에 적혀 있는 링크를 지웠다면, 그 파일에서도 지워야 합니다.**
> 안 그러면 다음 배포 때 되살아납니다. 2번 방법으로 파일을 열어서 해당 줄을
> 삭제하세요. 이때도 쉼표 규칙을 지켜야 합니다.

---

## 6. 짧은 이름 짓는 규칙

- **쓸 수 있는 문자**: 영문 대소문자, 숫자, 하이픈(`-`), 밑줄(`_`)
- **길이**: 1~64글자
- **한글, 공백, 슬래시(`/`)는 안 됩니다**
- **대소문자를 구분합니다** — `Blog`와 `blog`는 서로 다른 링크입니다.
  헷갈리기 쉬우니 **소문자만 쓰시는 걸 권합니다**
- **쓸 수 없는 이름**: `api`, `favicon.ico`, `robots.txt`, `_health`
  (서비스가 내부적으로 쓰는 이름들입니다)
- **연결할 주소**는 반드시 `http://` 또는 `https://`로 시작해야 합니다

좋은 예: `blog`, `cv`, `insta`, `2026-summer`, `event_01`

---

## 7. 뭔가 안 될 때

### 응답 한눈에 보기

| 화면에 나온 것 | 뜻 | 어떻게 할까요 |
| --- | --- | --- |
| 원하는 사이트로 이동 | 정상 | — |
| `not found` | 그런 링크가 없음 | 이름 철자와 **대소문자** 확인 |
| `{"error": "unauthorized"}` | 토큰 문제 | 바로 아래 참고 |
| `{"error": "slug already exists"}` | 그 이름은 이미 씀 | 다른 이름을 쓰거나 기존 것을 삭제 |
| `{"error": "url must be a valid http(s) URL"}` | 주소 형식이 틀림 | `https://`로 시작하는지 확인 |
| `{"error": "slug is reserved or malformed"}` | 못 쓰는 이름 | [6번](#6-짧은-이름-짓는-규칙) 규칙 확인 |

### `unauthorized`가 뜬다면

원인은 거의 셋 중 하나입니다.

1. **PowerShell 창을 새로 열었다** → `$env:TOKEN`이 비었습니다. 다시 넣으세요.
   확인하려면 `$env:TOKEN`을 입력해 보세요. 아무것도 안 나오면 비어 있는 것입니다.
2. **토큰을 괄호까지 복사했다** → `<abc123=>`이 아니라 `abc123=`만 넣어야 합니다.
3. **토큰을 바꾼 뒤 옛날 값을 쓰고 있다** → 새 값으로 다시 넣으세요.

### 링크를 추가했는데 `not found`가 뜬다면

**명령어로 만들었다면** 즉시 반영되므로, 이름 철자나 대소문자를 다시 보세요.

**`links.json`에 적었다면** 배포가 아직 안 끝났거나 실패한 것입니다.

https://github.com/dreamccm/shortener/actions 를 여세요.

- **노란색 점** — 진행 중입니다. 1분쯤 기다리세요.
- **초록색 체크** — 정상 반영됐습니다. 이름 철자를 다시 확인하세요.
- **빨간색 X** — 실패했습니다. 클릭해서 들어가면 빨간 부분에 이유가 나옵니다.
  대부분 `links.json`의 쉼표나 따옴표 문제입니다.

### 서비스 자체가 살아 있는지 확인

브라우저에서 이걸 열어 보세요.

```
https://shortener.dream-ccm.workers.dev
```

`URL shortener. See ...`라는 짧은 글이 보이면 서비스는 정상입니다.
아무것도 안 뜨면 배포에 문제가 있는 것입니다.

### 직접 다시 배포하고 싶다면

```powershell
cd $HOME\dev\shortener
git pull origin main
npx wrangler deploy
npm run sync
```

`Synced 1 link(s) from links.json.` 같은 메시지가 나오면 성공입니다.

### 등록된 링크 전체 목록 보기

```powershell
cd $HOME\dev\shortener
npx wrangler kv key list --binding LINKS --remote
```

`link:blog` 같은 항목들이 쭉 나옵니다. `clicks:blog`는 클릭 수 저장용이니
신경 쓰지 않으셔도 됩니다.

### `curl` 관련 주의

PowerShell에서 `curl`이라고만 치면 **전혀 다른 명령**이 실행돼서 이상하게 동작합니다.
이 문서의 명령어처럼 반드시 **`curl.exe`** 라고 `.exe`까지 붙여 쓰세요.

---

## 8. 토큰 관리

### 언제 바꿔야 하나요?

- 화면 공유나 스크린샷에 값이 노출됐을 때
- 남에게 알려줬을 때
- 어디에 적어 뒀는지 잃어버렸을 때

노출됐다면 미루지 말고 바로 바꾸세요. 남이 내 단축 서비스에 아무 링크나 만들어
넣을 수 있게 됩니다.

### 바꾸는 방법

PowerShell에서 순서대로 실행합니다.

```powershell
cd $HOME\dev\shortener
$b = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b) | Set-Clipboard
npx wrangler secret put ADMIN_TOKEN
```

마지막 줄을 실행하면 값을 입력하라고 나옵니다. **Ctrl+V로 붙여넣고 Enter**를
누르세요. (방금 만든 값이 클립보드에 들어가 있습니다. 화면에는 일부러 표시하지
않습니다 — 스크린샷에 찍히는 사고를 막기 위해서입니다.)

`✨ Success! Uploaded secret ADMIN_TOKEN`이 나오면 완료입니다.

### 잊지 말 것

**새 값을 비밀번호 관리자 등에 꼭 저장하세요.** 등록하고 나면 다시 볼 수 없습니다.
잃어버려도 위 방법으로 새로 만들면 되니 큰일은 아니지만, 매번 바꾸기는 번거롭습니다.

바꾼 뒤에는 기존에 쓰던 `$env:TOKEN`도 새 값으로 다시 넣어야 합니다.

---

## 9. 알아둘 한도

전부 무료 범위 안에서 돌아갑니다. 카드 등록도, 월 요금도 없습니다.

실질적인 상한은 **하루 약 1,000번의 클릭**입니다. 개인이나 소규모 팀이 쓰기엔
넉넉하지만, 링크가 갑자기 화제가 되면 넘을 수 있습니다.

의외로 리다이렉트 자체는 하루 10만 번까지 가능합니다. 1,000이라는 숫자는
**클릭 수를 세는 기능** 때문에 생기는 제한입니다. 클릭 집계를 포기하면 상한이
100배로 늘어납니다.

한도를 넘기면 그 날은 클릭 집계가 멈추고, 경우에 따라 리다이렉트도 실패할 수
있습니다. 자정(UTC 기준)에 초기화됩니다.

집계를 포기하고 상한을 늘리려면 `src/index.js`에서 아래 한 줄을 지우고 배포하면
됩니다.

```js
ctx.waitUntil(recordClick(env, slug));
```

이 작업이 필요해지면 도움을 요청하셔도 됩니다.

---

## 10. 용어 사전

| 말 | 뜻 |
| --- | --- |
| **슬러그(slug)** | 짧은 이름. `.../blog`의 `blog` 부분 |
| **리다이렉트** | 짧은 주소를 눌렀을 때 원래 주소로 자동으로 넘어가는 것 |
| **토큰(ADMIN_TOKEN)** | 링크를 만들고 지울 때 쓰는 열쇠. 누를 때는 필요 없음 |
| **배포(deploy)** | 바뀐 내용을 실제 서비스에 반영하는 것 |
| **KV** | 링크 목록이 저장되는 곳. Cloudflare가 관리 |
| **Actions** | GitHub이 자동으로 배포를 실행해 주는 기능 |
| **`links.json`** | git으로 관리하는 링크 목록 파일 |
| **커밋(commit)** | GitHub에서 변경 내용을 저장하는 것 |

---

## 자주 쓰는 것만 모아 보기

```powershell
# 토큰 등록 (창을 새로 열 때마다 한 번)
$env:TOKEN = "내_토큰_값"

# 링크 만들기
curl.exe -X POST https://shortener.dream-ccm.workers.dev/api/links -H "authorization: Bearer $env:TOKEN" -H "content-type: application/json" -d '{\"slug\": \"blog\", \"url\": \"https://내블로그.com\"}'

# 클릭 수 보기
curl.exe https://shortener.dream-ccm.workers.dev/api/links/blog -H "authorization: Bearer $env:TOKEN"

# 링크 지우기
curl.exe -X DELETE https://shortener.dream-ccm.workers.dev/api/links/blog -H "authorization: Bearer $env:TOKEN"
```

링크 목록 파일: https://github.com/dreamccm/shortener/blob/main/links.json
배포 상태 확인: https://github.com/dreamccm/shortener/actions

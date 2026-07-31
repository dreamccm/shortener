# 사용 가이드

내 단축 주소: **https://shortener.dream-ccm.workers.dev**

`https://shortener.dream-ccm.workers.dev/gh` 처럼 뒤에 짧은 이름(슬러그)을 붙이면
등록해 둔 긴 주소로 넘어갑니다.

---

## 1. 링크 추가하기

두 가지 방법이 있습니다. 둘 다 똑같이 동작하니 상황에 맞게 고르면 됩니다.

### 방법 A — GitHub에서 편집 (기록이 남는 방식)

오래 쓸 링크에 적합합니다. 언제 누가 무엇을 추가했는지 git 기록에 남습니다.

1. https://github.com/dreamccm/shortener/blob/main/links.json 접속
2. 연필 아이콘(Edit) 클릭
3. 항목 추가 — **줄 끝 쉼표를 빠뜨리지 않도록 주의**

   ```json
   {
     "gh": "https://github.com/dreamccm/shortener",
     "blog": "https://내블로그.com"
   }
   ```

4. **Commit changes** 클릭

약 1분 뒤 자동으로 반영됩니다. `https://shortener.dream-ccm.workers.dev/blog` 로 확인하세요.

로컬에서 작업한다면:

```powershell
cd $HOME\dev\shortener
git pull origin main
notepad links.json          # 편집 후 저장
git add links.json
git commit -m "Add blog link"
git push origin main
```

### 방법 B — 명령어로 즉시 생성

바로 반영되며, 짧은 이름을 자동으로 만들어 줍니다. 임시 링크에 편합니다.

먼저 토큰을 이번 세션에 등록합니다 (PowerShell 창을 새로 열 때마다 한 번):

```powershell
$env:TOKEN = "여기에_ADMIN_TOKEN"
```

이름을 직접 정하려면:

```powershell
curl.exe -X POST https://shortener.dream-ccm.workers.dev/api/links `
  -H "authorization: Bearer $env:TOKEN" `
  -H "content-type: application/json" `
  -d '{\"slug\": \"blog\", \"url\": \"https://내블로그.com\"}'
```

이름을 자동으로 받으려면 `slug`를 빼면 됩니다:

```powershell
curl.exe -X POST https://shortener.dream-ccm.workers.dev/api/links `
  -H "authorization: Bearer $env:TOKEN" `
  -H "content-type: application/json" `
  -d '{\"url\": \"https://아주긴주소.com/a/b/c\"}'
```

응답의 `shortUrl`이 바로 쓸 수 있는 주소입니다.

```json
{
  "slug": "AOqHoSK",
  "shortUrl": "https://shortener.dream-ccm.workers.dev/AOqHoSK",
  "url": "https://아주긴주소.com/a/b/c",
  "createdAt": "2026-07-31T22:25:25.791Z"
}
```

---

## 2. 클릭 수 확인하기

```powershell
curl.exe https://shortener.dream-ccm.workers.dev/api/links/blog -H "authorization: Bearer $env:TOKEN"
```

```json
{ "slug": "blog", "clicks": 42, "url": "https://내블로그.com" }
```

동시에 여러 명이 누르면 몇 건이 누락될 수 있습니다. 정확한 집계가 아니라 대략적인
추세로 보세요.

---

## 3. 링크 삭제하기

```powershell
curl.exe -X DELETE https://shortener.dream-ccm.workers.dev/api/links/blog -H "authorization: Bearer $env:TOKEN"
```

`links.json`에 적어 둔 링크라면 **그 파일에서도 지워야 합니다.** 안 그러면 다음 배포
때 되살아납니다.

---

## 4. 짧은 이름 규칙

- 쓸 수 있는 문자: 영문, 숫자, `-`, `_` (1~64자)
- 대소문자를 구분합니다 — `Blog`와 `blog`는 다른 링크입니다
- 쓸 수 없는 이름: `api`, `favicon.ico`, `robots.txt`, `_health`
- 이미 있는 이름으로 만들면 거부됩니다(`409`). 덮어쓰려면 먼저 삭제하세요
- 연결할 주소는 `http://` 또는 `https://`로 시작해야 합니다

---

## 5. 자주 만나는 응답

| 결과 | 뜻 | 해결 |
| --- | --- | --- |
| `302` + `Location` | 정상 | — |
| `404 not found` | 없는 링크 | 이름 확인, 대소문자 확인 |
| `{"error": "unauthorized"}` | 토큰 문제 | 아래 참고 |
| `{"error": "slug already exists"}` | 이름 중복 | 다른 이름을 쓰거나 기존 링크 삭제 |
| `{"error": "url must be a valid http(s) URL"}` | 주소 형식 오류 | `https://`로 시작하는지 확인 |

`unauthorized`가 뜰 때 흔한 원인:

- 토큰을 `<...>` 같은 괄호와 함께 복사한 경우 — 값만 넣어야 합니다
- PowerShell 창을 새로 열어 `$env:TOKEN`이 비어 있는 경우 — 다시 지정하세요
- 토큰을 교체한 뒤 옛 값을 쓰는 경우

---

## 6. 토큰 관리

`ADMIN_TOKEN`은 링크를 만들고 지우는 열쇠입니다. 화면 공유나 스크린샷에 노출됐다면
바로 교체하세요.

```powershell
cd $HOME\dev\shortener
$b = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
[Convert]::ToBase64String($b) | Set-Clipboard   # 화면에 찍히지 않게 클립보드로
npx wrangler secret put ADMIN_TOKEN             # 붙여넣기
```

교체 즉시 이전 토큰은 무효가 됩니다. 새 값을 비밀번호 관리자에 저장해 두세요.

리다이렉트(링크를 누르는 것)에는 토큰이 필요 없습니다. 만들기/보기/지우기에만
필요합니다.

---

## 7. 알아둘 한도

무료 범위 안에서 돌아갑니다. 실질적인 상한은 **하루 약 1,000클릭**인데,
리다이렉트 자체가 아니라 클릭 집계가 KV 쓰기(하루 1,000회)를 소모하기 때문입니다.

그보다 많은 트래픽이 예상되면 `src/index.js`에서 다음 한 줄을 지우세요. 집계는
사라지지만 하루 10만 클릭까지 늘어납니다.

```js
ctx.waitUntil(recordClick(env, slug));
```

---

## 8. 문제가 생겼을 때

**링크가 404인데 `links.json`에는 있다** — 배포가 아직 안 끝났거나 실패한 경우입니다.
https://github.com/dreamccm/shortener/actions 에서 최근 실행이 초록불인지 확인하세요.
빨간불이면 클릭해서 로그를 보면 됩니다.

**수동으로 다시 배포하고 싶다**

```powershell
cd $HOME\dev\shortener
git pull origin main
npx wrangler deploy
npm run sync
```

**전체 링크 목록을 보고 싶다**

```powershell
npx wrangler kv key list --binding LINKS --remote
```

**서비스가 살아 있는지만 빠르게 보고 싶다**

```powershell
curl.exe -I https://shortener.dream-ccm.workers.dev/gh
```

`HTTP/1.1 302`와 `Location:` 줄이 보이면 정상입니다. PowerShell의 `curl`은 다른
명령이므로 반드시 `curl.exe`로 쓰세요.

# Miraju OAuth Kurulum Rehberi

Bu proje, kullanıcı giriş/kayıt işlemlerinde Manus OAuth akışını kullanır. Google ve Apple butonları da OAuth portalına provider bilgisiyle yönlendirilir; Google/Apple client secret değerleri frontend’e yazılmaz.

## 1. Gerekli environment değişkenleri

`.env.example` dosyasını `.env.local` olarak kopyalayın ve gerçek değerleri girin:

```bash
cp .env.example .env.local
```

| Değişken | Nerede kullanılır | Gerekli | Açıklama |
|---|---|---:|---|
| `VITE_APP_ID` | Frontend + server | Evet | OAuth uygulamasının Manus app ID değeri |
| `VITE_OAUTH_PORTAL_URL` | Frontend | Evet | Kullanıcıyı `/app-auth` akışına gönderen portal adresi |
| `OAUTH_SERVER_URL` | Server | Evet | Authorization code exchange ve kullanıcı bilgisi sunucusu |
| `JWT_SECRET` | Server | Evet | Session cookie imzalama secret’ı; production’da rastgele ve uzun olmalı |
| `DATABASE_URL` | Server/Drizzle | Evet | MySQL veya TiDB bağlantı URL’i |
| `OWNER_OPEN_ID` | Server | Admin için evet | Bu OAuth openId ile giriş yapan kullanıcıya `admin` rolü verilir |
| `OWNER_NAME` | Server/metadata | Önerilir | Admin kullanıcı görünen adı |
| `NODE_ENV` | Server | Önerilir | Local için `development`, yayın için `production` |
| `BUILT_IN_FORGE_API_URL` | Server | Özelliğe bağlı | Manus built-in servisleri kullanılıyorsa |
| `BUILT_IN_FORGE_API_KEY` | Server | Özelliğe bağlı | Yalnızca server tarafında tutulur |

> `VITE_` ile başlayan değerler browser bundle’ına girer. Secret, client secret, private key veya database password değerlerini `VITE_` prefix’iyle tanımlamayın.

## 2. Callback adreslerini OAuth portalına ekleyin

Local geliştirme:

```text
http://localhost:3000/api/oauth/callback
```

Sandbox preview:

```text
https://3000-i1axazri0zwryo88sxtrq-7e55986d.sg2.manus.computer/api/oauth/callback
```

Production:

```text
https://miraju.com.tr/api/oauth/callback
```

Her ortamda callback adresi, tarayıcıda açılan sitenin gerçek origin’i ile birebir aynı olmalıdır. Sonunda slash kullanmayın.

## 3. Manus OAuth uygulamasını oluşturun

1. Manus OAuth/App yönetim alanında yeni bir uygulama oluşturun.
2. Uygulama adını `Miraju Professionel` olarak girin.
3. Uygulamanın app ID değerini `VITE_APP_ID` olarak kaydedin.
4. Yukarıdaki ortamların callback URL’lerini allowlist’e ekleyin.
5. OAuth portal host adresini `VITE_OAUTH_PORTAL_URL` olarak tanımlayın.
6. Authorization code exchange sunucu adresini `OAUTH_SERVER_URL` olarak tanımlayın.
7. Uygulama domainini production’da `https://miraju.com.tr` olarak doğrulayın.

## 4. Google ve Apple provider ayarları

Google ve Apple girişleri için provider’ları OAuth portalındaki Miraju uygulamasına bağlayın. Sağlayıcı panelinde callback URL istenirse portalın dokümantasyonunda verilen provider callback adresini kullanın; uygulamanın kendi callback’i her zaman:

```text
https://miraju.com.tr/api/oauth/callback
```

Google tarafında genellikle OAuth client ID, client secret ve consent screen doğrulaması gerekir. Apple tarafında Services ID, Team ID, Key ID ve Sign in with Apple private key gerekir. Bu secret’lar yalnızca OAuth portalına veya server secret manager’a girilmeli, repository’ye yazılmamalıdır.

Uygulamadaki butonlar şu provider değerlerini gönderir:

```text
google
apple
```

## 5. Session ve güvenlik kontrol listesi

- `JWT_SECRET` en az 32 byte rastgele değer olmalı.
- `.env`, `.env.local` ve production secret dosyaları git’e eklenmemeli.
- `OAUTH_SERVER_URL` ve `VITE_OAUTH_PORTAL_URL` HTTPS olmalı.
- Production callback yalnızca `https://miraju.com.tr/api/oauth/callback` olarak allowlist edilmeli.
- OAuth state nonce cookie’si Secure + SameSite=None olarak çalışır; production mutlaka HTTPS olmalı.
- `OWNER_OPEN_ID` gerçek admin hesabının OAuth `openId` değeri olmalı.
- OAuth hesabı oluşturulduktan sonra ilk girişten sonra admin kullanıcısının `openId` değerini doğrulayın.
- `DATABASE_URL`, `JWT_SECRET`, `BUILT_IN_FORGE_API_KEY` gibi secret’ları frontend koduna veya `VITE_` değişkenlerine taşımayın.

## 6. Local çalıştırma

```bash
cp .env.example .env.local
# .env.local değerlerini doldurun
pnpm install
pnpm check
pnpm dev
```

OAuth portalında local callback adresi kayıtlı değilse kayıt/giriş tamamlanmaz.

## 7. Production kontrolü

```bash
NODE_ENV=production pnpm build
pnpm drizzle-kit migrate
pnpm start
```

Yayına almadan önce şu akışları test edin:

- Hesap oluştur
- Normal giriş
- Google ile giriş
- Apple ile giriş
- Çıkış yap
- Admin hesabı ile `/admin` aç
- Normal kullanıcı ile `/admin` erişimini reddet
- OAuth callback sonrası kullanıcı kaydının `users` tablosuna yazılması

## Mevcut projede kullanılan callback akışı

1. Frontend `VITE_OAUTH_PORTAL_URL/app-auth` adresine yönlendirir.
2. `state` içinde redirect URI ve nonce taşınır.
3. Browser’a tek kullanımlık `__Host-oauth_state` cookie’si yazılır.
4. OAuth provider `/api/oauth/callback?code=...&state=...` adresine döner.
5. Server nonce’i kontrol eder.
6. Server `OAUTH_SERVER_URL` üzerinden code exchange yapar.
7. Kullanıcı `users` tablosunda upsert edilir.
8. Session cookie oluşturulur ve kullanıcı ana sayfaya yönlendirilir.

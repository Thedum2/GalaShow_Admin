# Galashow Admin

| Vite 모드 | 관리자 주소 | API 기본값 |
| --- | --- | --- |
| development | https://admin-dev.galashow.cloud | https://api-dev.galashow.cloud |
| production | https://admin.galashow.cloud | https://api.galashow.cloud |

Node.js 24에서 실행한다.

```sh
npm ci
npm run dev
npm test
npm run build:dev
npm run build:prod
```

`npm run dev`와 `npm start`는 `development` 모드로 `http://localhost:3000`에서 실행한다. `npm run build`는 운영 빌드와 같으며 결과는 `build/`에 생성된다. `package-lock.json`을 추적하고 로컬과 CI 모두 `npm ci`로 동일한 의존성을 설치한다. 의존성을 변경할 때는 `package.json`과 lockfile을 함께 갱신한다.

`.env.development`와 `.env.production`에는 공개 API 주소만 둔다. 로컬 변경은 무시되는 `.env.development.local` 또는 `.env.production.local`의 `VITE_API_URL`로 지정한다. 실행 환경변수가 파일보다 우선하고, 값이 없거나 비어 있으면 빌드 모드의 API 기본값을 사용한다. 앞뒤 공백과 끝의 `/`는 제거한다. `VITE_*`는 공개 브라우저 번들에 포함된다. 환경 판별은 Vite의 `MODE`를 사용하며 과거의 `VITE_MODE`는 사용하지 않는다.

GitHub Actions `GalaShow Admin CI/CD`는 모든 PR과 `develop` push에서 테스트 및 개발·운영 빌드를 검증한다. `develop` push는 검증 후 개발에 자동 배포한다. 수동 실행은 선택한 Git ref와 `stage` (`dev`/`prod`)를 사용한다. 운영 배포는 수동 실행만 가능하다. 서울 리전(`ap-northeast-2`)과 환경별 배포 동시 실행 그룹을 사용한다. 기존 전체 ESLint의 Prettier 오류는 별도 정리 대상이므로 이번 CI의 필수 검사에는 포함하지 않는다.

GitHub Environment `dev`, `prod` 각각에 Variables `AWS_ACCOUNT_ID=251113431583`, `AWS_ROLE_ARN`을 설정한다. AWS 역할은 GitHub OIDC의 해당 저장소·환경 subject만 신뢰해야 한다. 워크플로는 `id-token: write`로 임시 자격증명을 발급받으며 정적 `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` Secret은 사용하지 않는다. 역할 계정·실제 AWS 계정·배포 버킷 소유자가 다르면 업로드 전에 실패한다.

Environment의 배포 ref 정책은 `develop` 브랜치와 `v*` 태그를 허용한다. 수동 실행에서도 이 ref를 선택해야 하며, 다른 브랜치 배포가 필요하면 해당 Environment 정책을 먼저 명시적으로 변경한다.

AWS 인증 후 서울 리전의 `galashow-cloud-web-dev` 또는 `galashow-cloud-web-prod` 스택에서 `AdminBucket`, `AdminDistributionId`, `AdminUrl` 출력을 조회한다. 버킷은 `galashow-<계정>-<환경>-admin`, URL은 선택한 환경의 주소와 일치해야 한다. 역할에는 스택의 `cloudformation:DescribeStacks`, 대상 S3 조회·업로드·삭제 및 CloudFront `CreateInvalidation`/`GetInvalidation` 권한이 필요하다. 업로드 후 무효화 완료를 기다리고 HTTPS 루트와 `/login` 새로고침 경로가 같은 앱을 반환하는지 확인한다.

기존 `S3_BUCKET_DEV`/`S3_BUCKET_PROD`, `DISTRIBUTION_ID_DEV`/`DISTRIBUTION_ID_PROD`, `VITE_API_URL_DEV`/`VITE_API_URL_PROD` Secret은 사용하지 않는다. 정적 파일은 도메인 루트의 `/assets/`를 사용하며 CloudFront는 관리자 페이지의 직접 접속/새로고침을 위해 SPA 경로를 `index.html`로 제공해야 한다. CloudFront 도메인/인증서와 API CORS 설정은 [전체 도메인 전환 계획](../docs/domain-migration.md)을 따른다. 실제 AWS 배포와 운영 관리자 인증 검증은 빌드 검증과 별개다.

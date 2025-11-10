# Overlatex
`Overlatex`는 Overleaf Community Edition을 기반으로 확장한 자체 호스팅 협업 LaTeX 플랫폼입니다. 연구실, 대학, 기관 등에서 독립적인 논문 작성 환경을 구축할 수 있도록, 공개되어 있는 Overleaf 소스에 리뷰, 텍스라이브 업데이트, 사용자 관리 기능 등 다양한 기능을 제공합니다. 

기본적으로 Docker 환경에서 동작하며, 아래에서는 기본적인 빌드 방법, 시작 방법 및 환경변수들에 대해 소개를 진행합니다.
## Quick Start
빠르게 시작하는 것을 보고 싶다면 아래의 두 개의 절차를 진행해야 합니다. 본 소스가 있는 레포지토리는 서버를 실행하기 위한 파일들이 모여있는 bin파일과, sharelatex서버 이미지를 위한 overleaf/server-ce 폴더가 존재합니다. 
### Build images
```bash
cd overleaf/server-ce
make
```
첫 make 입력 시 많은 시간이 걸릴 수 있습니다. base파일 이미지 빌드 과정에서 texlive 업데이트 및 schema-full 패키지를 다운받다 보니 30~1시간 정도의 시간이 걸릴 수 있습니다. 이 기능이 필요하지 않은 분들은 `overleaf/server-ce/Dockerfile-base` 최하단에 있는 업데이트 코드를 주석처리해 주세요.
### Start Server 
서버를 시작하기 위해서는 다시 overlatex 폴더로 돌아와 `bin/init` 커맨드를 실행해야 합니다. `bin/init` 커맨드를 통해 기본적인 환경변수 설정이 진행되며, 서버 시작 전 반드시 본인의 환경에 맞게 환경변수를 조정해 주어야 합니다. 

서버의 기본 설정은 로컬환경으로, 127.0.0.1의 주소로 접속이 가능하며, 80번 포트를 사용합니다. 자세한 것은 Set Options 파트에서 확인할 수 있습니다. 

환경변수 조정이 끝났다면 `bin/up -d`로 서버를 실행할 수 있습니다. -d옵션은 백그라운드로 서버가 실행될 수 있도록 해주는 옵션으로 꼭 -d옵션을 붙이는 것을 추천드립니다. 

## Set Options 
환경 변수를 통해 서버를 환경에 맞게 설정할 수 있습니다. 우리가 건들 여러가지 환경 변수들은 기본적으로 `config/overleaf.rc` 파일에 들어있습니다. 주요한 옵션들에 대해 하나씩 알아봅시다.

- OVERLEAF_DATA_PATH
	- sharelatex 서버 실행 시 데이터가 어디에 저장될지 다루는 중요한 변수입니다. 기본설정은 bin폴더가 위치한 디렉토리의 data폴더에 저장하게 됩니다. 
-  OVERLEAF_LISTEN_IP
	- sharelatex 서버 실행 시 필요한 IP를 말합니다. nginx설정을 하지 않았다면 해당 IP를 설정해줄 필요가 있습니다. 
- OVERLEAF_PORT
	- sharelatex 서버의 포트를 설정하는 환경 변수입니다. 
- MONGO_DATA_PATH
	- mongo 서버의 데이터가 어디에 저장될지 지정하는 환경변수입니다. 
- MONGO_IMAGE
	- mongo 이미지의 이름을 저장하는 환경 변수입니다.
- MONGO_VERSION
	- mongo의 버전을 의미합니다. 
- REDIS_DATA
	- REDIS 서버의 데이터가 어디에 저장될지 지정하는 환경 변수입니다.

## References
- [Overleaf Toolkit](https://github.com/overleaf/toolkit)
- [Overleaf](https://github.com/overleaf/overleaf)
- [grandduke's sharelatex](https://github.com/GrandDuke1106/sharelatex/tree/main)

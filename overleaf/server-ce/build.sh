docker rmi sharelatex/base:dev sharelatex/sharelatex:dev
docker build -f Dockerfile-base -t sharelatex/base:dev ../ && docker build -f Dockerfile -f Dockerfile -t sharelatex/sharelatex:dev ../
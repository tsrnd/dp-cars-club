FROM minio/minio:latest

ENV MINIO_ACCESS_KEY=CarsClub
ENV MINIO_SECRET_KEY=Secret/min8
ENV MINIO_REGION=ap-northeast-1

RUN mkdir -p /export/test-bucket

EXPOSE 9000
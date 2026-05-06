FROM pgvector/pgvector:pg16

ENV POSTGRES_INITDB_ARGS="--encoding=UTF8 --lc-collate=pt_BR.UTF-8 --lc-ctype=pt_BR.UTF-8"
ENV TZ=America/Sao_Paulo
ENV PGTZ=America/Sao_Paulo

RUN apt-get update \
 && apt-get install -y --no-install-recommends locales tzdata \
 && sed -i '/pt_BR.UTF-8/s/^# //' /etc/locale.gen \
 && locale-gen \
 && ln -fs /usr/share/zoneinfo/$TZ /etc/localtime \
 && dpkg-reconfigure -f noninteractive tzdata \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

COPY init/ /docker-entrypoint-initdb.d/

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1

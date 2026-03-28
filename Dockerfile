FROM oven/bun:1 AS install

WORKDIR /temp/prod

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1 AS release

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=install /temp/prod/node_modules ./node_modules
COPY --chown=bun:bun package.json bun.lock ./
COPY --chown=bun:bun server.ts tsconfig.json ./
COPY --chown=bun:bun public ./public

RUN mkdir -p /app/db && chown -R bun:bun /app

USER bun

EXPOSE 3000

CMD ["bun", "run", "server.ts"]

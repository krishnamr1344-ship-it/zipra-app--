FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

ENV PORT=8080
ENV HOSTNAME=0.0.0.0

EXPOSE 8080

CMD ["node", "server.js"]

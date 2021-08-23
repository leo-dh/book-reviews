FROM node as builder

ARG GATSBY_API_URL
ARG PATH_PREFIX

WORKDIR /app
COPY . .

RUN echo "GATSBY_API_URL=$GATSBY_API_URL\nPATH_PREFIX=$PATH_PREFIX" > .env.production && \
    yarn --production && \
    yarn build --prefix-paths

FROM nginx:alpine
COPY --from=builder /app/public /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

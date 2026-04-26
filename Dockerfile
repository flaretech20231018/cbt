FROM node:20-slim

ARG USER_UID=1000
ARG USER_GID=1000

# node ユーザーの UID/GID をホストに合わせる（Linux で root 所有ファイルが生成される問題を防ぐ）
# GID 衝突時は既存グループをそのまま使う
RUN if [ "$USER_GID" != "1000" ]; then \
    getent group "$USER_GID" || groupmod --gid "$USER_GID" node; \
    fi \
    && usermod --uid "$USER_UID" --gid "$USER_GID" node \
    && chown -R node:node /home/node

WORKDIR /cbt
RUN chown node:node /cbt

COPY --chown=node:node package*.json ./
USER node
RUN npm ci
RUN mkdir -p /cbt/.next

COPY --chown=node:node . .

EXPOSE 3000

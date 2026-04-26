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
# npm ci より前に node に切り替える（root で実行すると node_modules が root 所有になる）
USER node
RUN npm ci
# node 権限で事前作成しておかないと無名ボリューム初期化時に root 所有になる（.next は .dockerignore で COPY 対象外のため）
RUN mkdir -p /cbt/.next

COPY --chown=node:node . .

EXPOSE 3000

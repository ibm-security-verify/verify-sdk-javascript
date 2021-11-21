#!/bin/bash

PAGES_USER="ibm-security-verify"
PAGES_REPO="ibm-security-verify.github.io"
PAGES_BRANCH="master"
DESTINATION_ROOT="${GITHUB_WORKSPACE}/docs"
SOURCE_ROOT="${GITHUB_WORKSPACE}/monorepo"

# generate privacy sdk docs
MODULE=privacy
DOC_TARGET_FOLDER="${DESTINATION_ROOT}/javascript/${MODULE}/docs"
mkdir -p "${DOC_TARGET_FOLDER}"
cd ${SOURCE_ROOT}/sdk/${MODULE} && npm i && npm run docs && cd -
cp -R ${SOURCE_ROOT}/sdk/${MODULE}/docs/. ${DOC_TARGET_FOLDER}/

# configure and push to github docs repo
cd ${SOURCE_ROOT}
MESSAGE=`git log --format=%B -n 1`
cd ${DESTINATION_ROOT}
# thanks to https://stackoverflow.com/a/64271581/5099773
git config -l | grep 'http\..*\.extraheader' | cut -d= -f1 | \
    xargs -L1 git config --unset-all
git config user.email "raghu4u449@gmail.com"
git config user.name "rramk"
git add -A
git diff-index --quiet HEAD || git commit -m "${MESSAGE}"
git push -u https://${PAGES_USER}:${GH_PAGES_TOKEN}@github.com/${PAGES_USER}/${PAGES_REPO}
